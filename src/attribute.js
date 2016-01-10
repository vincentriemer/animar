import Immutable from 'immutable';
import { stepAnimation, loopAnimation } from './animation';

export function addAnimationToAttribute(animation) {
  return (attribute) =>
    attribute.update('animations', animations =>
      animations.push(animation));
}

export function mergeAttributes(target) {
  return (source) => source
    .set('model', target.get('model'))
    .update('animations', animations =>
      animations.concat(target.get('animations')));
}

// export function render(attr, element) {}

export function stepAttribute(timescale) {
  return (attribute) =>
    attribute.update('animations', animations =>
      animations.map(stepAnimation(timescale)));
}

export function loopAttribute(chainOptions) {
  return (attribute) =>
    attribute.update('animations', animations =>
      animations.map(loopAnimation(chainOptions)));
}

export default function(name, model) {
  return Immutable.Map({
    name,
    model,
    animations: Immutable.List()
  });
}
