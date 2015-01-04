// imports
var EasingFactory   = require("./ease"),
    AnimatedElement = require("./element"),
    Helper          = require("./helper"),
    Constants        = require("./constants");


var Animar = function() {
    this.elementMap = new Map();
    this.ticking = false;
};


Animar.prototype.addAnimationToMap = function(args) {
  if (!this.elementMap.has(args.element)) {
    this.elementMap.set(args.element, new AnimatedElement());
  }
  this.elementMap.get(args.element).addAnimation(args);
};


Animar.prototype.add = function(element, attribute, destination, options) {
  var newAnimation = {
    element: element,
    attribute: attribute,
    start: options.start === undefined ? Helper.getStartValue([element, attribute]) : options.start,
    destination: destination,
    duration: options.duration,
    ease: typeof options.easing === 'string' ? EasingFactory[options.easing]() : options.easing,
    delay: options.delay || 0,
    loop: options.loop || false,
    wait: options.wait || 0
  }
  this.addAnimationToMap(newAnimation);
  this.requestTick();
}


Animar.prototype.calculateAnimationValue = function(animations) {
  var result = 0;
  animations.forEach(function(value) {
    var currentIteration = value.currentIteration;
    if (value.currentIteration < 0) { currentIteration = 0; }
    if (value.currentIteration >= value.totalIterations) { currentIteration = value.totalIterations; }
    result += value.easingFunction(currentIteration, value.startValue, value.changeInValue, value.totalIterations);
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
      var targetAttribute = key;
      if ( value.animations.length !== 0 ) {
        animated = true;
        var targetValue = value.model + self.calculateAnimationValue(value.animations);
        if (Constants.TRANSFORM_ATTRIBUTES.indexOf(targetAttribute) !== -1) {
          // determine the units necessary for the specified transform
          var unit = ((targetAttribute === "translateX" || targetAttribute === "translateY") ? "px" : (targetAttribute === "rotate" ? "deg" : ""));
          transformValue += targetAttribute + "(" + targetValue + unit + ") ";
        } else {
          self.applyStyle(targetElement, targetAttribute, targetValue);
        }
      }
    });
    if (transformValue !== "") {
      transformValue += "translateZ(0)";
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