import Immutable from 'immutable';
import { mergeAttributes, stepAttribute, loopAttribute } from './attribute';

export function addAttribute(name, attribute) {
  return element =>
    element.update('attributes', attributes =>
      attributes.set(name, attribute));
}

export function mergeElements(target) {
  return source =>
    target.get('attributes').reduce((output, targetAttribute, attrName) => {
      const existingAttribute = output.getIn(['attributes', attrName]);
      if (existingAttribute != null) {
        return addAttribute(attrName, mergeAttributes(targetAttribute)(existingAttribute))(output);
      } else {
        return addAttribute(attrName, targetAttribute)(output);
      }
    }, source);
}

export function stepElement(timescale) {
  return element =>
    element.update('attributes', attributes =>
      attributes.map(stepAttribute(timescale)));
}

export function loopElement(chainOptions) {
  return element => element.update('attributes', attributes => attributes.map(loopAttribute(chainOptions)));
}

export default function() {
  return Immutable.Map({
    attributes: Immutable.Map()
  });
}
