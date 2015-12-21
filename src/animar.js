/* @flow */
import Animation from './animation';
import Attribute from './attribute';
import Element from './element';
import Hook from './hook';

// NOTE: All flow type definitions are currently in comment form due to them causing issues with esdoc.

/**
 * Map used by Animar to store all animation data.
 * @typedef {Map<HTMLElement, Element>} ElementMap
 * @private
 */
/*:: type ElementMap = Map<HTMLElement, Element>; */

/**
 * Options to dictate animation-wide behavior.
 * @typedef {Object} AnimationOptions
 * @property {?number} delay - The amount of ticks to wait before beginning animation.
 * @property {?function} easingFunction = The easing function used by the animation to change how the animation moves over time.
 * @property {?number} duration - The amount of time the animation will take.
 * @public
 *
 * @example
 * let animationOptions = {
 *   delay: 0,
 *   easingFunction: (t, b, c, d) => c * t / d + b,
 *   duration: 60
 * }
 */
/*:: type AnimationOptions = {
  delay: ?any,
  easingFunction: ?any,
  duration: ?any
}; */

/**
 * Resolved options (no null properties) to pass into {@link Animar#_add}.
 * @typedef {Object} ResolvedAnimationOptions
 * @property {number} delay - The amount of ticks to wait before beginning animation.
 * @property {function} easingFunction = The easing function used by the animation to change how the animation moves over time.
 * @property {number} duration - The amount of time the animation will take.
 * @private
 */
/*:: type ResolvedAnimationOptions = {
  delay: number,
  easingFunction: Function,
  duration: number
}; */

/**
 * Options that specify which attribute will be animated as well as the start and end value of the animation.
 * @typedef {Object<string, Array<number>>} AttributesOptions
 * @public
 *
 * @example
 * let attributesOptions = {
 *   translateX: [0, 100],
 *   translateY: [0, 200]
 * };
 */
/*:: export type AttributesOptions = { [key: string]: Array<number> }; */

/**
 * Options used to keep track of the animation's chain.
 * @typedef {Object} ChainOptions
 * @property {number} delay - The amount of ticks to wait for the animations in the current chain step.
 * @property {number} currentDuration - The current duration of the current animation chain step.
 * @property {number} totalDuration - The current duration of the entire animation chain.
 * @private
 */
/*:: export type ChainOptions = {
  delay: number,
  currentDuration: number,
  totalDuration: number
} */

/**
 * Add a new animation to the current chain.
 * @typedef {function(element: HTMLElement, attributes :AttributesOptions, options: AnimationOptions): FullChainObject} AddFunction
 * @public
 */
/*:: type AddFunction = (element:HTMLElement, attributes:AttributesOptions, options:AnimationOptions) => FullChainObject; */

/**
 * Start the animation chain.
 * @typedef {function(): void} StartFunction
 * @public
 */
/*:: type StartFunction = () => void; */

/**
 * Object returned by {@link ThenFunction}
 * @typedef {Object} ThenPayload
 * @property {AddFunction} add
 * @property {HookFunction} hook
 * @public
 */

/**
 * Add a new step to the animation chain.
 * @typedef {function(wait: number): ThenPayload} ThenFunction
 * @public
 */
/*:: type ThenFunction = (wait:number) => { add: AddFunction }; */

/** Object returned by {@link LoopFunction}
 * @typedef {Object} LoopPayload
 * @property {StartFunction} start
 * @public
 */

/**
 * Loop the entire animation chain.
 * @typedef {function(): LoopPayload} LoopFunction
 * @public
 */
/*:: type LoopFunction = () => { start: StartFunction }; */

/**
 * An object which contains every chain function.
 * @typedef {Object} FullChainObject
 * @property {StartFunction} start - Start animating the animation chain.
 * @property {LoopFunction} loop - Loop the entire animation chain.
 * @property {AddFunction} add - Add an animation to the current chain step.
 * @property {ThenFunction} then - Start a new chain step.
 * @property {HookFunction} hook - Add an arbitrary function to the animation chain.
 * @public
 */
