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
      animations.map(stepAnimation(timescale))
                .filter(anim => anim)
    );
}

export function loopAttribute(chainOptions) {
  return (attribute) =>
    attribute.update('animations', animations =>
      animations.map(loopAnimation(chainOptions)));
}

export default function(model) {
  return Immutable.Map({
    model,
    animations: Immutable.List()
  });
}
