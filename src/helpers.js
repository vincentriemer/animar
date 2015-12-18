/* @flow */
/* global __DEV__ */
/// <reference path="../typings/tsd.d.ts"/>
import type Animation from './animation';
import type {AttributesOptions} from './animar';

const TRANSFORM_ATTRIBUTES = [
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ'
];

var setTransform = function (element:HTMLElement, transformString:string):HTMLElement {
  element.style.transform = transformString;
  return element;
};

var applyStyle = function (element:HTMLElement, attributeName:string, attributeValue:string) {
  switch (attributeName) {
    case ('transform'):
      setTransform(element, attributeValue);
      break;
    case ('opacity'):
      element.style.opacity = attributeValue;
      break;
    case ('perspective'):
      element.style.perspective = attributeValue;
      break;
    default:
      throw new Error(`invalid/unsupported attribute: ${attributeName}`);
  }
};

var calculateAnimationValue = function (animations:Array<?Animation>):number {
  var result = 0;

  animations.forEach(animation => {
    /* istanbul ignore else */
    if (animation != null) {
      var currentIteration = animation.currentIteration;
      if (currentIteration < 0) {
        currentIteration = 0;
      }
      if (currentIteration >= animation.totalIterations) {
        currentIteration = animation.totalIterations;
      }
      result += animation.easingFunction(currentIteration, animation.startValue, animation.changeInValue, animation.totalIterations);
    }
  });

  return result;
};

module.exports.setTransform = setTransform;
module.exports.applyStyle = applyStyle;
module.exports.calculateAnimationValue = calculateAnimationValue;
module.exports.TRANSFORM_ATTRIBUTES = TRANSFORM_ATTRIBUTES;

/* istanbul ignore else */
if (__DEV__) {
  module.exports.validateAddParameters = function (element:HTMLElement, attributes:AttributesOptions/*, options:AnimationOptions */) {
    if (element == null) {
      throw new Error('Missing or null parameter: element');
    }
    if (!(element instanceof HTMLElement)) {
      throw new Error("Parameter 'element' should be of type HTMLElement");
    }
    if (attributes == null) {
      throw new Error('Missing or null parameter: attributes');
    }
    if (Object.prototype.toString.call(attributes) !== '[object Object]') {
      throw new Error("Parameter 'attributes' should be of type Object");
    }
    // TODO: Validate attributes contents
    // TODO: Validate option types
  };
}
