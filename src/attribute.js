/* @flow */

import { Animation, Attribute, ChainOptions } from './types';
import { stepAnimation, loopAnimation, calculateAnimationValue } from './animation';

export function addAnimationToAttribute(animation: Animation) {
  return (attribute: Attribute): Attribute => ({
    model: attribute.model,
    animations: attribute.animations.concat([animation])
  });
}

export function mergeAttributes(target: Attribute) {
  return (source: Attribute): Attribute => ({
    model: target.model,
    animations: source.animations.concat(target.animations)
  });
}

export function stepAttribute(timescale: number) {
  return (attribute: Attribute): Attribute => ({
    ...attribute,
    animations: attribute.animations
      .map(stepAnimation(timescale))
      .filter(anim => anim)
  });
}

export function loopAttribute(chainOptions: ChainOptions) {
  return (attribute: Attribute): Attribute => ({
    ...attribute,
    animations: attribute.animations.map(loopAnimation(chainOptions))
  });
}

export function calculateAttributeDisplayValue(attribute: Attribute): string {
  return String(attribute.model + calculateAnimationValue(attribute.animations));
}

export default function(model: number): Attribute {
  return {
    model,
    animations: []
  };
}
