/// <reference path="../typings/tsd.d.ts"/>
'use strict';

import { TRANSFORM_ATTRIBUTES } from './constants';

function getTransformMatrix(element) {
  let computedStyle = window.getComputedStyle(element, null);
  /* istanbul ignore next */
  let transformString = computedStyle.getPropertyValue('-webkit-transform') ||
                        computedStyle.getPropertyValue('-moz-transform') ||
                        computedStyle.getPropertyValue('-ms-transform') ||
                        computedStyle.getPropertyValue('-o-transform') ||
                        computedStyle.getPropertyValue('transform') ||
                        'none'; // TODO: throw error
  if (transformString === 'none') { transformString = 'matrix(1, 0, 0, 1, 0, 0)'; }
  const values = transformString.split('(')[1].split(')')[0].split(',');
  const floatValues = values.map(function(x) { return parseFloat(x, 10); } );
  return floatValues;
}

function getTransform(element, attribute) {
  let values = getTransformMatrix(element);
  
  switch (attribute) {
    case ('translateX'):
      return values[4];
    case ('translateY'):
      return values[5];
    case ('scaleX'):
      return Math.sqrt(Math.pow(values[0], 2) + Math.pow(values[1], 2));
    case ('scaleY'):
      return Math.sqrt(Math.pow(values[2], 2) + Math.pow(values[3], 2));
    case ('rotation'):
      return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
    default:
      throw `invalid/unspported transform attribute: ${attribute}`
  }
}

function getOpacity(element) {
  let computedStyle = window.getComputedStyle(element, null);
  return parseFloat(computedStyle.getPropertyValue('opacity'));
}

function setTransform(element, transformString) {
  element.style.webkitTransform = transformString;
  element.style.MozTransform = transformString;
  element.style.msTransform = transformString;
  element.style.OTransform = transformString;
  element.style.transform = transformString;
  return element;
}

export function applyStyle(element, attributeName, attributeValue) {
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
      throw `invalid/unsupported attribute: ${attributeName}`
  }
}

export function calculateAnimationValue(animations) {
  var result = 0;

  animations.forEach(animation => {
    var currentIteration = animation.currentIteration;

    if (currentIteration < 0) {
      currentIteration = 0;
    }

    if (currentIteration >= animation.totalIterations) {
      currentIteration = animation.totalIterations;
    }

    result += animation.easingFunction(currentIteration, animation.startValue, animation.changeInValue, animation.totalIterations);
  });

  return result;
}

export function getStartValue(element, attribute) {
  let result;
  
  if (TRANSFORM_ATTRIBUTES.indexOf(attribute) !== -1) {
    result = getTransform(element, attribute);
  } else {
    switch (attribute) {
      case ('opacity'):
        result = getOpacity(element);
        break;
      default:
        throw `invalid/unsupported attribute: ${attribute}`;
    }
  }
  return result;
}