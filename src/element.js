import { mergeAttributes, stepAttribute, loopAttribute } from './attribute';
import { reduce, map } from './objUtils';

export function addAttributeToElement(name, attribute) {
  return element => Object.assign({}, element, {
    attributes: Object.assign({}, element.attributes, {
      [name]: attribute
    })
  });
}

export function mergeElements(target) {
  return source => Object.assign({}, source, {
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

export function stepElement(timescale) {
  return element => Object.assign({}, element, {
    attributes: map(element.attributes)(stepAttribute(timescale))
  });
}

export function loopElement(chainOptions) {
  return element => Object.assign({}, element, {
    attributes: map(element.attributes)(loopAttribute(chainOptions))
  });
}

export default function() {
  return {
    attributes: {}
  };
}
