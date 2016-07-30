import { stepAnimation, loopAnimation, calculateAnimationValue } from './animation';

export function addAnimationToAttribute(animation) {
  return attribute => Object.assign({}, attribute, {
    animations: attribute.animations.concat([animation])
  });
}

export function mergeAttributes(target) {
  return source => Object.assign({}, source, {
    model: target.model,
    animations: source.animations.concat(target.animations)
  });
}

export function stepAttribute(timescale) {
  return attribute => Object.assign({}, attribute, {
    animations: attribute.animations
      .map(stepAnimation(timescale))
      .filter(anim => anim)
  });
}

export function loopAttribute(chainOptions) {
  return attribute => Object.assign({}, attribute, {
    animations: attribute.animations.map(loopAnimation(chainOptions))
  });
}

export function calculateAttributeDisplayValue(attribute) {
  return String(attribute.model + calculateAnimationValue(attribute.animations));
}

export default function(model) {
  return {
    model,
    animations: []
  };
}
