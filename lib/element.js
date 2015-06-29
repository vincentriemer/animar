'use strict';

import { calculateAnimationValue, applyStyle } from './helper';
import { TRANSFORM_ATTRIBUTES } from './constants';

export default class Element {

  constructor(element) {
    this.attributes = new Map();
    this.domElement = element;
  }

  render(domElement) {
    let transformValue = '';

    this.attributes.forEach((attribute, attrName) => {
      let targetValue = String(this.model + calculateAnimationValue(this.animations));

      const pxRegex = /(perspective)|(translate[XYZ])/,
            degRegex = /rotate[XYZ]?/;

      if (TRANSFORM_ATTRIBUTES.indexOf(attrName) !== -1) {
        const unit = (
          pxRegex.test(attrName) ? 'px' : (
            degRegex.test(attrName) ? 'deg' : ''
          )
        );
        transformValue += `${attrName}(${targetValue}${unit}) `;
      } else {
        applyStyle(domElement, attrName, targetValue);
      }
    });

    if (transformValue !== '') {
      transformValue += 'translateZ(0)';
      applyStyle(domElement, 'transform', transformValue);
    }
  }

  merge(target) {
    let mergedElement = new Element();
    mergedElement.attributes = new Map(this.attributes);

    target.attributes.forEach((attr, attrName) => {
      let mergedAttribute;

      if (mergedElement.attributes.has(attrName)) {
        mergedAttribute = mergedElement.attributes.get(attrName).merge(attr);
      } else {
        mergedAttribute = attr;
      }

      mergedElement.attributes.set(attrName, mergedAttribute);
    });

    return mergedElement;
  }

  addAttribute(attrName, attribute) {
    this.attributes.set(attrName, attribute);
  }

  forEachAnimationInAttribute(callback) {
    let newAttributes = new Map();

    this.attributes.forEach((attribute, attributeName) => {
      newAttributes.set(attributeName, attribute.forEachAnimation(callback));
    });

    return newAttributes;
  }

  hasAttribute(attributeName) {
    return this.attributes.has(attributeName);
  }

  getModelFromAttribute(attributeName) {
    return this.attributes.get(attributeName).model;
  }

}