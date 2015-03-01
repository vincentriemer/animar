/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var EasingFactory = __webpack_require__(1),
	    Helper = __webpack_require__(2),
	    Constants = __webpack_require__(3);

	__webpack_require__(4);  // TODO: Remove dependancy

	var Animar = function() {
	    this.elementMap = new Map();
	    this.ticking = false;
	};

	Animar.prototype.createAttribute = function(attributeMap, animation) {
	  var newAttributeObject = {
	    model: animation.start,
	    animations: []
	  };
	  attributeMap.set(animation.attribute, newAttributeObject);
	  return attributeMap;
	};

	Animar.prototype.addAnimationToElement = function(attributeMap, args) {
	  if (!attributeMap.has(args.attribute)) {
	    attributeMap = this.createAttribute(attributeMap,args);
	  }
	  var currentAttribute = attributeMap.get(args.attribute),
	    startValue  = currentAttribute.model - args.destination,
	    changeInValue = 0 - startValue;

	  currentAttribute.model = args.destination;

	  var currentAnimation = {
	    currentIteration: 0 - args.delay,
	    startValue: startValue,
	    changeInValue: changeInValue,
	    totalIterations: args.duration,
	    easingFunction: args.ease,
	    loop: args.loop,
	    delay: args.delay,
	    wait: args.wait
	  };
	  currentAttribute.animations.push(currentAnimation);
	  return currentAnimation;
	};


	Animar.prototype.addAnimationToMap = function(args) {
	  if (!this.elementMap.has(args.element)) {
	    this.elementMap.set(args.element, new Map());
	  }
	  return this.addAnimationToElement(this.elementMap.get(args.element),args);
	};


	Animar.prototype.addAnimation = function(element, attribute, destination, options) {
	  options = options || {};

	  // DEFAULTS & PARAMETER TRANSFORMATION
	  options.easing = options.easing || 'linear';
	  options.easing = typeof options.easing === 'string' ? EasingFactory[options.easing]() : options.easing;
	  options.duration = options.duration || 60;
	  options.loop = options.loop || false;
	  options.delay = options.delay || 0;
	  options.start = options.start === undefined ? Helper.getStartValue([element, attribute]) : options.start;
	  options.wait = options.wait || 0;

	  var newAnimation = {
	    element: element,
	    attribute: attribute,
	    start: options.start,
	    destination: destination,
	    duration: options.duration,
	    ease: options.easing,
	    delay: options.delay,
	    loop: options.loop,
	    wait: options.wait
	  };
	  var currentAnimation = this.addAnimationToMap(newAnimation);
	  this.requestTick();
	  return currentAnimation;
	};

	Animar.prototype.add = function(element, attributes, options) {
	  return this._add(element, attributes, options, { delay: 0, currentDuration: 0, totalDuration: 0, animationList: [] });
	};

	Animar.prototype._add = function(element, attributes, options, chainOptions) {

	  var self = this;

	  // manage options defaults
	  options = options || {};
	  options.delay = options.delay || 0;
	  options.wait = options.wait || 0;

	  for (var attribute in attributes) {
	    if (attributes.hasOwnProperty(attribute)) {
	      var start, destination;
	      var attributeValue = attributes[attribute];

	      if (typeof attributeValue === 'number') {
	        destination = attributeValue;
	      } else {
	        start = attributeValue[0];
	        destination = attributeValue[1];
	      }

	      var attrOptions = {
	        start: start,
	        duration: options.duration,
	        easing: options.easing,
	        delay: options.delay + chainOptions.delay,
	        loop: options.loop
	      };

	      var currentAnimation = this.addAnimation(element, attribute, destination, attrOptions);
	      chainOptions.animationList.push(currentAnimation);
	    }
	  }

	  chainOptions.currentDuration = Math.max(chainOptions.currentDuration, options.delay + options.duration);

	  return { // chaining functions
	    and: self.andChainFunction(chainOptions),
	    then: self.thenChainFunction(chainOptions),
	    loop: self.loopChainFunction(chainOptions)
	  };
	};

	Animar.prototype.andChainFunction = function(chainOptions) {
	  var self = this;
	  return function(element, attributes, options) {
	    return self._add(element, attributes, options, chainOptions);
	  };
	};

	Animar.prototype.thenChainFunction = function(chainOptions) {
	  var self = this;
	  return function(element, attributes, options) {
	    chainOptions.totalDuration = chainOptions.totalDuration + chainOptions.currentDuration;
	    chainOptions.currentDuration = 0;
	    chainOptions.delay = chainOptions.totalDuration;
	    return self._add(element, attributes, options, chainOptions);
	  };
	};

	Animar.prototype.loopChainFunction = function(chainOptions) {
	  return function() {
	    chainOptions.totalDuration = chainOptions.totalDuration + chainOptions.currentDuration;
	    for (var i = 0; i < chainOptions.animationList.length; i++) {
	      var anim = chainOptions.animationList[i];
	      anim.loop = true;
	      anim.wait = chainOptions.totalDuration - anim.delay - anim.totalIterations;
	    }
	  };
	};


	Animar.prototype.calculateAnimationValue = function(animations) {
	  var result = 0;
	  animations.forEach(function(value) {
	    var currentIteration = value.currentIteration;
	    if (value.currentIteration < 0) {
	      currentIteration = 0;
	    }
	    if (value.currentIteration >= value.totalIterations) {
	      currentIteration = value.totalIterations;
	    }
	    result += value.easingFunction(currentIteration, value.startValue, value.changeInValue, value.totalIterations);
	  });
	  return result;
	};


	Animar.prototype.applyStyle = function(element, attribute, value) {
	  switch(attribute) {
	    case("transform"):
	      Helper.setTransform(element, value);
	      break;
	    case("opacity"):
	      element.style.opacity = value;
	      break;
	    case("perspective"):
	      element.style.perspective = value;
	      element.style.webkitPerspective = value;
	      break;
	  }
	};


	Animar.prototype.renderDOM = function() {
	  var self = this; // maintain reference to Animar instance through the forEach calls
	  var animated = false;
	  self.elementMap.forEach(function(value, key) {
	    var targetElement = key;
	    var transformValue = "";
	    value.forEach(function(value, key) {
	      var targetAttribute = String(key);
	      if ( value.animations.length !== 0 ) {
	        animated = true;
	        var targetValue = value.model + self.calculateAnimationValue(value.animations),
	            pxRegex = /(perspective)|(translate[XYZ])/,
	            degRegex = /rotate[XYZ]?/;
	        if (Constants.TRANSFORM_ATTRIBUTES.indexOf(targetAttribute) !== -1) {
	          var unit = ((pxRegex.test(targetAttribute)) ? "px" : (degRegex.test(targetAttribute) ? "deg" : ""));
	          transformValue += targetAttribute + "(" + targetValue + unit + ") ";
	        } else {
	          self.applyStyle(targetElement, targetAttribute, targetValue);
	        }
	      }
	    });
	    if (transformValue !== "") {
	      transformValue += "translateZ(0)";
	      self.applyStyle(targetElement, "transform", transformValue);
	    }
	  });
	  return animated;
	};


	Animar.prototype.stepFrame = function() {
	  var elementMap = this.elementMap;
	  elementMap.forEach(function(value) {
	    value.forEach(function(value) {
	      var updatedAnimations = [];
	      value.animations.forEach(function(value) {
	        if (value.currentIteration < (value.totalIterations + value.wait)) {
	          value.currentIteration += 1;
	          updatedAnimations.push(value);
	        } else if (value.loop) {
	          value.currentIteration = 0 - value.delay;
	          updatedAnimations.push(value);
	        }
	      });
	      value.animations = updatedAnimations;
	    });
	  });
	};


	Animar.prototype.update = function() {
	  var animationsRemaining = this.renderDOM();
	  this.stepFrame();
	  this.ticking = false;
	  if (animationsRemaining) { 
	    this.requestTick();
	  }
	};


	Animar.prototype.requestTick = function() {
	  if (!this.ticking) {
	    window.requestAnimationFrame(this.update.bind(this));
	    this.ticking = true;
	  }
	};

	module.exports = Animar;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var EasingFactory = {
	  linear: function() {
	    return function(t, b, c, d) {
	      return c*t/d + b;
	    };
	  },
	  quadratic_in: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      return c*t*t + b;
	    };
	  },
	  quadratic_out: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      return -c * t*(t-2) + b;
	    };
	  },
	  quadratic_in_out: function() {
	    return function(t, b, c, d) {
	      t /= d/2;
	      if (t < 1) { return c/2*t*t + b; }
	      t--;
	      return -c/2 * (t*(t-2) - 1) + b;
	    };
	  },
	  cubic_in: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      return c*t*t*t + b;
	    };
	  },
	  cubic_out: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      t--;
	      return c*(t*t*t + 1) + b;
	    };
	  },
	  cubic_in_out: function() {
	    return function(t, b, c, d) {
	      t /= d/2;
	      if (t < 1) { return c/2*t*t*t + b; }
	      t -= 2;
	      return c/2*(t*t*t + 2) + b;
	    };
	  },
	  quartic_in: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      return c*t*t*t*t + b;
	    };
	  },
	  quartic_out: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      t--;
	      return -c * (t*t*t*t - 1) + b;
	    };
	  },
	  quartic_in_out: function() {
	    return function(t, b, c, d) {
	      t /= d/2;
	      if (t < 1) { return c/2*t*t*t*t + b; }
	      t -= 2;
	      return -c/2 * (t*t*t*t - 2) + b;
	    };
	  },
	  quintic_in: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      return c*t*t*t*t*t + b;
	    };
	  },
	  quintic_out: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      t--;
	      return c*(t*t*t*t*t + 1) + b;
	    };
	  },
	  quintic_in_out: function() {
	    return function(t, b, c, d) {
	      t /= d/2;
	      if (t < 1) { return c/2*t*t*t*t*t + b; }
	      t -= 2;
	      return c/2*(t*t*t*t*t + 2) + b;
	    };
	  },
	  sinusoidal_in: function()  {
	    return function(t, b, c, d) {
	      return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	    };
	  },
	  sinusoidal_out: function()  {
	    return function(t, b, c, d) {
	      return c * Math.sin(t/d * (Math.PI/2)) + b;
	    };
	  },
	  sinusoidal_in_out: function()  {
	    return function(t, b, c, d) {
	      return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	    };
	  },
	  exponential_in: function()  {
	    return function(t, b, c, d) {
	      return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
	    };
	  },
	  exponential_out: function()  {
	    return function(t, b, c, d) {
	      return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
	    };
	  },
	  exponential_in_out: function()  {
	    return function(t, b, c, d) {
	      t /= d/2;
	      if (t < 1) { return c/2 * Math.pow( 2, 10 * (t - 1) ) + b; }
	      t--;
	      return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
	    };
	  },
	  circular_in: function() {
	    return function(t, b, c, d) {
	      t /= d;
	      return -c * (Math.sqrt(1 - t*t) - 1) + b;
	    };
	  },
	  circular_out: function()  {
	    return function(t, b, c, d) {
	      t /= d;
	      t--;
	      return c * Math.sqrt(1 - t*t) + b;
	    };
	  },
	  circular_in_out: function()  {
	    return function(t, b, c, d) {
	      t /= d/2;
	      if (t < 1) { return -c/2 * (Math.sqrt(1 - t*t) - 1) + b; }
	      t -= 2;
	      return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
	    };
	  }
	};

	module.exports = EasingFactory;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Helper = {
	  
	    setTransform: function(element, transformString) {
	      element.style.webkitTransform = transformString;
	      element.style.MozTransform = transformString;
	      element.style.msTransform = transformString;
	      element.style.OTransform = transformString;
	      element.style.transform = transformString;
	      return element;
	    },

	    getTransformMatrix: function(element) {
	      var computedStyle = window.getComputedStyle(element, null);
	      /* istanbul ignore next */ // no need to test for all the browser prefixes
	      var transformString = computedStyle.getPropertyValue("-webkit-transform") ||
	                            computedStyle.getPropertyValue("-moz-transform") ||
	                            computedStyle.getPropertyValue("-ms-transform") ||
	                            computedStyle.getPropertyValue("-o-transform") ||
	                            computedStyle.getPropertyValue("transform") ||
	                            'woops'; // TODO: throw error
	      if (transformString === 'none') { transformString = "matrix(1, 0, 0, 1, 0, 0)"; }
	      var values = transformString.split('(')[1].split(')')[0].split(',');
	      values = values.map(function(x) { return parseFloat(x, 10); } );
	      return values;
	    },

	    getTranslateX: function(element) {
	      var values = this.getTransformMatrix(element);
	      return values[4];
	    },

	    getTranslateY: function(element) {
	      var values = this.getTransformMatrix(element);
	      return values[5];
	    },

	    getScaleX: function(element) {
	      var values = this.getTransformMatrix(element);
	      return Math.sqrt(Math.pow(values[0], 2) + Math.pow(values[1], 2));
	    },

	    getScaleY: function(element) {
	      var values = this.getTransformMatrix(element);
	      return Math.sqrt(Math.pow(values[2], 2) + Math.pow(values[3], 2));
	    },

	    getRotation: function(element) {
	      var values = this.getTransformMatrix(element);
	      return Math.round(Math.atan2(values[1], values[0]) * (180/Math.PI));
	    },

	    getOpacity: function(element) {
	      var computedStyle = window.getComputedStyle(element, null);
	      return parseFloat(computedStyle.getPropertyValue("opacity"));
	    },

	    getStartValue: function(animation) {
	      var result;
	      switch(animation[1]) {
	        case('opacity'):
	          result = this.getOpacity(animation[0]);
	          break;
	        case('translateX'):
	          result = this.getTranslateX(animation[0]);
	          break;
	        case('translateY'):
	          result = this.getTranslateY(animation[0]);
	          break;
	        case('scaleX'):
	          result = this.getScaleX(animation[0]);
	          break;
	        case('scaleY'):
	          result = this.getScaleY(animation[0]);
	          break;
	        case('rotate'):
	          result = this.getRotation(animation[0]);
	          break;
	        /* istanbul ignore next */ 
	        default:
	          result = 0; // TODO: throw an error
	      }
	      return result;
	    }
	};

	module.exports = Helper;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Constants = {
	  TRANSFORM_ATTRIBUTES: ["translateX", "translateY", "translateZ", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "rotateZ"]
	};

	module.exports = Constants;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {(function (exports) {'use strict';
	  //shared pointer
	  var i;
	  //shortcuts
	  var defineProperty = Object.defineProperty, is = function(a,b) { return isNaN(a)? isNaN(b): a === b; };


	  //Polyfill global objects
	  if (typeof WeakMap == 'undefined') {
	    exports.WeakMap = createCollection({
	      // WeakMap#delete(key:void*):boolean
	      'delete': sharedDelete,
	      // WeakMap#clear():
	      clear: sharedClear,
	      // WeakMap#get(key:void*):void*
	      get: sharedGet,
	      // WeakMap#has(key:void*):boolean
	      has: mapHas,
	      // WeakMap#set(key:void*, value:void*):void
	      set: sharedSet
	    }, true);
	  }

	  if (typeof Map == 'undefined') {
	    exports.Map = createCollection({
	      // WeakMap#delete(key:void*):boolean
	      'delete': sharedDelete,
	      //:was Map#get(key:void*[, d3fault:void*]):void*
	      // Map#has(key:void*):boolean
	      has: mapHas,
	      // Map#get(key:void*):boolean
	      get: sharedGet,
	      // Map#set(key:void*, value:void*):void
	      set: sharedSet,
	      // Map#keys(void):Iterator
	      keys: sharedKeys,
	      // Map#values(void):Iterator
	      values: sharedValues,
	      // Map#entries(void):Iterator
	      entries: mapEntries,
	      // Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
	      forEach: sharedForEach,
	      // Map#clear():
	      clear: sharedClear
	    });
	  }

	  if (typeof Set == 'undefined') {
	    exports.Set = createCollection({
	      // Set#has(value:void*):boolean
	      has: setHas,
	      // Set#add(value:void*):boolean
	      add: sharedAdd,
	      // Set#delete(key:void*):boolean
	      'delete': sharedDelete,
	      // Set#clear():
	      clear: sharedClear,
	      // Set#keys(void):Iterator
	      keys: sharedValues, // specs actually say "the same function object as the initial value of the values property"
	      // Set#values(void):Iterator
	      values: sharedValues,
	      // Set#entries(void):Iterator
	      entries: setEntries,
	      // Set#forEach(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
	      forEach: sharedSetIterate
	    });
	  }

	  if (typeof WeakSet == 'undefined') {
	    exports.WeakSet = createCollection({
	      // WeakSet#delete(key:void*):boolean
	      'delete': sharedDelete,
	      // WeakSet#add(value:void*):boolean
	      add: sharedAdd,
	      // WeakSet#clear():
	      clear: sharedClear,
	      // WeakSet#has(value:void*):boolean
	      has: setHas
	    }, true);
	  }


	  /**
	   * ES6 collection constructor
	   * @return {Function} a collection class
	   */
	  function createCollection(proto, objectOnly){
	    function Collection(a){
	      if (!this || this.constructor !== Collection) return new Collection(a);
	      this._keys = [];
	      this._values = [];
	      this.objectOnly = objectOnly;

	      //parse initial iterable argument passed
	      if (a) init.call(this, a);
	    }

	    //define size for non object-only collections
	    if (!objectOnly) {
	      defineProperty(proto, 'size', {
	        get: sharedSize
	      });
	    }

	    //set prototype
	    proto.constructor = Collection;
	    Collection.prototype = proto;

	    return Collection;
	  }


	  /** parse initial iterable argument passed */
	  function init(a){
	    var i;
	    //init Set argument, like `[1,2,3,{}]`
	    if (this.add)
	      a.forEach(this.add, this);
	    //init Map argument like `[[1,2], [{}, 4]]`
	    else
	      a.forEach(function(a){this.set(a[0],a[1])}, this);
	  }


	  /** delete */
	  function sharedDelete(key) {
	    if (this.has(key)) {
	      this._keys.splice(i, 1);
	      this._values.splice(i, 1);
	    }
	    // Aurora here does it while Canary doesn't
	    return -1 < i;
	  };

	  function sharedGet(key) {
	    return this.has(key) ? this._values[i] : undefined;
	  }

	  function has(list, key) {
	    if (this.objectOnly && key !== Object(key))
	      throw new TypeError("Invalid value used as weak collection key");
	    //NaN or 0 passed
	    if (key != key || key === 0) for (i = list.length; i-- && !is(list[i], key);){}
	    else i = list.indexOf(key);
	    return -1 < i;
	  }

	  function setHas(value) {
	    return has.call(this, this._values, value);
	  }

	  function mapHas(value) {
	    return has.call(this, this._keys, value);
	  }

	  /** @chainable */
	  function sharedSet(key, value) {
	    this.has(key) ?
	      this._values[i] = value
	      :
	      this._values[this._keys.push(key) - 1] = value
	    ;
	    return this;
	  }

	  /** @chainable */
	  function sharedAdd(value) {
	    if (!this.has(value)) this._values.push(value);
	    return this;
	  }

	  function sharedClear() {
	    this._values.length = 0;
	  }

	  /** keys, values, and iterate related methods */
	  function sharedKeys() {
	    return sharedIterator(this._keys);
	  }

	  function sharedValues() {
	    return sharedIterator(this._values);
	  }

	  function mapEntries() {
	    return sharedIterator(this._keys, this._values);
	  }

	  function setEntries() {
	    return sharedIterator(this._values, this._values);
	  }

	  function sharedIterator(array, array2) {
	    var j = 0, done = false;
	    return {
	      next: function() {
	        var v;
	        if (!done && j < array.length) {
	          v = array2 ? [array[j], array2[j]]: array[j];
	          j += 1;
	        } else {
	          done = true;
	        }
	        return { done: done, value: v };
	      }
	    };
	  }

	  function sharedSize() {
	    return this._values.length;
	  }

	  function sharedForEach(callback, context) {
	    var self = this;
	    var values = self._values.slice();
	    self._keys.slice().forEach(function(key, n){
	      callback.call(context, values[n], key, self);
	    });
	  }

	  function sharedSetIterate(callback, context) {
	    var self = this;
	    self._values.slice().forEach(function(value){
	      callback.call(context, value, value, self);
	    });
	  }

	})(typeof exports != 'undefined' && typeof global != 'undefined' ? global : window );
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])