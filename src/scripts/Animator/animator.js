/* @flow */

// imports
var Animation       = require("./animation"),
    EasingFactory   = require("./ease"),
    AnimatedElement = require("./animated_element");

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
};

module.exports = Animator;