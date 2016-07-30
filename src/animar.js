import Animation from './animation';
import Attribute, {addAnimationToAttribute} from './attribute';
import Element, {addAttributeToElement, mergeElements, loopElement, stepElement} from './element';
import Hook, {loopHook, stepHook} from './hook';
import PluginRegistry from './pluginRegistry';

// ========== CONSTANTS ==========

export const DEFAULT_EASING_FUNCTION = (t, b, c, d) => c * t / d + b; // linear
export const DEFAULT_DELAY = 0;
export const DEFAULT_DURATION = 60;

export const initialChainOptions = () => ({
  delay: 0,
  currentDuration: 0,
  totalDuration: 0
});

export const EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

const TARGET_FRAME_DELAY = 16.67;

// ========== STATIC FUNCTIONS ==========

function resolveConstructorOptions(options = {}) {
  const defaults = options.defaults || {};

  const defaultDelay = defaults.delay == null ?
    DEFAULT_DELAY : defaults.delay;
  const defaultEase = defaults.easingFunction == null ?
    DEFAULT_EASING_FUNCTION : defaults.easingFunction;
  const defaultDuration = defaults.duration == null ?
    DEFAULT_DURATION : defaults.duration;

  return { defaultDelay, defaultEase, defaultDuration };
}

// ========== PROTOTYPE ==========

const AnimarPrototype = {

  addAnimationToChain (start, destination, options, chainOptions, attrName, element, currentChain) {
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
  },

  mergeElementMaps (target) {
    return source => {
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
  },

  resolveAnimationOptions (options) {
    return {
      delay: options.delay == null ?
        this.defaults.delay : options.delay,
      easingFunction: options.easingFunction == null ?
        this.defaults.easingFunction : options.easingFunction,
      duration: options.duration == null ?
        this.defaults.duration : options.duration
    };
  },

  add (element, attributes, options = EMPTY_ANIMATION_OPTIONS) {
    return this._add(
      element,
      attributes,
      options,
      initialChainOptions(),
      new Map(),
      []
    );
  },

  _add (element, attributes, options, chainOptions, currentChain, hooks) {
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
  },

  addHook (hook, chainOptions, chain, hooks) {
    const newHook = Hook(hook, 0 - chainOptions.delay, chainOptions.delay);
    return this.fullChainObjectFactory(chainOptions, chain, hooks.concat([newHook]));
  },

  fullChainObjectFactory (chainOptions, chain, hooks) {
    return {
      start: this.startChainFunctionFactory(chain, hooks),
      loop: this.loopChainFunctionFactory(chainOptions, chain, hooks),
      add: this.addChainFunctionFactory(chainOptions, chain, hooks),
      then: this.thenChainFunctionFactory(chainOptions, chain, hooks),
      hook: this.hookChainFunctionFactory(chainOptions, chain, hooks)
    };
  },

  thenChainFunctionFactory (chainOptions, chain, hooks) {
    return (wait = 0) => {
      const newTotalDuration = chainOptions.totalDuration + chainOptions.currentDuration + wait;
      const newChainOptions = {
        totalDuration: newTotalDuration,
        currentDuration: 0,
        delay: newTotalDuration
      };
      return {
        add: this.addChainFunctionFactory(newChainOptions, chain, hooks),
        hook: this.hookChainFunctionFactory(newChainOptions, chain, hooks)
      };
    };
  },

  addChainFunctionFactory (chainOptions, chain, hooks) {
    return (element, attributes, options = EMPTY_ANIMATION_OPTIONS) =>
      this._add(element, attributes, options, chainOptions, chain, hooks);
  },

  loopChainFunctionFactory (chainOptions, chain, hooks) {
    return () => {
      const newChainOptions = Object.assign(chainOptions,
        { totalDuration: chainOptions.totalDuration + chainOptions.currentDuration }
      );

      const loopedChain = [...chain.entries()].reduce((output, [key, value]) => {
        output.set(key, loopElement(newChainOptions)(value));
        return output;
      }, new Map());

      const loopedHooks = hooks.map(loopHook(newChainOptions));

      return { start: this.startChainFunctionFactory(loopedChain, loopedHooks) };
    };
  },

  startChainFunctionFactory (chain, hooks) {
    return () => {
      this.elementMap = this.mergeElementMaps(chain)(this.elementMap);
      this.hooks = this.hooks.concat(hooks);
      this.requestTick();
    };
  },

  hookChainFunctionFactory (chainOptions, chain, hooks) {
    return hook => this.addHook(hook, chainOptions, chain, hooks);
  },

  requestTick() {
    if (!this.ticking) {
      this.registry.tickMethod(this.update.bind(this));
      this.ticking = true;
    }
  },

  update(timestamp) {
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
  },

  render() {
    this.elementMap.forEach((element, target) => {
      this.registry.callRenderPlugins(target, element);
    });
  },

  step(timescale, elementMap, hooks) {
    const steppedHooks = hooks.map(stepHook(timescale))
      .filter((hook, index) =>
        hook !== hooks.get(index)
      );

    const steppedElementMap = [...elementMap.entries()].reduce((output, [domRef, element]) => {
      output.set(domRef, stepElement(timescale)(element));
      return output;
    }, new Map());

    return [steppedElementMap, steppedHooks];
  }
};

// ========== FACTORY ==========

export default function(constructorOptions) {
  const {defaultDelay, defaultEase, defaultDuration} =
    resolveConstructorOptions(constructorOptions);

  return Object.assign(
    Object.create(AnimarPrototype),
    {
      ticking: false,
      elementMap: new Map(),
      defaults: {
        delay: defaultDelay,
        easingFunction: defaultEase,
        duration: defaultDuration
      },
      hooks: [],
      firstFrame: true,
      previousTime: 0,
      registry: PluginRegistry()
    }
  );
}
