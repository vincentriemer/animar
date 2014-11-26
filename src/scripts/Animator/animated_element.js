/* @flow */

/**
 * An object representing the animation properties of a distinct HTMLElement
 * @constructor
 */
var AnimatedElement = function() {
  this.attributeMap = new Map();
};

/**
 * Adds an animation to the animated element instance
 * @param {Animation} animation
 */
AnimatedElement.prototype.addAnimation = function(animation) {
  if (!this.attributeMap.has(animation.attribute)) {
    this.createNewAnimatedAttribute(animation.attribute, animation.start);
  }

  var currentAttribute = this.attributeMap.get(animation.attribute),
      startValue       = currentAttribute.model - animation.end,
      changeInValue    = 0 - startValue,
      totalIterations  = animation.duration,
      easingFunction   = animation.ease;

  currentAttribute.model = animation.end;
  currentAttribute.animations.push({
    "currentIteration" : 0,
    "startValue"       : startValue,
    "changeInValue"    : changeInValue,
    "totalIterations"  : totalIterations,
    "easingFunction"   : easingFunction
  });
};

/**
 * Helper function which creates a new animated attribute object and pushes it to the attribute map.
 * @param  {string} attributeName
 * @param  {number} start
 */
AnimatedElement.prototype.createNewAnimatedAttribute = function(attributeName, start) {
  var newAttributeObject = {
    "model": start,
    "animations": []
  };
  this.attributeMap.set(attributeName, newAttributeObject);
};

module.exports = AnimatedElement;