'use strict';

function getTransformMatrix(element) {
  let computedStyle = window.getComputedStyle(element, null);
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

function getTranslateX(element) {
  let values = getTransformMatrix(element);
  return values[4];
}

function getTranslateY(element) {
  let values = getTransformMatrix(element);
  return values[5];
}

function getScaleX(element) {
  let values = getTransformMatrix(element);
  return Math.sqrt(Math.pow(values[0], 2) + Math.pow(values[1], 2));
}

function getScaleY(element) {
  let values = getTransformMatrix(element);
  return Math.sqrt(Math.pow(values[2], 2) + Math.pow(values[3], 2));
}

function getRotation(element) {
  let values = getTransformMatrix(element);
  return Math.round(Math.atan2(values[1], values[0]) * (180/Math.PI));
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

export function getStartValue(animation) {
  let result;
  switch(animation[1]) {
    case ('opacity'):
      result = getOpacity(animation[0]);
      break;
    case ('translateX'):
      result = getTranslateX(animation[0]);
      break;
    case ('translateY'):
      result = getTranslateY(animation[0]);
      break;
    case ('scaleX'):
      result = getScaleX(animation[0]);
      break;
    case ('scaleY'):
      result = getScaleY(animation[0]);
      break;
    case ('rotate'):
      result = getRotation(animation[0]);
      break;
    default:
      result = 0; // TODO: throw an error
  }
  return result;
}