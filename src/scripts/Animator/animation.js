/* @flow */

/**
 * The Animation object which holds all the relevant information necessary for an animation.
 * 
 * @constructor
 * @param {HTMLElement} element - the target HTML DOM element that will be animated
 * @param {string} attribute - the attribute that will be animated
 * @param {number} start - the attribute's starting value 
 * @param {number} end - the attribute's ending value
 * @param {number} duration - the number of frames the animation will take to complete
 * @param {Function} ease - the easing function which is applied to the animation
 */
var Animation = function(
    element   : HTMLElement, 
    attribute : string, 
    start     : number, 
    end       : number, 
    duration  : number, 
    ease      : Function ) {

  this.element = element;
  this.attribute = attribute;
  this.start = start;
  this.end = end;
  this.duration = duration; // in frames
  this.ease = ease;
};

module.exports = Animation;