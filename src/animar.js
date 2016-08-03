/* @flow */

import { ElementType, EasingFunction, ConstructorOptions, ChainOptions, HookFunction } from './types';
import Animation from './animation';
import Attribute, {addAnimationToAttribute} from './attribute';
import Element, {addAttributeToElement, mergeElements, loopElement, stepElement} from './element';
import Hook, {loopHook, stepHook} from './hook';
import PluginRegistry from './pluginRegistry';

// ========== CONSTANTS ==========

export const DEFAULT_EASING_FUNCTION: EasingFunction = (t, b, c, d) => c * t / d + b; // linear
export const DEFAULT_DELAY = 0;
export const DEFAULT_DURATION = 60;

export const initialChainOptions = () => ({
  delay:           0,
  currentDuration: 0,
  totalDuration:   0
});

export const EMPTY_ANIMATION_OPTIONS = {
  delay:          null,
  easingFunction: null,
  duration:       null
};

const TARGET_FRAME_DELAY = 16.67;

// ========== STATIC FUNCTIONS ==========

function resolveConstructorOptions (options = {}) : { defaultDelay: number, defaultEase: EasingFunction, defaultDuration: number } {
  const defaults = options.defaults || {};

  const defaultDelay = defaults.delay == null ?
    DEFAULT_DELAY : defaults.delay;
  const defaultEase = defaults.easingFunction == null ?
    DEFAULT_EASING_FUNCTION : defaults.easingFunction;
  const defaultDuration = defaults.duration == null ?
    DEFAULT_DURATION : defaults.duration;

  return { defaultDelay, defaultEase, defaultDuration };
}

// ========== TYPES ==========

type ElementMap = Map<any, Element>;

type AnimationOptions = {
  delay:          ?number,
  easingFunction: ?EasingFunction,
  duration:       ?number
};

type ResolvedAnimationOptions = {
  delay:          number,
  easingFunction: EasingFunction,
  duration:       number
};


type AttributeOptions = { [attributeName: string]: [number, number] };

// ========== CLASS ==========

class Animar {
  ticking:      boolean;
  elementMap:   ElementMap;
  hooks:        Array<Hook>;
  firstFrame:   boolean;
  previousTime: number;
  registry:     PluginRegistry;
  defaults: {
    delay:          number,
    easingFunction: EasingFunction,
    duration:       number
  };

  constructor(constructorOptions: ConstructorOptions) {
    const {defaultDelay, defaultEase, defaultDuration} =
      resolveConstructorOptions(constructorOptions);

    this.ticking      = false;
    this.elementMap   = new Map();
    this.defaults     = { delay: defaultDelay, easingFunction: defaultEase, duration: defaultDuration };
    this.hooks        = [];
    this.firstFrame   = true;
    this.previousTime = 0;
    this.registry     = new PluginRegistry();
  }

  addAnimationToChain (
    start:        number,
    destination:  number,
    options:      ResolvedAnimationOptions,
    chainOptions: ChainOptions,
    attrName:     string,
    element:      any,
    currentChain: ElementMap
  ): ElementMap {
    start -= destination;
    const newAnimation = Animation(
      0 - (options.delay - chainOptions.delay),
      start,
      0 - start,
      options.duration,
      options.easingFunction,
      0
    );

    const newAttribute = addAnimationToAttribute(newAnimation)(Attribute(destination));
    const newElement = addAttributeToElement(attrName, newAttribute)(Element());
    const tempEMap = new Map();
    tempEMap.set(element, newElement);

    return this.mergeElementMaps(tempEMap)(currentChain);
  }

  mergeElementMaps (target: ElementMap) {
    return (source: ElementMap): ElementMap => {
      const result = new Map(source.entries());
      target.forEach((element, key) => {
        if (result.has(key)) {
          result.set(key, mergeElements(element)(result.get(key)));
        } else {
          result.set(key, element);
        }
      });
      return result;
    };
  }

  resolveAnimationOptions (options: AnimationOptions): ResolvedAnimationOptions {
    return {
      delay: options.delay == null ?
        this.defaults.delay : options.delay,
      easingFunction: options.easingFunction == null ?
        this.defaults.easingFunction : options.easingFunction,
      duration: options.duration == null ?
        this.defaults.duration : options.duration
    };
  }

  add (element: any, attributes: AttributeOptions, options: AnimationOptions = EMPTY_ANIMATION_OPTIONS) {
    return this._add(element, attributes, options, initialChainOptions(), new Map(), []);
  }

