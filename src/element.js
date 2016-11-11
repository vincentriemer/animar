/* @flow */

import Immutable from 'seamless-immutable';
import { Element, Attribute, ChainOptions } from './types';
import { mergeAttributes, stepAttribute, loopAttribute } from './attribute';
import { reduce, map } from './objUtils';

export function addAttributeToElement(name: string, attribute: Attribute) {
  return (element: Element): Element => element.merge({
    attributes: element.attributes.merge( { [name]: attribute } )
  });
}

export function mergeElements(target: Element) {
  return (source: Element): Element => source.merge({
    attributes: reduce(target.attributes)((output, targetAttr, attrName) => {
      const existingAttr = output[attrName];
      if (existingAttr != null) {
        return output.set(attrName, mergeAttributes(targetAttr)(existingAttr));
      } else {
        return output.set(attrName, targetAttr);
      }
    }, source.attributes)
  });
}

export function stepElement(timescale: number) {
  return (element: Element) => element.merge({
    attributes: map(element.attributes)(stepAttribute(timescale))
  });
}

export function loopElement(chainOptions: ChainOptions) {
  return (element: Element) => element.merge({
    attributes: map(element.attributes)(loopAttribute(chainOptions))
  });
}

export default function(): Element {
  return Immutable.from({
    attributes: Immutable.from({})
  });
}
