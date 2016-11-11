/* @flow */

import { ElementType, EasingFunction, ConstructorOptions, ChainOptions, HookFunction } from './types';
import Animation from './animation';
import Attribute, {addAnimationToAttribute} from './attribute';
import Element, {addAttributeToElement, mergeElements, loopElement, stepElement} from './element';
import Hook, {loopHook, stepHook} from './hook';
import PluginRegistry from './pluginRegistry';
import { reduce } from './objUtils';

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

function resolveConstructorOptions (defaults = {}) : { defaultDelay: number, defaultEase: EasingFunction, defaultDuration: number } {
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

type AttributeOptions = { [attributeName: string]: number };

type AnimarState = {
  ticking:      boolean,
  elementMap:   ElementMap,
  hooks:        Array<Hook>,
  firstFrame:   boolean,
  previousTime: number,
  registry:     PluginRegistry,
  defaults: {
    delay:          number,
    easingFunction: EasingFunction,
    duration:       number
  }
};

type FactoryOutput = {
  add: Function,
  set: Function,
  addPreset: Function,
  addRenderPlugin: Function,
  addTimingPlugin: Function,
  state?: Object
};

// ========== STATIC FUNCTIONS ==========

function addAnimationToChain (
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
    0 - (options.delay + chainOptions.delay),
    start,
    0 - start,
    options.duration,
    options.easingFunction,
    options.delay + chainOptions.delay
  );

  const newAttribute = addAnimationToAttribute(newAnimation)(Attribute(destination));
  const newElement = addAttributeToElement(attrName, newAttribute)(Element());
  const tempEMap = new Map();
  tempEMap.set(element, newElement);

  return mergeElementMaps(tempEMap)(currentChain);
}