/*:: type FullChainObject = {
  start: StartFunction,
  loop: LoopFunction,
  add: AddFunction,
  then: ThenFunction,
  hook: HookFunction
}; */

/**
 * Object that has holds Animar's default values
 * @typedef {Object} Defaults
 * @property {number} delay - The default amount of ticks to wait before animating.
 * @property {function} easingFunction - The default easing function to change rate at which the animated value changes.
 * @property {number} duration - The default number of ticks that an animation should run for.
 * @public
 */
/*:: type Defaults = { delay: number, easingFunction: Function, duration: number }; */

/**
 * The options object passed into Animar's constructor
 * @typedef {Object} ConstructorOptions
 * @property {Defaults} defaults - The values to default to when not provided to {@link Animar#add}
 * @property {boolean} hardwareAcceleration - Determines whether or not to force animating using the GPU.
 * @public
 */
/*:: type ConstructorOptions = {
  defaults:Defaults,
  hardwareAcceleration:boolean
}; */

/**
 * Add an arbitrary function to the animation chain.
 * @typedef {function(hook: function): FullChainObject} HookFunction
 * @public
 */
/*:: type HookFunction = (hook:Function) => FullChainObject */

const EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

/**
 * The main Animar class which the user interacts with.
 * @public
 */
export default class Animar {
  ticking:boolean;
  elementMap:ElementMap;
  defaults:Defaults;
  timescale:number;
  hardwareAcceleration:boolean;
  hooks:Array<Hook>;

  /**
   * Create a new Animar instance.
   * @param {ConstructorOptions} constructorOptions
   * @public
   */
  constructor (constructorOptions:?ConstructorOptions) {
    let resolvedOptions = constructorOptions || {};
    let resolvedDefaults = resolvedOptions.defaults || {};
    let hardwareAcceleration = resolvedOptions.hardwareAcceleration;

    /**
     * Whether or not the animar instance is currently animating.
     * @type {boolean}
     * @private
     */
    this.ticking = false;
    /**
     * @type {ElementMap}
     * @private
     */
    this.elementMap = new Map();
    /**
     * Animar instance's default animation option values
     * @type {Defaults}
     * @public
     */
    this.defaults = Object.assign({
      delay: 0,
      easingFunction: (t, b, c, d) => {
        return c * t / d + b;
      }, // linear easing function
      duration: 60
    }, resolvedDefaults);
    /**
     * How fast the animations should run (`1` is real-time).
     * @type {number}
     * @public
     */
    this.timescale = 1;
    /**
     * Whether or not to force animating using the GPU
     * @type {boolean}
     * @public
     */
    this.hardwareAcceleration = hardwareAcceleration == null ? true : hardwareAcceleration;

    /**
     * List of all the pending function hooks in this animar instance.
     * @type {Array}
     * @private
     */
    this.hooks = [];
  }

  /**
   * Begin animation new animation chain and add an animation to the first chain step.
   * @param {HTMLElement} element - HTML DOM element to animate.
   * @param {AttributesOptions} attributes
   * @param {AnimationOptions} options
   * @returns {FullChainObject}
   * @public
   */
  add (element:HTMLElement, attributes:AttributesOptions, options:AnimationOptions):FullChainObject {
    let resolvedOptions = options || EMPTY_ANIMATION_OPTIONS;

    return this._add(
      element,
      attributes,
      resolvedOptions,
      {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      },
      new Map(),
      []
    );
  }

  /**
   * Merge element maps, with the target map's properties taking priority.
   * @param {ElementMap} src - The original source map.
   * @param {ElementMap} target - The target map to merge.
   * @returns {ElementMap} The merged {@link ElementMap}
   * @private
   */
  mergeElementMaps (src:ElementMap, target:ElementMap):ElementMap {
    let result = new Map(src);

    target.forEach((element, elementRef) => {
      let mergedElement;

      let existingElement = result.get(elementRef);
      if (existingElement != null) {
        mergedElement = existingElement.merge(element);
      } else {
        mergedElement = element;
      }
      result.set(elementRef, mergedElement);
    });

    return result;
  }

