/* @flow */
/// <reference path="../typings/tsd.d.ts"/>
import type Animation from './animation'; //eslint-disable-line no-unused-vars
import type {AttributesOptions} from './animar';//eslint-disable-line no-unused-vars

/**
 * List of all the transform attributes that are possible to animate.
 *
 * **NOTE**: The order of this array dictates the order that the transforms will by applied to an element (order taken
 * from GSAP's CSSPlugin documentation).
 *
 * @type {Array<string>}
 * @protected
 */
export const TRANSFORM_ATTRIBUTES = [
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'rotateX',
  'rotateY',
  'rotateZ',
  'rotate'
];

/**
 * Set the DOM Element's transform property.
 * @param {HTMLElement} element
 * @param {string} transformString
 * @returns {HTMLElement}
 * @protected
 */
export function setTransform (element:HTMLElement, transformString:string):HTMLElement {
  element.style.transform = transformString;
  return element;
}

/**
 * Apply a style to the given element's attribute.
 * @param {HTMLElement} element
 * @param {string} attributeName
 * @param {string} attributeValue
 * @protected
 */
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

/**
 * Add multiple animations together to get an attribute's display value.
 * @param {Array<?Animation>} animations
 * @returns {number}
 * @protected
 */
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
