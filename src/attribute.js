/* @flow */
import type * as Animation from './animation';

import { calculateAnimationValue, applyStyle, TRANSFORM_ATTRIBUTES} from './helpers';

module.exports = class Attribute {
  model: number;
  animations: Array<?Animation>;
  name: string;

  constructor(name: string, model: number) {
    this.model = model;
    this.animations = [];
    this.name = name;
  }

  addAnimation(animation: Animation) {
    this.animations.push(animation);
  }

  merge(target: Attribute): Attribute {
    let newAttribute = new Attribute(target.name, target.model);
    newAttribute.animations = this.animations.concat(target.animations);
    return newAttribute;
  }

  forEachAnimation(callback: (animation: ?Animation) => ?Animation) {
    this.animations = this.animations
      .map(callback)
      .filter((x) => typeof x !== 'undefined');
  }

  step(timescale: number): boolean {
    let somethingChanged = false;

    this.animations = this.animations.map(animation => {
        if (animation != null && animation.step(timescale)) {
          somethingChanged = true;
          return animation;
        }
      }).filter((x) => typeof x !== 'undefined');

    return somethingChanged;
  }

  render(domElement: HTMLElement): string {
    let transformValue = '';
    let targetValue = String(this.model + calculateAnimationValue(this.animations));

    const pxRegex = /(perspective)|(translate[XYZ])/,
          degRegex = /rotate[XYZ]?/;

    const unit = (
      pxRegex.test(this.name) ? 'px' : (
        degRegex.test(this.name) ? 'deg' : ''
      )
    );

    targetValue += unit;

    if (TRANSFORM_ATTRIBUTES.indexOf(this.name) !== -1) {
      transformValue += `${this.name}(${targetValue}) `;
    } else {
      applyStyle(domElement, this.name, targetValue);
    }

    return transformValue;
  }
};