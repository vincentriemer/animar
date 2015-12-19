/* @flow */
import type Attribute from './attribute'; //eslint-disable-line no-unused-vars
import type { ChainOptions } from './animar'; //eslint-disable-line no-unused-vars
import { applyStyle } from './helpers';

/**
 * Class that holds all the animation information for an HTML DOM Element.
 * @protected
 */
export default class Element {
  attributes:Map<string, Attribute>;
  domElement:HTMLElement;

  /**
   * Create a new Element instance
   * @param element
   */
  constructor (element:HTMLElement) {
    this.attributes = new Map();
    this.domElement = element;
  }

  /**
   * Render the Element's current animation state to the DOM.
   * @param hardwareAcceleration
   */
  render (hardwareAcceleration:boolean) {
    let transformValue = '';

    this.attributes.forEach(attribute => {
      transformValue += attribute.render(this.domElement);
    });

    if (transformValue !== '') {
      if (hardwareAcceleration) {
        transformValue += 'translateZ(0)';
      }

      applyStyle(this.domElement, 'transform', transformValue);
    }
  }

  /**
   * Merge elements' properties.
   * @param target
   * @returns {Element}
   */
  merge (target:Element):Element {
    let mergedElement = new Element(this.domElement);
    mergedElement.attributes = new Map(this.attributes);
    target.attributes.forEach((attr, attrName) => {
      let mergedAttribute;

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

  /**
   * Add an {@link Attribute} to the Element instance.
   * @param attrName
   * @param attribute
   */
  addAttribute (attrName:string, attribute:Attribute) {
    this.attributes.set(attrName, attribute);
  }

  /**
   * Step the Element's animation state forward.
   * @param timescale
   * @returns {boolean}
   */
  step (timescale:number):boolean {
    let somethingChanged = false;
    this.attributes.forEach(attribute => {
      if (attribute.step(timescale)) {
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }

  /**
   * Update the Element's animation state to loop.
   * @param chainOptions
   */
  loop (chainOptions:ChainOptions) {
    this.attributes.forEach(attribute => {
      attribute.loop(chainOptions);
    });
  }
}
