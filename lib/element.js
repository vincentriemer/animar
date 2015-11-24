/* @flow */
import Attribute from './attribute';
import Animation from './animation';
import { applyStyle } from './helpers';

export default class Element {
  attributes: Map<string, Attribute>;
  domElement: HTMLElement;

  constructor(element: HTMLElement) {
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

  merge(target: Element): Element {
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

  addAttribute(attrName: string, attribute: Attribute) {
    this.attributes.set(attrName, attribute);
  }

  forEachAnimationInAttribute(callback: () => Animation) {
    this.attributes.forEach(attribute => {
      attribute.forEachAnimation(callback);
    });
  }

  hasAttribute(attributeName: string): boolean {
    return this.attributes.has(attributeName);
  }

  getModelFromAttribute(attributeName: string): number {
    return this.attributes.get(attributeName).model;
  }

  step(timescale: number): boolean {
    let somethingChanged = false;
    this.attributes.forEach(attribute => {
      if (attribute.step(timescale)) {
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }
}
