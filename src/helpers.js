/**
 * **NOTE**: The order of this array dictates the order that the transforms will by applied to an element (order taken
 * from GSAP's CSSPlugin documentation).
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

export function setTransform (element, transformString) {
  element.style.webkitTransform = transformString;
  element.style.mozTransform = transformString;
  element.style.msTransform = transformString;
  element.style.oTransform = transformString;
  element.style.transform = transformString;
  return element;
}

export function applyStyle (element, attributeName, attributeValue) {
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
