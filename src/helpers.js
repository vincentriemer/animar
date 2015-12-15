/* @flow */
/// <reference path="../typings/tsd.d.ts"/>
import type Animation from './animation';
import type {AttributesOptions} from './animar';

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

export function getTransformMatrix(element:HTMLElement):Array<number> {
  let computedStyle = window.getComputedStyle(element, null);
  /* istanbul ignore next */
  let transformString = computedStyle.getPropertyValue('-webkit-transform') ||
    computedStyle.getPropertyValue('-moz-transform') ||
    computedStyle.getPropertyValue('-ms-transform') ||
    computedStyle.getPropertyValue('-o-transform') ||
    computedStyle.getPropertyValue('transform') ||
    'none';
  if (transformString === 'none') {
    transformString = 'matrix(1, 0, 0, 1, 0, 0)';
  }
  const values = transformString.split('(')[1].split(')')[0].split(',');
  return values.map(function (x) {
    return parseFloat(x, 10);
  });
}

export function getTransform(element:HTMLElement, attribute:string):number {
  let values = this.getTransformMatrix(element);
  switch (attribute) {
    case ('translateX'):
      return values[4];
    case ('translateY'):
      return values[5];
    case ('scaleX'):
      return Math.sqrt(Math.pow(values[0], 2) + Math.pow(values[1], 2));
    case ('scaleY'):
      return Math.sqrt(Math.pow(values[2], 2) + Math.pow(values[3], 2));
    case ('rotate'):
      return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
    default:
      throw new Error(`invalid/unspported transform attribute: ${attribute}`);
  }
}

export function getOpacity(element:HTMLElement):number {
  let computedStyle = window.getComputedStyle(element, null);
  return parseFloat(computedStyle.getPropertyValue('opacity'));
}

export function setTransform(element:HTMLElement, transformString:string):HTMLElement {
  element.style.transform = transformString;
  return element;
}

export function applyStyle(element:HTMLElement, attributeName:string, attributeValue:string) {
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

export function calculateAnimationValue(animations:Array<?Animation>):number {
  var result = 0;

  animations.forEach(animation => {
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

export function getStartValue(element:HTMLElement, attribute:string):number {
  let result = 0;

  if (TRANSFORM_ATTRIBUTES.indexOf(attribute) !== -1) {
    result = this.getTransform(element, attribute);
  } else {
    switch (attribute) {
      case ('opacity'):
        result = this.getOpacity(element);
        break;
      default:
        throw new Error(`invalid/unsupported attribute: ${attribute}`);
    }
  }

  return result;
}

export function validateAddParameters(element:HTMLElement, attributes:AttributesOptions/*, options:AnimationOptions */) {
  if (element == null) {
    throw 'Missing or null parameter: element';
  }
  if (!(element instanceof HTMLElement)) {
    throw "Parameter 'element' should be of type HTMLElement";
  }
  if (attributes == null) {
    throw 'Missing or null parameter: attribtues';
  }
  if (Object.prototype.toString.call(attributes) !== '[object Object]') {
    throw "Parameter 'attributes' should be of type Object";
  }
  // TODO: Validate attributes contents
  // TODO: Validate option types
}
