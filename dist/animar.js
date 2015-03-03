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

	var Animar = function() {
	    this.elementMap = new Map();
	    this.ticking = false;
	};

	Animar.prototype.add = function(element, attributes, options) {
	  return this._add(element, attributes, options, { delay: 0, currentDuration: 0, totalDuration: 0, animationList: [] });
	};

	Animar.prototype._add = function(element, attributes, options, chainOptions) {

	  var self = this; // maintain reference to Animar instance

	  // manage options defaults
	  options = options || {};
	  options.delay = options.delay || 0;

	  for (var attribute in attributes) {
	    /* istanbul ignore else */
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

	      var currentAnimation = this._addAnimation(element, attribute, destination, attrOptions);
	      chainOptions.animationList.push(currentAnimation);
	    }
	  }

	  chainOptions.currentDuration = Math.max(chainOptions.currentDuration, options.delay + options.duration);

	  return { // chaining functions
	    and: self._andChainFunction(chainOptions),
	    then: self._thenChainFunction(chainOptions),
	    loop: self._loopChainFunction(chainOptions)
	  };
	};

	Animar.prototype._andChainFunction = function(chainOptions) {
	  var self = this;
	  return function(element, attributes, options) {
	    return self._add(element, attributes, options, chainOptions);
	  };
	};

	Animar.prototype._thenChainFunction = function(chainOptions) {
	  var self = this; // maintain reference to Animar instance through the forEach calls
	  return function(element, attributes, options) {
	    chainOptions.totalDuration = chainOptions.totalDuration + chainOptions.currentDuration;
	    chainOptions.currentDuration = 0;
	    chainOptions.delay = chainOptions.totalDuration;
	    return self._add(element, attributes, options, chainOptions);
	  };
	};

	Animar.prototype._loopChainFunction = function(chainOptions) {
	  return function() {
	    chainOptions.totalDuration = chainOptions.totalDuration + chainOptions.currentDuration;
	    for (var i = 0; i < chainOptions.animationList.length; i++) {
	      var anim = chainOptions.animationList[i];
	      anim.loop = true;
	      anim.wait = chainOptions.totalDuration - anim.delay - anim.totalIterations;
	    }
	  };
	};

	Animar.prototype._addAnimation = function(element, attribute, destination, options) {
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
	  var currentAnimation = this._addAnimationToMap(newAnimation);
	  this._requestTick();
	  return currentAnimation;
	};

	Animar.prototype._addAnimationToMap = function(args) {
	  if (!this.elementMap.has(args.element)) {
	    this.elementMap.set(args.element, new Map());
	  }
	  return this._addAnimationToElement(this.elementMap.get(args.element),args);
	};

	Animar.prototype._addAnimationToElement = function(attributeMap, args) {
	  if (!attributeMap.has(args.attribute)) {
	    attributeMap = this._createAttribute(attributeMap,args);
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

	Animar.prototype._createAttribute = function(attributeMap, animation) {
	  var newAttributeObject = {
	    model: animation.start,
	    animations: []
	  };
	  attributeMap.set(animation.attribute, newAttributeObject);
	  return attributeMap;
	};

	Animar.prototype._update = function() {
	  var animationsRemaining = this._renderDOM();
	  this._stepFrame();
	  this.ticking = false;
	  if (animationsRemaining) {
	    this._requestTick();
	  }
	};

	Animar.prototype._requestTick = function() {
	  if (!this.ticking) {
	    window.requestAnimationFrame(this._update.bind(this));
	    this.ticking = true;
	  }
	};

	Animar.prototype._calculateAnimationValue = function(animations) {
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

	Animar.prototype._applyStyle = function(element, attribute, value) {
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

	Animar.prototype._renderDOM = function() {
	  var self = this; // maintain reference to Animar instance through the forEach calls
	  var animated = false;
	  self.elementMap.forEach(function(value, key) {
	    var targetElement = key;
	    var transformValue = "";
	    value.forEach(function(value, key) {
	      var targetAttribute = String(key);
	      if ( value.animations.length !== 0 ) {
	        animated = true;
	        var targetValue = value.model + self._calculateAnimationValue(value.animations),
	            pxRegex = /(perspective)|(translate[XYZ])/,
	            degRegex = /rotate[XYZ]?/;
	        if (Constants.TRANSFORM_ATTRIBUTES.indexOf(targetAttribute) !== -1) {
	          var unit = ((pxRegex.test(targetAttribute)) ? "px" : (degRegex.test(targetAttribute) ? "deg" : ""));
	          transformValue += targetAttribute + "(" + targetValue + unit + ") ";
	        } else {
	          self._applyStyle(targetElement, targetAttribute, targetValue);
	        }
	      }
	    });
	    if (transformValue !== "") {
	      transformValue += "translateZ(0)";
	      self._applyStyle(targetElement, "transform", transformValue);
	    }
	  });
	  return animated;
	};

	Animar.prototype._stepFrame = function() {
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

/***/ }
/******/ ])