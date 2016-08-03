(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Animar = factory());
}(this, function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var ANIMATION_DEFAULTS = {
    looping: false,
    wait: 0
  };

  function animationValueReducer(animationValue, animation) {
    var currentIteration = animation.currentIteration;
    var totalIterations = animation.totalIterations;
    var easingFunction = animation.easingFunction;
    var startValue = animation.startValue;
    var changeInValue = animation.changeInValue;


    if (currentIteration < 0) {
      currentIteration = 0;
    } else if (currentIteration > totalIterations) {
      currentIteration = totalIterations;
    }

    return animationValue + easingFunction(currentIteration, startValue, changeInValue, totalIterations);
  }

  function calculateAnimationValue(animations) {
    return animations.reduce(animationValueReducer, 0);
  }

  function stepAnimation(timescale) {
    return function (animation) {
      var currentIteration = animation.currentIteration;
      var totalIterations = animation.totalIterations;
      var wait = animation.wait;
      var delay = animation.delay;
      var looping = animation.looping;


      if (currentIteration < totalIterations + wait) {
        return _extends({}, animation, { currentIteration: currentIteration + timescale });
      } else if (looping) {
        return _extends({}, animation, { currentIteration: 0 - delay });
      } else {
        return null;
      }
    };
  }

  function loopAnimation(chainOptions) {
    return function (animation) {
      return _extends({}, animation, {
        looping: true,
        wait: chainOptions.totalDuration - animation.delay - animation.totalIterations
      });
    };
  }

  function Animation (currentIteration, startValue, changeInValue, totalIterations, easingFunction, delay) {
    return {
      currentIteration: currentIteration,
      startValue: startValue,
      changeInValue: changeInValue,
      totalIterations: totalIterations,
      easingFunction: easingFunction,
      delay: delay,
      looping: ANIMATION_DEFAULTS.looping,
      wait: ANIMATION_DEFAULTS.wait
    };
  }

  function addAnimationToAttribute(animation) {
    return function (attribute) {
      return {
        model: attribute.model,
        animations: attribute.animations.concat([animation])
      };
    };
  }

  function mergeAttributes(target) {
    return function (source) {
      return {
        model: target.model,
        animations: source.animations.concat(target.animations)
      };
    };
  }

  function stepAttribute(timescale) {
    return function (attribute) {
      return _extends({}, attribute, {
        animations: attribute.animations.map(stepAnimation(timescale)).filter(function (anim) {
          return anim;
        })
      });
    };
  }

  function loopAttribute(chainOptions) {
    return function (attribute) {
      return _extends({}, attribute, {
        animations: attribute.animations.map(loopAnimation(chainOptions))
      });
    };
  }

  function calculateAttributeDisplayValue(attribute) {
    return String(attribute.model + calculateAnimationValue(attribute.animations));
  }

  function Attribute (model) {
    return {
      model: model,
      animations: []
    };
  }

  function entries(obj) {
    var output = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _key = _step.value;

        output.push([_key, obj[_key]]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return output;
  }

  function reduce(obj) {
    return function (callback, initialValue) {
      return entries(obj).reduce(function (output, _ref) {
        var _ref2 = slicedToArray(_ref, 2);

        var key = _ref2[0];
        var value = _ref2[1];
        return callback(output, value, key);
      }, initialValue);
    };
  }

  function map(obj) {
    return function (callback) {
      return reduce(obj)(function (output, value, key) {
        output[key] = callback(value);
        return output;
      }, {});
    };
  }

  function addAttributeToElement(name, attribute) {
    return function (element) {
      return {
        attributes: _extends({}, element.attributes, defineProperty({}, name, attribute))
      };
    };
  }

  function mergeElements(target) {
    return function (source) {
      return {
        attributes: reduce(target.attributes)(function (output, targetAttr, attrName) {
          var existingAttr = output[attrName];
          if (existingAttr != null) {
            output[attrName] = mergeAttributes(targetAttr)(existingAttr);
          } else {
            output[attrName] = targetAttr;
          }
          return output;
        }, source.attributes)
      };
    };
  }

  function stepElement(timescale) {
    return function (element) {
      return {
        attributes: map(element.attributes)(stepAttribute(timescale))
      };
    };
  }

  function loopElement(chainOptions) {
    return function (element) {
      return {
        attributes: map(element.attributes)(loopAttribute(chainOptions))
      };
    };
  }

  function Element () {
    return {
      attributes: {}
    };
  }

  var HOOK_DEFAULTS = {
    looping: false,
    called: false,
    wait: 0
  };

  function stepHook(timescale) {
    return function (hook) {
      var output = _extends({}, hook);

      if (output.currentIteration <= output.wait) {
        output.currentIteration = output.currentIteration + timescale;
      }

      if (output.currentIteration > 0 && !output.called) {
        output.hook();
        output.called = true;
      } else if (output.currentIteration === hook.currentIteration && output.looping) {
        output.currentIteration = 0 - output.delay;
        output.called = false;
      }

      return output;
    };
  }

  function loopHook(chainOptions) {
    return function (hook) {
      return _extends({}, hook, {
        looping: true,
        wait: chainOptions.totalDuration - hook.delay
      });
    };
  }

  function Hook (hook, currentIteration, delay) {
    return _extends({}, HOOK_DEFAULTS, {
      hook: hook, currentIteration: currentIteration, delay: delay
    });
  }

  var PluginRegistry = function () {
    function PluginRegistry() {
      classCallCheck(this, PluginRegistry);

      this.renderRegistry = {};
      this.attributePluginMapping = {};
      this.timingPlugin = null;
    }

    createClass(PluginRegistry, [{
      key: 'addRenderPlugin',
      value: function addRenderPlugin(_ref) {
        var _this = this;

        var name = _ref.name;
        var attributes = _ref.attributes;
        var render = _ref.render;

        this.renderRegistry[name] = render;
        attributes.forEach(function (attribute) {
          if (_this.attributePluginMapping[attribute] == null) _this.attributePluginMapping[attribute] = [];
          _this.attributePluginMapping[attribute].push(name);
        });
      }
    }, {
      key: 'callRenderPlugins',
      value: function callRenderPlugins(target, element) {
        var _this2 = this;

        var renderValues = reduce(element.attributes)(function (output, attr, name) {
          var mappings = _this2.attributePluginMapping[name];

          if (mappings == null) return output;

          mappings.forEach(function (mapping) {
            if (output[mapping] == null) output[mapping] = {};
            output[mapping][name] = calculateAttributeDisplayValue(attr);
          });

          return output;
        }, {});

        entries(renderValues).forEach(function (_ref2) {
          var _ref3 = slicedToArray(_ref2, 2);

          var pluginName = _ref3[0];
          var attrValues = _ref3[1];

          _this2.renderRegistry[pluginName](target, attrValues);
        });
      }
    }, {
      key: 'addTimingPlugin',
      value: function addTimingPlugin(timingPlugin) {
        if (this.tickMethod !== null) {
          console.warn('WARNING: A timing plugin was already installed, overriding...');
        }
        this.timingPlugin = timingPlugin;
      }
    }, {
      key: 'addPreset',
      value: function addPreset(_ref4) {
        var _ref4$renderPlugins = _ref4.renderPlugins;
        var renderPlugins = _ref4$renderPlugins === undefined ? [] : _ref4$renderPlugins;
        var timingPlugin = _ref4.timingPlugin;

        renderPlugins.forEach(this.addRenderPlugin.bind(this));
        if (timingPlugin != null) {
          this.addTimingPlugin(timingPlugin);
        }
      }
    }]);
    return PluginRegistry;
  }();

  // ========== CONSTANTS ==========

  var DEFAULT_EASING_FUNCTION = function DEFAULT_EASING_FUNCTION(t, b, c, d) {
    return c * t / d + b;
  }; // linear
  var DEFAULT_DELAY = 0;
  var DEFAULT_DURATION = 60;

  var initialChainOptions = function initialChainOptions() {
    return {
      delay: 0,
      currentDuration: 0,
      totalDuration: 0
    };
  };

  var EMPTY_ANIMATION_OPTIONS = {
    delay: null,
    easingFunction: null,
    duration: null
  };

  var TARGET_FRAME_DELAY = 16.67;

  // ========== STATIC FUNCTIONS ==========

  function resolveConstructorOptions() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var defaults = options.defaults || {};

    var defaultDelay = defaults.delay == null ? DEFAULT_DELAY : defaults.delay;
    var defaultEase = defaults.easingFunction == null ? DEFAULT_EASING_FUNCTION : defaults.easingFunction;
    var defaultDuration = defaults.duration == null ? DEFAULT_DURATION : defaults.duration;

    return { defaultDelay: defaultDelay, defaultEase: defaultEase, defaultDuration: defaultDuration };
  }

  // ========== TYPES ==========

  // ========== CLASS ==========

  var Animar = function () {
    function Animar(constructorOptions) {
      classCallCheck(this, Animar);

      var _resolveConstructorOp = resolveConstructorOptions(constructorOptions);

      var defaultDelay = _resolveConstructorOp.defaultDelay;
      var defaultEase = _resolveConstructorOp.defaultEase;
      var defaultDuration = _resolveConstructorOp.defaultDuration;


      this.ticking = false;
      this.elementMap = new Map();
      this.defaults = { delay: defaultDelay, easingFunction: defaultEase, duration: defaultDuration };
      this.hooks = [];
      this.firstFrame = true;
      this.previousTime = 0;
      this.registry = new PluginRegistry();
    }

    createClass(Animar, [{
      key: 'addAnimationToChain',
      value: function addAnimationToChain(start, destination, options, chainOptions, attrName, element, currentChain) {
        start -= destination;
        var newAnimation = Animation(0 - (options.delay - chainOptions.delay), start, 0 - start, options.duration, options.easingFunction, 0);

        var newAttribute = addAnimationToAttribute(newAnimation)(Attribute(destination));
        var newElement = addAttributeToElement(attrName, newAttribute)(Element());
        var tempEMap = new Map();
        tempEMap.set(element, newElement);

        return this.mergeElementMaps(tempEMap)(currentChain);
      }
    }, {
      key: 'mergeElementMaps',
      value: function mergeElementMaps(target) {
        return function (source) {
          var result = new Map(source.entries());
          target.forEach(function (element, key) {
            if (result.has(key)) {
              result.set(key, mergeElements(element)(result.get(key)));
            } else {
              result.set(key, element);
            }
          });
          return result;
        };
      }
    }, {
      key: 'resolveAnimationOptions',
      value: function resolveAnimationOptions(options) {
        return {
          delay: options.delay == null ? this.defaults.delay : options.delay,
          easingFunction: options.easingFunction == null ? this.defaults.easingFunction : options.easingFunction,
          duration: options.duration == null ? this.defaults.duration : options.duration
        };
      }
    }, {
      key: 'add',
      value: function add(element, attributes) {
        var options = arguments.length <= 2 || arguments[2] === undefined ? EMPTY_ANIMATION_OPTIONS : arguments[2];

        return this._add(element, attributes, options, initialChainOptions(), new Map(), []);
      }
    }, {
      key: '_add',
      value: function _add(element, attributes, options, chainOptions, currentChain, hooks) {
        var _this = this;

        var resolvedOptions = this.resolveAnimationOptions(options);
        Object.keys(attributes).forEach(function (attrName) {
          var attrValue = attributes[attrName];

          var start = attrValue[0],
              dest = attrValue[1];

          currentChain = _this.addAnimationToChain(start, dest, resolvedOptions, chainOptions, attrName, element, currentChain);
        });
        chainOptions.currentDuration = Math.max(chainOptions.currentDuration, resolvedOptions.delay + resolvedOptions.duration);
        return this.fullChainObjectFactory(chainOptions, currentChain, hooks);
      }
    }, {
      key: 'addHook',
      value: function addHook(hook, chainOptions, chain, hooks) {
        var newHook = Hook(hook, 0 - chainOptions.delay, chainOptions.delay);
        return this.fullChainObjectFactory(chainOptions, chain, hooks.concat([newHook]));
      }
    }, {
      key: 'fullChainObjectFactory',
      value: function fullChainObjectFactory(chainOptions, chain, hooks) {
        return {
          start: this.startChainFunctionFactory(chain, hooks),
          loop: this.loopChainFunctionFactory(chainOptions, chain, hooks),
          add: this.addChainFunctionFactory(chainOptions, chain, hooks),
          then: this.thenChainFunctionFactory(chainOptions, chain, hooks),
          hook: this.hookChainFunctionFactory(chainOptions, chain, hooks)
        };
      }
    }, {
      key: 'thenChainFunctionFactory',
      value: function thenChainFunctionFactory(chainOptions, chain, hooks) {
        var _this2 = this;

        return function () {
          var wait = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

          var newTotalDuration = chainOptions.totalDuration + chainOptions.currentDuration + wait;
          var newChainOptions = {
            totalDuration: newTotalDuration,
            delay: newTotalDuration,
            currentDuration: 0
          };
          return {
            add: _this2.addChainFunctionFactory(newChainOptions, chain, hooks),
            hook: _this2.hookChainFunctionFactory(newChainOptions, chain, hooks)
          };
        };
      }
    }, {
      key: 'addChainFunctionFactory',
      value: function addChainFunctionFactory(chainOptions, chain, hooks) {
        var _this3 = this;

        return function (element, attributes) {
          var options = arguments.length <= 2 || arguments[2] === undefined ? EMPTY_ANIMATION_OPTIONS : arguments[2];
          return _this3._add(element, attributes, options, chainOptions, chain, hooks);
        };
      }
    }, {
      key: 'loopChainFunctionFactory',
      value: function loopChainFunctionFactory(chainOptions, chain, hooks) {
        var _this4 = this;

        return function () {
          var newChainOptions = Object.assign(chainOptions, { totalDuration: chainOptions.totalDuration + chainOptions.currentDuration });
          var loopedChain = Array.from(chain.entries()).reduce(function (output, _ref) {
            var _ref2 = slicedToArray(_ref, 2);

            var key = _ref2[0];
            var value = _ref2[1];

            output.set(key, loopElement(newChainOptions)(value));
            return output;
          }, new Map());

          var loopedHooks = hooks.map(loopHook(newChainOptions));

          return { start: _this4.startChainFunctionFactory(loopedChain, loopedHooks) };
        };
      }
    }, {
      key: 'startChainFunctionFactory',
      value: function startChainFunctionFactory(chain, hooks) {
        var _this5 = this;

        return function () {
          _this5.elementMap = _this5.mergeElementMaps(chain)(_this5.elementMap);
          _this5.hooks = _this5.hooks.concat(hooks);
          _this5.requestTick();
        };
      }
    }, {
      key: 'hookChainFunctionFactory',
      value: function hookChainFunctionFactory(chainOptions, chain, hooks) {
        var _this6 = this;

        return function (hook) {
          return _this6.addHook(hook, chainOptions, chain, hooks);
        };
      }
    }, {
      key: 'requestTick',
      value: function requestTick() {
        if (!this.ticking) {
          var timingPlugin = this.registry.timingPlugin;

          if (timingPlugin != null) {
            timingPlugin(this.update.bind(this));
          } else {
            throw new Error('Attempted to animate without providing a Timing Plugin');
          }

          this.ticking = true;
        }
      }
    }, {
      key: 'update',
      value: function update(timestamp) {
        var changeInTime = timestamp - this.previousTime;
        if (this.firstFrame) {
          changeInTime = TARGET_FRAME_DELAY;
          this.firstFrame = false;
        }
        var timescale = changeInTime / TARGET_FRAME_DELAY;
        this.previousTime = timestamp;

        this.ticking = false;

        var _step = this.step(timescale, this.elementMap, this.hooks);

        var _step2 = slicedToArray(_step, 2);

        var steppedElementMap = _step2[0];
        var steppedHooks = _step2[1];

        // TODO: determine if nothing has changed to conditionally continue animating

        this.hooks = steppedHooks;
        this.elementMap = steppedElementMap;
        this.render();

        this.requestTick();
      }
    }, {
      key: 'render',
      value: function render() {
        var _this7 = this;

        this.elementMap.forEach(function (element, target) {
          _this7.registry.callRenderPlugins(target, element);
        });
      }
    }, {
      key: 'step',
      value: function step(timescale, elementMap, hooks) {
        var steppedHooks = hooks.map(stepHook(timescale)).filter(function (hook, index) {
          return hook !== hooks[index];
        });

        var steppedElementMap = Array.from(elementMap.entries()).reduce(function (output, _ref3) {
          var _ref4 = slicedToArray(_ref3, 2);

          var domRef = _ref4[0];
          var element = _ref4[1];

          output.set(domRef, stepElement(timescale)(element));
          return output;
        }, new Map());

        return [steppedElementMap, steppedHooks];
      }
    }]);
    return Animar;
  }();

  return Animar;

}));