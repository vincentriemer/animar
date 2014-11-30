/* @flow */

// imports
var EasingFactory   = require("./ease"),
    AnimatedElement = require("./element"),
    Helper          = require("./helper"),
    Constant        = require("./constants");


var Animator = function() {
    this.elementMap = new Map();
    this.ticking = false;
};


Animator.prototype.addAnimationToMap = function(args : {
    element     : HTMLElement;
    attribute   : string;
    destination : number;
    duration    : number;
    ease        : Function;
  }) 
{
  if (!this.elementMap.has(args.element)) {
    this.elementMap.set(args.element, new AnimatedElement());
  }
  this.elementMap.get(args.element).addAnimation(args);
};


Animator.prototype.addAnimation = function(args : {
    target         : HTMLElement;
    attribute      : string;
    destination    : number;
    duration       : ?number;
    easingFunction : ?any;
  })
{
  var target = args.target,
    attribute = args.attribute,
    destination = args.destination,
    duration = args.duration || 60,
    easingFunction = args.easingFunction || 'linear';

  if (typeof easingFunction === 'string') {
    easingFunction = EasingFactory[easingFunction]();
  }

  var newAnimation = {
    element: target,
    attribute: attribute,
    destination: destination,
    duration: duration,
    ease: easingFunction
  };
  this.addAnimationToMap(newAnimation);
  this.requestTick();
};


Animator.prototype.calculateAnimationValue = function(animations : 
    Array<{
      easingFunction   : Function;
      currentIteration : number;
      startValue       : number;
      changeInValue    : number;
      totalIterations  : number;
    }>) : number 
{
  var result = 0;
  animations.forEach(function(value) {
    result += value.easingFunction(value.currentIteration, value.startValue, value.changeInValue, value.totalIterations);
  });
  return result;
};


Animator.prototype.applyStyle = function(element : HTMLElement, attribute : string, value : string) {
  switch(attribute) {
    case("transform"):
      Helper.setTransform(element, value);
      break;
    case("opacity"):
      element.style.opacity = value;
      break;
    default:
      console.log("[ERROR] Invalid attribute"); // TODO: Throw error
  }
};


Animator.prototype.renderDOM = function() : boolean {
  var self = this; // maintain reference to Animator instance through the forEach calls
  var animated = false;
  self.elementMap.forEach(function(value, key) {
    var targetElement = key;
    var transformValue = "";
    value.attributeMap.forEach(function(value, key) {
      animated = true;
      var targetAttribute = key;
      var targetValue = value.model + self.calculateAnimationValue(value.animations);
      if (Constant.TRANSFORM_ATTRIBUTES.indexOf(targetAttribute) !== -1) {
        switch(targetAttribute) {
          case("translateX"):
            transformValue += "translateX(" + targetValue + "px) ";
            break;
          case("translateY"):
            transformValue += "translateY(" + targetValue + "px) ";
            break;
          case("scaleX"):
            transformValue += "scaleX(" + targetValue + ") ";
            break;
          case("scaleY"):
            transformValue += "scaleY(" + targetValue + ") ";
            break;
          case("rotate"):
            transformValue += "rotate(" + targetValue + "deg) ";
            break;
          default:
        }
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


Animator.prototype.stepFrame = function() {
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
    });
    value.attributeMap = attributeMap;
  });
};


Animator.prototype.update = function() {
  var animationsRemaining = this.renderDOM();
  
  this.stepFrame();

  this.ticking = false;
  if (animationsRemaining) this.requestTick();
};


Animator.prototype.requestTick = function() {
  if (!this.ticking) {
    window.requestAnimationFrame(this.update.bind(this));
    this.ticking = true;
  }
};

module.exports = new Animator();