  _add(element: any, attributes: AttributeOptions, options: AnimationOptions, chainOptions: ChainOptions, currentChain: ElementMap, hooks: Array<Hook>) {
    const resolvedOptions = this.resolveAnimationOptions(options);
    Object.keys(attributes).forEach(attrName => {
      const attrValue = attributes[attrName];

      const start = attrValue[0],
        dest = attrValue[1];

      currentChain = this.addAnimationToChain(start, dest, resolvedOptions, chainOptions, attrName, element, currentChain);
    });
    chainOptions.currentDuration = Math.max(chainOptions.currentDuration,
      resolvedOptions.delay + resolvedOptions.duration
    );
    return this.fullChainObjectFactory(chainOptions, currentChain, hooks);
  }

  addHook (hook: HookFunction, chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    const newHook = Hook(hook, 0 - chainOptions.delay, chainOptions.delay);
    return this.fullChainObjectFactory(chainOptions, chain, hooks.concat([newHook]));
  }

  fullChainObjectFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return {
      start: this.startChainFunctionFactory(chain, hooks),
      loop:  this.loopChainFunctionFactory(chainOptions, chain, hooks),
      add:   this.addChainFunctionFactory(chainOptions, chain, hooks),
      then:  this.thenChainFunctionFactory(chainOptions, chain, hooks),
      hook:  this.hookChainFunctionFactory(chainOptions, chain, hooks)
    };
  }

  thenChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return (wait : number = 0) => {
      const newTotalDuration = chainOptions.totalDuration + chainOptions.currentDuration + wait;
      const newChainOptions = {
        totalDuration:   newTotalDuration,
        delay:           newTotalDuration,
        currentDuration: 0
      };
      return {
        add:  this.addChainFunctionFactory(newChainOptions, chain, hooks),
        hook: this.hookChainFunctionFactory(newChainOptions, chain, hooks)
      };
    };
  }

  addChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return (element: ElementType, attributes: AttributeOptions, options : AnimationOptions = EMPTY_ANIMATION_OPTIONS) =>
      this._add(element, attributes, options, chainOptions, chain, hooks);
  }

  loopChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return () => {
      const newChainOptions = Object.assign(chainOptions,
        { totalDuration: chainOptions.totalDuration + chainOptions.currentDuration }
      );
      const loopedChain = Array.from(chain.entries()).reduce((output, [key, value]) => {
        output.set(key, loopElement(newChainOptions)(value));
        return output;
      }, new Map());

      const loopedHooks = hooks.map(loopHook(newChainOptions));

      return { start: this.startChainFunctionFactory(loopedChain, loopedHooks) };
    };
  }

  startChainFunctionFactory (chain: ChainOptions, hooks: Array<Hook>) {
    return () => {
      this.elementMap = this.mergeElementMaps(chain)(this.elementMap);
      this.hooks = this.hooks.concat(hooks);
      this.requestTick();
    };
  }

  hookChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return (hook: HookFunction) => this.addHook(hook, chainOptions, chain, hooks);
  }

  requestTick(): void {
    if (!this.ticking) {
      const timingPlugin = this.registry.timingPlugin;

      if (timingPlugin != null) {
        timingPlugin(this.update.bind(this));
      } else {
        throw new Error('Attempted to animate without providing a Timing Plugin');
      }

      this.ticking = true;
    }
  }

  update(timestamp: number): void {
    let changeInTime = timestamp - this.previousTime;
    if (this.firstFrame) {
      changeInTime = TARGET_FRAME_DELAY;
      this.firstFrame = false;
    }
    const timescale = changeInTime / TARGET_FRAME_DELAY;
    this.previousTime = timestamp;

    this.ticking = false;
    const [steppedElementMap, steppedHooks] = this.step(timescale, this.elementMap, this.hooks);

    // TODO: determine if nothing has changed to conditionally continue animating
    this.hooks = steppedHooks;
    this.elementMap = steppedElementMap;
    this.render();

    this.requestTick();
  }

  render(): void {
    this.elementMap.forEach((element, target) => {
      this.registry.callRenderPlugins(target, element);
    });
  }

  step(timescale: number, elementMap: ElementMap, hooks: Array<Hook>) {
    const steppedHooks: Array<Hook> = hooks.map(stepHook(timescale))
      .filter((hook, index) =>
        hook !== hooks[index]
      );

    const steppedElementMap: ElementMap = Array.from(elementMap.entries()).reduce((output, [domRef, element]) => {
      output.set(domRef, stepElement(timescale)(element));
      return output;
    }, new Map());

    return [steppedElementMap, steppedHooks];
  }
}

export default Animar;
