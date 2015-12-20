/* @flow */
import type Attribute from './attribute'; //eslint-disable-line no-unused-vars
import type { ChainOptions } from './animar'; //eslint-disable-line no-unused-vars
import { applyStyle, TRANSFORM_ATTRIBUTES } from './helpers';

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
    let transformValues:Array<?[string, string]> = [];

    this.attributes.forEach(attribute => {
      let currentTransform = attribute.render(this.domElement);
      let index = TRANSFORM_ATTRIBUTES.indexOf(currentTransform[0]);
      transformValues[index] = currentTransform;
    });

    if (transformValues.length !== 0) {
      if (hardwareAcceleration && transformValues[2] == null) {
        transformValues[2] = ['translateZ', '0'];
      }

      // Array.filter function currently doesn't work properly with FlowType
      let filteredTransformValues:Array<[string, string]> = [];
      for (var i = 0; i < transformValues.length; i++) {
        if (transformValues[i] != null) {
          filteredTransformValues.push(transformValues[i]);
        }
      }

      let transformStringArray = filteredTransformValues.map(v => `${v[0]}(${v[1]})`);

      applyStyle(this.domElement, 'transform', transformStringArray.join(' '));
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
