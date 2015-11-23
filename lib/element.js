import { applyStyle } from './helpers';

export default class Element {
  constructor(element) {
    this.attributes = new Map();
    this.domElement = element;
  }

  render() {
    let transformValue = '';

    this.attributes.forEach(attribute => {
      transformValue += attribute.render(this.domElement);
    });

    if (transformValue !== '') {
      transformValue += 'translateZ(0)';
      applyStyle(this.domElement, 'transform', transformValue);
    }
  }

  merge(target) {
    let mergedElement = new Element(this.domElement);
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
    this.attributes.forEach(attribute => {
      attribute.forEachAnimation(callback);
    });
  }

  hasAttribute(attributeName) {
    return this.attributes.has(attributeName);
  }

  getModelFromAttribute(attributeName) {
    return this.attributes.get(attributeName).model;
  }

  step(timescale) {
    let somethingChanged = false;
    this.attributes.forEach(attribute => {
      if (attribute.step(timescale)) {
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }
}
