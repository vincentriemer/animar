/* @flow */

import { Element, Attribute, ChainOptions } from './types';
import { mergeAttributes, stepAttribute, loopAttribute } from './attribute';
import { reduce, map } from './objUtils';

export function addAttributeToElement(name: string, attribute: Attribute) {
  return (element: Element): Element => ({
    attributes: {
      ...element.attributes,
      [name]: attribute
    }
  });
}

export function mergeElements(target: Element) {
  return (source: Element): Element => ({
    attributes: reduce(target.attributes)((output, targetAttr, attrName) => {
      const existingAttr = output[attrName];
      if (existingAttr != null) {
        output[attrName] = mergeAttributes(targetAttr)(existingAttr);
      } else {
        output[attrName] = targetAttr;
      }
      return output;
    }, source.attributes)
  });
}

export function stepElement(timescale: number) {
  return (element: Element) => ({
    attributes: map(element.attributes)(stepAttribute(timescale))
  });
}

export function loopElement(chainOptions: ChainOptions) {
  return (element: Element) => ({
    attributes: map(element.attributes)(loopAttribute(chainOptions))
  });
}

export default function(): Element {
  return {
    attributes: {}
  };
}
