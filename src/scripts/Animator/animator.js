/* @flow */

// imports
var Animation       = require("./animation"),
    EasingFactory   = require("./ease"),
    AnimatedElement = require("./animated_element"),
    Helper         = require("./helper"),
    Constant       = require("./constants");

type Options = {

};

/**
 * The main Animation API.
 * @constructor
 * @param {Options} options - the options which configure the animation library.
 */
var Animator = function(options?: Options) {
    this.options = options || {};
    this.elementMap = new Map();
    this.ticking = false;
};

/**
 * Add an animation object to the map of the states of all the animated objects.
 * @param {Animation} animation - the animation to be added.
 */
Animator.prototype.addAnimationToMap = function(animation) {
  if (!this.elementMap.has(animation.element)) {
    this.elementMap.set(animation.element, new AnimatedElement());
  }
  this.elementMap.get(animation.element).addAnimation(animation);
};

/**
 * Add a new animation to the target and start it immediately
 * @param {HTMLElement} target - the target HTML DOM element that will be animated                   
 * @param {string} attribute - the attribute that will be animated
 * @param {number} start - the attribute's starting value                       
 * @param {number} end - the attribute's ending value                                          
 * @param {number} duration - the number of frames the animation will take to complete
 * @param {Function} ease - the easing function which is applied to the animation                                    
 */
Animator.prototype.addAnimation = function(
    target    : HTMLElement, 
    attribute : string, 
    start     : number, 
    end       : number, 
    duration  : number, 
    ease      : Function) {

  var newAnimation = new Animation(target, attribute, start, end, duration, ease);
  this.addAnimationToMap(newAnimation);
  this.requestTick();
};

Animator.prototype.calculateAnimationValue = function(animations) {
  var result = 0;
  animations.forEach(function(value) {
    result += value.easingFunction(value.currentIteration, value.startValue, value.changeInValue, value.totalIterations);
  });
  return result;
};

Animator.prototype.applyStyle = function(element, attribute, value) {
  switch(attribute) {
    case("transform"):
      Helper.setTransform(element, value);
      break;
    default:
      console.log("[ERROR] Invalid attribute");
  }
};

Animator.prototype.renderDOM = function() {
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
  this.elementMap.forEach(function(value) {
    value.attributeMap.forEach(function(value, key, map) {
      var updatedAnimations = [];
      value.animations.forEach(function(value, index) {
        if (value.currentIteration !== value.totalIterations) {
          value["currentIteration"] += 1;
          updatedAnimations.push(value);
        }
      });
      if (updatedAnimations.length !== 0) {
        value.animations = updatedAnimations;
      } else {
        map.delete(key);
      }
    });
  });
};

Animator.prototype.update = function() {
  var animationsRemaining = this.renderDOM();
  this.stepFrame();

  this.ticking = false;
  if (animationsRemaining) { this.requestTick(); }
};

Animator.prototype.requestTick = function() {
  if (!this.ticking) {
    window.requestAnimationFrame(this.update.bind(this));
    this.ticking = true;
  }
};

module.exports = Animator;