function mergeElementMaps (target: ElementMap) {
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

// ========== FACTORY ==========

export default function Animar(constructorOptions: ConstructorOptions) {
  const {defaultDelay, defaultEase, defaultDuration} = resolveConstructorOptions(constructorOptions);

  const state: AnimarState = {
    ticking: false,
    firstFrame: true,
    previousTime: 0,
    elementMap: new Map(),
    defaults: { delay: defaultDelay, easingFunction: defaultEase, duration: defaultDuration },
    hooks: [],
    registry: new PluginRegistry()
  };

  // ========== MEMBER FUNCTIONS ==========

  function resolveAnimationOptions (options: AnimationOptions): ResolvedAnimationOptions {
    return {
      delay: options.delay == null ?
        state.defaults.delay : options.delay,
      easingFunction: options.easingFunction == null ?
        state.defaults.easingFunction : options.easingFunction,
      duration: options.duration == null ?
        state.defaults.duration : options.duration
    };
  }

  function set(element: any, attributes: AttributeOptions) {
    const tempEMap = new Map();

    const addedElement = reduce(attributes)((output, model, attrName) =>
      addAttributeToElement(attrName, Attribute(model))(output),
    Element());

    tempEMap.set(element, addedElement);
    state.elementMap = mergeElementMaps(tempEMap)(state.elementMap);

    return { add: add, set: set };
  }

  function add (element: any, attributes: AttributeOptions, options: AnimationOptions = EMPTY_ANIMATION_OPTIONS) {
    return _add(element, attributes, options, initialChainOptions(), new Map(), []);
  }

  function _add(element: any, attributes: AttributeOptions, options: AnimationOptions, chainOptions: ChainOptions, currentChain: ElementMap, hooks: Array<Hook>) {
    const resolvedOptions = resolveAnimationOptions(options);
    Object.keys(attributes).forEach(attrName => {
      const destination = attributes[attrName];

      const start = getStartValue(element, attrName, currentChain);

      if (start != null) {
        currentChain = addAnimationToChain(start, destination, resolvedOptions, chainOptions, attrName, element, currentChain);
      }
    });

    chainOptions.currentDuration = Math.max(chainOptions.currentDuration,
      resolvedOptions.delay + resolvedOptions.duration
    );
    return fullChainObjectFactory(chainOptions, currentChain, hooks);
  }

  function getStartValue(element: any, attrName: string, currentChain: ElementMap): ?number {
    const currentChainElement = currentChain.get(element);
    const stateElement = state.elementMap.get(element);

    if (currentChainElement != null &&
        currentChainElement.attributes != null &&
        currentChainElement.attributes[attrName] != null) {
      const currentChainAttribute = currentChainElement.attributes[attrName];
      if (currentChainAttribute != null) {
        return currentChainAttribute.model;
      }
    } else if (stateElement != null &&
               stateElement.attributes != null &&
               stateElement.attributes[attrName] != null) {
      const stateAttribute = stateElement.attributes[attrName];
      if (stateAttribute != null) {
        return stateAttribute.model;
      }
    } else {
      throw new Error(`${element} does not have ${attrName} set`);
    }
  }

  function addHook (hook: HookFunction, chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    const newHook = Hook(hook, 0 - chainOptions.delay, chainOptions.delay);
    return fullChainObjectFactory(chainOptions, chain, hooks.concat([newHook]));
  }

  function fullChainObjectFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return {
      start: startChainFunctionFactory(chain, hooks),
      loop:  loopChainFunctionFactory(chainOptions, chain, hooks),
      add:   addChainFunctionFactory(chainOptions, chain, hooks),
      then:  thenChainFunctionFactory(chainOptions, chain, hooks),
      hook:  hookChainFunctionFactory(chainOptions, chain, hooks)
    };
  }

  function thenChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return (wait : number = 0) => {
      const newTotalDuration = chainOptions.totalDuration + chainOptions.currentDuration + wait;
      const newChainOptions = {
        totalDuration:   newTotalDuration,
        delay:           newTotalDuration,
        currentDuration: 0
      };
      return {
        add:  addChainFunctionFactory(newChainOptions, chain, hooks),
        hook: hookChainFunctionFactory(newChainOptions, chain, hooks)
      };
    };
  }

  function addChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return (element: ElementType, attributes: AttributeOptions, options : AnimationOptions = EMPTY_ANIMATION_OPTIONS) =>
      _add(element, attributes, options, chainOptions, chain, hooks);
  }

  function loopChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return () => {
      const newChainOptions = Object.assign(chainOptions,
        { totalDuration: chainOptions.totalDuration + chainOptions.currentDuration }
      );
      const loopedChain = Array.from(chain.entries()).reduce((output, [key, value]) => {
        output.set(key, loopElement(newChainOptions)(value));
        return output;
      }, new Map());

      const loopedHooks = hooks.map(loopHook(newChainOptions));

      return { start: startChainFunctionFactory(loopedChain, loopedHooks) };
    };
  }

  function hookChainFunctionFactory (chainOptions: ChainOptions, chain: ElementMap, hooks: Array<Hook>) {
    return (hook: HookFunction) => addHook(hook, chainOptions, chain, hooks);
  }

  function startChainFunctionFactory (chain: ChainOptions, hooks: Array<Hook>) {
    return () => {
      state.elementMap = mergeElementMaps(chain)(state.elementMap);
      state.hooks = state.hooks.concat(hooks);
      requestTick();
    };
  }

  function update(timestamp: number): void {
    let changeInTime = timestamp - state.previousTime;
    if (state.firstFrame) {
      changeInTime = TARGET_FRAME_DELAY;
      state.firstFrame = false;
    }
    const timescale = changeInTime / TARGET_FRAME_DELAY;
    state.previousTime = timestamp;

    state.ticking = false;
    const [steppedElementMap, steppedHooks] = step(timescale, state.elementMap, state.hooks);

    // TODO: determine if nothing has changed to conditionally continue animating
    state.hooks = steppedHooks;
    state.elementMap = steppedElementMap;

    render();
    requestTick();
  }

  function render(): void {
    state.elementMap.forEach((element, target) => {
      state.registry.callRenderPlugins(target, element);
    });
  }

  function requestTick(): void {
    if (!state.ticking) {
      const timingPlugin = state.registry.timingPlugin;

      if (timingPlugin != null) {
        timingPlugin(update);
      } else {
        throw new Error('Attempted to animate without providing a Timing Plugin');
      }

      state.ticking = true;
    }
  }

  function step(timescale: number, elementMap: ElementMap, hooks: Array<Hook>) {
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

  // expose public functions
  const factoryOutput: FactoryOutput = {
    add: add,
    set: set,
    addPreset: state.registry.addPreset.bind(state.registry),
    addRenderPlugin: state.registry.addRenderPlugin.bind(state.registry),
    addTimingPlugin: state.registry.addTimingPlugin.bind(state.registry)
  };

  // expose the state for testing
  if (process.env.NODE_ENV === 'test') {
    factoryOutput.state = state;
  }

  return factoryOutput;
}
