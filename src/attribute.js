import { stepAnimation, loopAnimation } from './animation';

export function addAnimationToAttribute(animation) {
  return (attribute) => {
    let output = Object.assign({}, attribute);
    output.animations.push(animation);
    return output;
  }
}

export function mergeAttributes(target) {
  return (source) => {
    const mergedAnimations = source.animations.concat(target.animations);
    return {
      model: target.model,
      name: target.name,
      animations: mergedAnimations
    };
  };
}

export function render(attr, element) {
  // TODO: Need plugin system implemented to implement
}

export function stepAttribute(timescale) {
  return (attribute) => {
    let output = Object.assign({}, attribute);
    output.animations = attribute.animations.map(stepAnimation(timescale));
    return output;
  };
}

export function loopAttribute(chainOptions) {
  return (attribute) => {
    const loopedAnimations = attribute.animations.map(loopAnimation(chainOptions));
    return {
      model: attribute.model,
      name: attribute.name,
      animations: loopedAnimations
    }
  }
}

export default function(name, model) {
  return {
    name,
    model,
    animations: []
  }
}