  /**
   * Resolve the {@link AnimationOptions} object by replacing all unprovided properties with their defaults.
   * @param {AnimationOptions} options
   * @returns {ResolvedAnimationOptions}
   * @private
   */
  resolveAnimationOptions (options:AnimationOptions):ResolvedAnimationOptions {
    return {
      delay: options.delay == null ?
        this.defaults.delay : options.delay,
      easingFunction: options.easingFunction == null ?
        this.defaults.easingFunction : options.easingFunction,
      duration: options.duration == null ?
        this.defaults.duration : options.duration
    };
  }

  /**
   * Internal add function that adds an animation to the current chain step.
   * @param {HTMLElement} element - HTML DOM element to animate.
   * @param {AttributesOptions} attributes
   * @param {AnimationOptions} options
   * @param {ChainOptions} chainOptions
   * @param {ElementMap} currentChain - The element map of the current chain (has not yet been merged with the instance element map).
   * @param {Array<Hook>} hooks
   * @returns {FullChainObject}
   * @private
   */
  _add (element:HTMLElement,
       attributes:AttributesOptions,
       options:AnimationOptions,
       chainOptions:ChainOptions,
       currentChain:ElementMap,
       hooks:Array<Hook>):FullChainObject {
    let resolvedOptions = this.resolveAnimationOptions(options);
    Object.keys(attributes).forEach((attribute) => {
      const attributeValue = attributes[attribute];

      let start = attributeValue[0],
        destination = attributeValue[1];

      currentChain = this.addAnimationToChain(start, destination, resolvedOptions, chainOptions, attribute,
        element, currentChain);
    });
    chainOptions.currentDuration = Math.max(chainOptions.currentDuration,
      resolvedOptions.delay + resolvedOptions.duration);
    return this.fullChainObjectFactory(chainOptions, currentChain, hooks);
  }

  /**
   * Add an animation to the current chain.
   * @param {number} start
   * @param {number} destination
   * @param {ResolvedAnimationOptions} resolvedOptions
   * @param {ChainOptions} chainOptions
   * @param {string} attribute
   * @param {HTMLElement} element
   * @param {ElementMap} currentChain
   * @returns {ElementMap}
   * @private
   */
  addAnimationToChain (start:number,
                      destination:number,
                      resolvedOptions:ResolvedAnimationOptions,
                      chainOptions:ChainOptions,
                      attribute:string,
                      element:HTMLElement,
                      currentChain:ElementMap):ElementMap {
    start -= destination;
    let newAnimation = new Animation(
      0 - (resolvedOptions.delay + chainOptions.delay),
      start,
      0 - start,
      resolvedOptions.duration,
      resolvedOptions.easingFunction,
      false,
      resolvedOptions.delay + chainOptions.delay,
      0
    );

    let newAttribute = new Attribute(attribute, destination);
    newAttribute.addAnimation(newAnimation);

    let newElement = new Element(element);
    newElement.addAttribute(attribute, newAttribute);

    let tempEMap = new Map();
    tempEMap.set(element, newElement);

    return this.mergeElementMaps(currentChain, tempEMap);
  }

  /**
   * Add an arbitrary function hook to the animation chain.
   * @param hook
   * @param chainOptions
   * @param chain
   * @param hooks
   * @private
   */
  addHook (hook:Function, chainOptions:ChainOptions, chain:ElementMap, hooks:Array<Hook>):FullChainObject {
    let newHook = new Hook(hook, 0 - chainOptions.delay, false, chainOptions.delay, 0);
    hooks.push(newHook);
    return this.fullChainObjectFactory(chainOptions, chain, hooks);
  }

  /**
   * Create a new chain object that contains all of the chain functions.
   * @param chainOptions
   * @param chain
   * @param hooks
   * @returns {FullChainObject}
   * @private
   */
  fullChainObjectFactory (chainOptions:ChainOptions, chain:ElementMap, hooks:Array<Hook>):FullChainObject {
    return {
      start: this.startChainFunctionFactory(chain, hooks),
      loop: this.loopChainFunctionFactory(chainOptions, chain, hooks),
      add: this.addChainFunctionFactory(chainOptions, chain, hooks),
      then: this.thenChainFunctionFactory(chainOptions, chain, hooks),
      hook: this.hookChainFunctionFactory(chainOptions, chain, hooks)
    };
  }

