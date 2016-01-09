/**
 * List of all the transform attributes that are possible to animate.
 *
 * **NOTE**: The order of this array dictates the order that the transforms will by applied to an element (order taken
 * from GSAP's CSSPlugin documentation).
 *
 * @type {Array<string>}
 * @private
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
 * @public
 */
export function setTransform (element, transformString) {
  element.style.webkitTransform = transformString;
  element.style.mozTransform = transformString;
  element.style.msTransform = transformString;
  element.style.oTransform = transformString;
  element.style.transform = transformString;
  return element;
}

/**
 * Apply a style to the given element's attribute.
 * @param {HTMLElement} element
 * @param {string} attributeName
 * @param {string} attributeValue
 * @public
 */
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

/**
 * Add multiple animations together to get an attribute's display value.
 * @param {Array<Animation>} animations
 * @returns {number}
 * @public
 */
export function calculateAnimationValue (animations) {
  return animations.reduce((result, {
    currentIteration, totalIterations, startValue, changeInValue, easingFunction
  }) => {
    if (currentIteration < 0) {
      currentIteration = 0;
    } else if (currentIteration > totalIterations) {
      currentIteration = totalIterations;
    }
    return result + easingFunction(currentIteration, startValue, changeInValue, totalIterations);
  }, 0);
}
