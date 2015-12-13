/* @flow */
import type Attribute from './attribute';
import type Animation from './animation';
import { applyStyle } from './helpers';

class Element {
  attributes:Map<string, Attribute>;
  domElement:HTMLElement;

  constructor(element:HTMLElement) {
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

  merge(target:Element):Element {
    let mergedElement = new Element(this.domElement);
    mergedElement.attributes = new Map(this.attributes);
    target.attributes.forEach((attr, attrName) => {
      let mergedAttribute;

      // TODO: Replace existence logic with hasAttribute once FlowType has fixed its bug
      let existingAttribute = mergedElement.attributes.get(attrName);
      if (existingAttribute != null) {
        mergedAttribute = existingAttribute.merge(attr);
      } else {
        mergedAttribute = attr;
      }

      mergedElement.attributes.set(attrName, mergedAttribute);
    });

    return mergedElement;
  }

  addAttribute(attrName:string, attribute:Attribute) {
    this.attributes.set(attrName, attribute);
  }

  forEachAnimationInAttribute(callback:(animation:?Animation) => ?Animation) {
    this.attributes.forEach(attribute => {
      attribute.forEachAnimation(callback);
    });
  }

  hasAttribute(attributeName:string):boolean {
    return this.attributes.has(attributeName);
  }

  getModelFromAttribute(attributeName:string):number {
    let result = null;

    // TODO: Replace existence logic with hasAttribute once FlowType has fixed its bug
    let attribute = this.attributes.get(attributeName);
    if (attribute != null) {
      result = attribute.model;
    } else {
      throw `No such attribute ${attributeName}`;
    }

    return result;
  }

  step(timescale:number):boolean {
    let somethingChanged = false;
    this.attributes.forEach(attribute => {
      if (attribute.step(timescale)) {
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }
}

export default Element;
