/* @flow */

// imports
var Helper = require('./helper');

var Element = function() {
  this.attributeMap = new Map();
};

Element.prototype.addAnimation = function(args : {
    attribute   : string;
    destination : number;
    duration    : number;
    ease        : Function;
  }) 
{
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

Element.prototype.getStartValue = function(animation : {
    attribute : string;
    element   : HTMLElement;
  }) : number
{
  var result : number;
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

Element.prototype.createAttribute = function(animation : {
    attribute  : string;
    element    : HTMLElement;
    startValue : ?number;
  }) 
{
  var startValue = animation.startValue || this.getStartValue(animation);
  
  var newAttributeObject = {
    "model": startValue,
    "animations": []
  };
  this.attributeMap.set(animation.attribute, newAttributeObject);
};

module.exports = Element;