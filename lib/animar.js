'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /* @flow */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _animation = require('./animation');

var _animation2 = _interopRequireDefault(_animation);

var _attribute = require('./attribute');

var _attribute2 = _interopRequireDefault(_attribute);

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _hook = require('./hook');

var _hook2 = _interopRequireDefault(_hook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

var TARGET_FRAME_DELAY = 16.67;

/**
 * The main Animar class which the user interacts with.
 * @public
 */

var Animar = (function () {

  /**
   * Create a new Animar instance.
   * @param {ConstructorOptions} constructorOptions
   * @public
   */

  function Animar(constructorOptions /*:?ConstructorOptions*/) {
    _classCallCheck(this, Animar);

    var resolvedOptions = constructorOptions || {};
    var resolvedDefaults = resolvedOptions.defaults || {};
    var hardwareAcceleration = resolvedOptions.hardwareAcceleration;

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
      easingFunction: function easingFunction(t, b, c, d) {
        return c * t / d + b;
      }, // linear easing function
      duration: 60
    }, resolvedDefaults);

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

    /**
     * Flag to determine if the current frame is the first frame in a requestTick call
     * @type {boolean}
     * @private
     */
    this.firstFrame = true;

    /**
     * The timestamp of the previous frame rendering.
     * @type {number}
     * @private
     */
    this.previousTime = 0;
  }

  /**
   * Begin animation new animation chain and add an animation to the first chain step.
   * @param {HTMLElement} element - HTML DOM element to animate.
   * @param {AttributesOptions} attributes
   * @param {AnimationOptions} options
   * @returns {FullChainObject}
   * @public
   */

  _createClass(Animar, [{
    key: 'add',
    value: function add(element /*:HTMLElement*/, attributes /*:AttributesOptions*/, options /*:AnimationOptions*/) {
      var resolvedOptions = options || EMPTY_ANIMATION_OPTIONS;

      return this._add(element, attributes, resolvedOptions, {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      }, new Map(), []);
    }

    /**
     * Merge element maps, with the target map's properties taking priority.
     * @param {ElementMap} src - The original source map.
     * @param {ElementMap} target - The target map to merge.
     * @returns {ElementMap} The merged {@link ElementMap}
     * @private
     */

  }, {
    key: 'mergeElementMaps',
    value: function mergeElementMaps(src /*:ElementMap*/, target /*:ElementMap*/) {
      var result = new Map(src);

      target.forEach(function (element, elementRef) {
        var mergedElement = undefined;

        var existingElement = result.get(elementRef);
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

  }, {
    key: 'resolveAnimationOptions',
    value: function resolveAnimationOptions(options /*:AnimationOptions*/) {
      return {
        delay: options.delay == null ? this.defaults.delay : options.delay,
        easingFunction: options.easingFunction == null ? this.defaults.easingFunction : options.easingFunction,
        duration: options.duration == null ? this.defaults.duration : options.duration
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

  }, {
    key: '_add',
    value: function _add(element /*:HTMLElement*/, attributes /*:AttributesOptions*/, options /*:AnimationOptions*/, chainOptions /*:ChainOptions*/, currentChain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var _this = this;

      var resolvedOptions = this.resolveAnimationOptions(options);
      Object.keys(attributes).forEach(function (attribute) {
        var attributeValue = attributes[attribute];

        var start = attributeValue[0],
            destination = attributeValue[1];

        currentChain = _this.addAnimationToChain(start, destination, resolvedOptions, chainOptions, attribute, element, currentChain);
      });
      chainOptions.currentDuration = Math.max(chainOptions.currentDuration, resolvedOptions.delay + resolvedOptions.duration);
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

  }, {
    key: 'addAnimationToChain',
    value: function addAnimationToChain(start /*:number*/, destination /*:number*/, resolvedOptions /*:ResolvedAnimationOptions*/, chainOptions /*:ChainOptions*/, attribute /*:string*/, element /*:HTMLElement*/, currentChain /*:ElementMap*/) {
      start -= destination;
      var newAnimation = new _animation2.default(0 - (resolvedOptions.delay + chainOptions.delay), start, 0 - start, resolvedOptions.duration, resolvedOptions.easingFunction, false, resolvedOptions.delay + chainOptions.delay, 0);

      var newAttribute = new _attribute2.default(attribute, destination);
      newAttribute.addAnimation(newAnimation);

      var newElement = new _element2.default(element);
      newElement.addAttribute(attribute, newAttribute);

      var tempEMap = new Map();
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

  }, {
    key: 'addHook',
    value: function addHook(hook /*:Function*/, chainOptions /*:ChainOptions*/, chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var newHook = new _hook2.default(hook, 0 - chainOptions.delay, false, chainOptions.delay, 0);
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

  }, {
    key: 'fullChainObjectFactory',
    value: function fullChainObjectFactory(chainOptions /*:ChainOptions*/, chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
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

  }, {
    key: 'thenChainFunctionFactory',
    value: function thenChainFunctionFactory(chainOptions /*:ChainOptions*/, chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var _this2 = this;

      return function () {
        var wait = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        var newChainOptions = Object.create(chainOptions);
        newChainOptions.totalDuration += chainOptions.currentDuration + wait;
        newChainOptions.currentDuration = 0;
        newChainOptions.delay = newChainOptions.totalDuration;
        return {
          add: _this2.addChainFunctionFactory(newChainOptions, chain, hooks),
          hook: _this2.hookChainFunctionFactory(newChainOptions, chain, hooks)
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

  }, {
    key: 'addChainFunctionFactory',
    value: function addChainFunctionFactory(chainOptions /*:ChainOptions*/, chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var _this3 = this;

      return function (element, attributes, options) {
        var resolvedOptions = options || EMPTY_ANIMATION_OPTIONS;
        return _this3._add(element, attributes, resolvedOptions, chainOptions, chain, hooks);
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

  }, {
    key: 'loopChainFunctionFactory',
    value: function loopChainFunctionFactory(chainOptions /*:ChainOptions*/, chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var _this4 = this;

      return function () {
        chainOptions.totalDuration += chainOptions.currentDuration;

        var newElementMap = new Map();
        chain.forEach(function (element, elementRef) {
          element.loop(chainOptions);
          newElementMap.set(elementRef, element);
        });
        chain = newElementMap;

        hooks.forEach(function (hook) {
          hook.loop(chainOptions);
        });

        return {
          start: _this4.startChainFunctionFactory(chain, hooks)
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

  }, {
    key: 'startChainFunctionFactory',
    value: function startChainFunctionFactory(chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var _this5 = this;

      return function () {
        _this5.elementMap = _this5.mergeElementMaps(_this5.elementMap, chain);
        _this5.hooks = _this5.hooks.concat(hooks);
        _this5.requestTick();
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

  }, {
    key: 'hookChainFunctionFactory',
    value: function hookChainFunctionFactory(chainOptions /*:ChainOptions*/, chain /*:ElementMap*/, hooks /*:Array<Hook>*/) {
      var _this6 = this;

      return function (hook) {
        return _this6.addHook(hook, chainOptions, chain, hooks);
      };
    }

    /**
     * Request to start the requestAnimationFrame loop.
     * @private
     */

  }, {
    key: 'requestTick',
    value: function requestTick() {
      if (!this.ticking) {
        window.requestAnimationFrame(this.update.bind(this));
        this.ticking = true;
      }
    }

    /**
     * Move the instance's elementMap one step forward and render the changes to the DOM if anything changed in the step.
     * @private
     */

  }, {
    key: 'update',
    value: function update(timestamp /*:number*/) {
      var changeInTime = timestamp - this.previousTime;
      if (this.firstFrame) {
        changeInTime = TARGET_FRAME_DELAY;
        this.firstFrame = false;
      }
      var timescale = changeInTime / TARGET_FRAME_DELAY;
      this.previousTime = timestamp;

      this.ticking = false;
      var hasChanged = this.step(timescale);

      if (hasChanged) {
        this.render();
        this.requestTick();
      } else {
        this.firstFrame = true;
      }
    }

    /**
     * Render the instance's element map to the DOM.
     * @private
     */

  }, {
    key: 'render',
    value: function render() {
      var _this7 = this;

      this.elementMap.forEach(function (element) {
        element.render(_this7.hardwareAcceleration);
      });
    }

    /**
     * Step the instance's element map forward.`
     * @param {number} timescale
     * @returns {boolean} - Anything has changed from stepping forward.
     * @private
     */

  }, {
    key: 'step',
    value: function step(timescale /*:number*/) {
      var _this8 = this;

      var somethingChanged = false;

      this.elementMap.forEach(function (element) {
        if (element.step(timescale)) {
          somethingChanged = true;
        }
      });

      var newHooks = this.hooks.map(function (hook) {
        if (hook.step(timescale)) {
          return hook;
        }
      });

      this.hooks = [];
      newHooks.forEach(function (hook) {
        if (hook != null) {
          _this8.hooks.push(hook);
        }
      });

      return somethingChanged;
    }
  }]);

  return Animar;
})();

exports.default = Animar;