  /**
   * Create a new function that starts a new chain step.
   * @param {ChainOptions} chainOptions
   * @param {ElementMap} chain
   * @param hooks
   * @returns {ThenFunction}
   * @private
   */
  thenChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap, hooks:Array<Hook>):ThenFunction {
    return (wait = 0) => {
      let newChainOptions = Object.create(chainOptions);
      newChainOptions.totalDuration += (chainOptions.currentDuration + wait);
      newChainOptions.currentDuration = 0;
      newChainOptions.delay = newChainOptions.totalDuration;
      return {
        add: this.addChainFunctionFactory(newChainOptions, chain, hooks),
        hook: this.hookChainFunctionFactory(newChainOptions, chain, hooks)
      };
    };
  }

  /**
   * Create a new function which adds a new animation to the current chain step.
   * @param {ChainOptions} chainOptions
   * @param {ElementMap} chain
   * @param hooks
   * @returns {AddFunction}
   * @private
   */
  addChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap, hooks:Array<Hook>):AddFunction {
    return (element, attributes, options) => {
      let resolvedOptions = options || EMPTY_ANIMATION_OPTIONS;
      return this._add(element, attributes, resolvedOptions, chainOptions, chain, hooks);
    };
  }

  /**
   * Create a new function which will loop the entire animation chain.
   * @param {ChainOptions} chainOptions
   * @param {ElementMap} chain
   * @param hooks
   * @returns {LoopFunction}
   * @private
   */
  loopChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap, hooks:Array<Hook>):LoopFunction {
    return () => {
      chainOptions.totalDuration += chainOptions.currentDuration;

      let newElementMap = new Map();
      chain.forEach((element, elementRef) => {
        element.loop(chainOptions);
        newElementMap.set(elementRef, element);
      });
      chain = newElementMap;

      hooks.forEach(hook => {
        hook.loop(chainOptions);
      });

      return {
        start: this.startChainFunctionFactory(chain, hooks)
      };
    };
  }

  /**
   * Create a new function which will start animating the chain.
   * @param {ElementMap} chain
   * @param hooks
   * @returns {StartFunction}
   * @private
   */
  startChainFunctionFactory (chain:ElementMap, hooks:Array<Hook>):StartFunction {
    return () => {
      this.elementMap = this.mergeElementMaps(this.elementMap, chain);
      this.hooks = this.hooks.concat(hooks);
      this.requestTick();
    };
  }

  /**
   * Create a new function which will hook an arbitrary function to the animation chain.
   * @param chainOptions
   * @param chain
   * @param hooks
   * @returns {Function}
   * @private
   */
  hookChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap, hooks:Array<Hook>):HookFunction {
    return (hook) => {
      return this.addHook(hook, chainOptions, chain, hooks);
    };
  }

  /**
   * Request to start the requestAnimationFrame loop.
   * @private
   */
  requestTick () {
    if (!this.ticking) {
      window.requestAnimationFrame(this.update.bind(this));
      this.ticking = true;
    }
  }

  /**
   * Move the instance's elementMap one step forward and render the changes to the DOM if anything changed in the step.
   * @private
   */
  update () {
    this.ticking = false;
    var hasChanged = this.step();

    if (hasChanged) {
      this.render();
      this.requestTick();
    }
  }

  /**
   * Render the instance's element map to the DOM.
   * @private
   */
  render () {
    this.elementMap.forEach(element => {
      element.render(this.hardwareAcceleration);
    });
  }

  /**
   * Step the instance's element map forward.`
   * @returns {boolean} - Anything has changed from stepping forward.
   * @private
   */
  step ():boolean {
    let somethingChanged = false;

    this.elementMap.forEach(element => {
      if (element.step(this.timescale)) {
        somethingChanged = true;
      }
    });

    let newHooks = this.hooks.map(hook => {
      if (hook.step(this.timescale)) {
        return hook;
      }
    });

    this.hooks = [];
    newHooks.forEach(hook => {
      if (hook != null) { this.hooks.push(hook); }
    });

    return somethingChanged;
  }
}
