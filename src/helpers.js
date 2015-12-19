/* @flow */
/// <reference path="../typings/tsd.d.ts"/>
import type Animation from './animation'; //eslint-disable-line no-unused-vars
import type {AttributesOptions} from './animar';//eslint-disable-line no-unused-vars

export const TRANSFORM_ATTRIBUTES = [
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

export function setTransform (element:HTMLElement, transformString:string):HTMLElement {
  element.style.transform = transformString;
  return element;
}

export function applyStyle (element:HTMLElement, attributeName:string, attributeValue:string) {
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
}

export function calculateAnimationValue (animations:Array<?Animation>):number {
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
}
