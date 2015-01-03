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
    startValue  = currentAttribute.model - args.destination,
    totalIterations = args.duration,
    easingFunction = args.ease,
    changeInValue = 0 - startValue;

  currentAttribute.model = args.destination;
  currentAttribute.animations.push({
    currentIteration: 0 - args.delay,
    startValue: startValue,
    changeInValue: changeInValue,
    totalIterations: totalIterations,
    easingFunction: easingFunction
  });
};

Element.prototype.createAttribute = function(animation) {
  var newAttributeObject = {
    model: animation.start,
    animations: []
  };
  this.attributeMap.set(animation.attribute, newAttributeObject);
};

module.exports = Element;