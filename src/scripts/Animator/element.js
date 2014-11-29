/* @flow */

// imports
var Helpers = require('./helper');

var Element = function() {
  this.attributeMap = new Map();
};

Element.prototype.addAnimation = function(animation) {
  if (!this.attributeMap.has(animation.attribute)) {
    this.createAttribute(animation);
  }

  var currentAttribute = this.attributeMap.get(animation.attribute),
      startValue       = currentAttribute.model - animation.destination,
      changeInValue    = 0 - startValue,
      totalIterations  = animation.duration,
      easingFunction   = animation.ease;

  currentAttribute.model = animation.destination;
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
      result = Helpers.getOpacity(animation.element);
      break;
    case('translateX'):
      result = Helpers.getTranslateX(animation.element);
      break;
    case('translateY'):
      result = Helpers.getTranslateY(animation.element);
      break;
    case('scaleX'):
      result = Helpers.getScaleX(animation.element);
      break;
    case('scaleY'):
      result = Helpers.getScaleY(animation.element);
      break;
    case('rotate'):
      result = Helpers.getRotation(animation.element);
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