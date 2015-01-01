(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// imports
var EasingFactory   = require("./ease"),
    AnimatedElement = require("./element"),
    Helper          = require("./helper"),
    Constant        = require("./constants");


var Animar = function() {
    this.elementMap = new Map();
    this.ticking = false;
};


Animar.prototype.addAnimationToMap = function(args)
{
  if (!this.elementMap.has(args.element)) {
    this.elementMap.set(args.element, new AnimatedElement());
  }
  this.elementMap.get(args.element).addAnimation(args);
};


Animar.prototype.addAnimation = function(args)
{
  var element = args.element,
    attribute = args.attribute,
    destination = args.destination,
    duration = args.duration,
    easingFunction = args.easingFunction;

  if (typeof easingFunction === 'string') {
    easingFunction = EasingFactory[easingFunction]();
  }

  var newAnimation = {
    element: element,
    attribute: attribute,
    destination: destination,
    duration: duration,
    ease: easingFunction
  };
  this.addAnimationToMap(newAnimation);
  this.requestTick();
};


Animar.prototype.calculateAnimationValue = function(animations)
{
  var result = 0;
  animations.forEach(function(value) {
    result += value.easingFunction(value.currentIteration, value.startValue, value.changeInValue, value.totalIterations);
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
  }
};


Animar.prototype.renderDOM = function() {
  var self = this; // maintain reference to Animar instance through the forEach calls
  var animated = false;
  self.elementMap.forEach(function(value, key) {
    var targetElement = key;
    var transformValue = "";
    value.attributeMap.forEach(function(value, key) {
      animated = true;
      var targetAttribute = key;
      var targetValue = value.model + self.calculateAnimationValue(value.animations);
      if (Constant.TRANSFORM_ATTRIBUTES.indexOf(targetAttribute) !== -1) {
        // determine the units necessary for the specified transform
        var unit = ((targetAttribute === "translateX" || targetAttribute === "translateY") ? "px" : (targetAttribute === "rotate" ? "deg" : ""));
        transformValue += targetAttribute + "(" + targetValue + unit + ") ";
      } else {
        self.applyStyle(targetElement, targetAttribute, targetValue);
      }
    });
    if (transformValue !== "") {
      self.applyStyle(targetElement, "transform", transformValue);
    }
  });
  return animated;
};


Animar.prototype.stepFrame = function() {
  var elementMap = this.elementMap;
  elementMap.forEach(function(value) {
    var attributeMap = value.attributeMap;
    attributeMap.forEach(function(value) {
      var updatedAnimations = [];
      value.animations.forEach(function(value) {
        if (value.currentIteration !== value.totalIterations) {
          value.currentIteration += 1;
          updatedAnimations.push(value);
        }
      });
      value.animations = updatedAnimations;
    });
    value.attributeMap = attributeMap;
  });
};


Animar.prototype.update = function() {
  var animationsRemaining = this.renderDOM();
  
  this.stepFrame();

  this.ticking = false;
  if (animationsRemaining) { this.requestTick(); }
};


Animar.prototype.requestTick = function() {
  if (!this.ticking) {
    window.requestAnimationFrame(this.update.bind(this));
    this.ticking = true;
  }
};

module.exports = Animar;
},{"./constants":2,"./ease":3,"./element":4,"./helper":5}],2:[function(require,module,exports){
var Constants = {
  TRANSFORM_ATTRIBUTES: ["translateX", "translateY", "scaleX", "scaleY", "rotate"]
};

module.exports = Constants;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
// imports
var Helper = require('./helper');

var Element = function() {
  this.attributeMap = new Map();
};

Element.prototype.addAnimation = function(args) {
  if (!this.attributeMap.has(args.attribute)) {
    this.createAttribute(args);
  }

  var currentAttribute = this.attributeMap.get(args.attribute),
      startValue       = currentAttribute.model - args.destination,
      changeInValue    = 0 - startValue,
      totalIterations  = args.duration,
      easingFunction   = args.ease;

  currentAttribute.model = args.destination;
  currentAttribute.animations.push({
    "currentIteration" : 0,
    "startValue"       : startValue,
    "changeInValue"    : changeInValue,
    "totalIterations"  : totalIterations,
    "easingFunction"   : easingFunction
  });
};

Element.prototype.getStartValue = function(animation) {
  var result;
  switch(animation.attribute) {
    case('opacity'):
      result = Helper.getOpacity(animation.element);
      break;
    case('translateX'):
      result = Helper.getTranslateX(animation.element);
      break;
    case('translateY'):
      result = Helper.getTranslateY(animation.element);
      break;
    case('scaleX'):
      result = Helper.getScaleX(animation.element);
      break;
    case('scaleY'):
      result = Helper.getScaleY(animation.element);
      break;
    case('rotate'):
      result = Helper.getRotation(animation.element);
      break;
    default:
      result = 0; // TODO: throw an error
  }
  return result;
};

Element.prototype.createAttribute = function(animation) {
  var startValue = animation.startValue || this.getStartValue(animation);
  
  var newAttributeObject = {
    "model": startValue,
    "animations": []
  };
  this.attributeMap.set(animation.attribute, newAttributeObject);
};

module.exports = Element;
},{"./helper":5}],5:[function(require,module,exports){
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
    }
};

module.exports = Helper;
},{}]},{},[1]);
