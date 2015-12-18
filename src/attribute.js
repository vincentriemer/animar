/* @flow */
import type Animation from './animation';
import type { ChainOptions } from './animar';
import { calculateAnimationValue, applyStyle, TRANSFORM_ATTRIBUTES} from './helpers';

class Attribute {
  model:number;
  animations:Array<?Animation>;
  name:string;

  constructor (name:string, model:number) {
    this.model = model;
    this.animations = [];
    this.name = name;
  }

  addAnimation (animation:Animation) {
    this.animations.push(animation);
  }

  merge (target:Attribute):Attribute {
    let newAttribute = new Attribute(target.name, target.model);
    newAttribute.animations = this.animations.concat(target.animations);
    return newAttribute;
  }

  step (timescale:number):boolean {
    let somethingChanged = false;

    this.animations = this.animations.map(animation => {
      if (animation != null && animation.step(timescale)) {
        somethingChanged = true;
        return animation;
      }
    }).filter((x) => x != null);

    return somethingChanged;
  }

  render (domElement:HTMLElement):string {
    let transformValue = '';
    let targetValue = String(this.model + calculateAnimationValue(this.animations));

    const pxRegex = /(perspective)|(translate[XYZ])/,
      degRegex = /rotate[XYZ]?/;

    targetValue += (
      pxRegex.test(this.name) ? 'px' : (
        degRegex.test(this.name) ? 'deg' : ''
      )
    );

    if (TRANSFORM_ATTRIBUTES.indexOf(this.name) !== -1) {
      transformValue += `${this.name}(${targetValue}) `;
    } else {
      applyStyle(domElement, this.name, targetValue);
    }

    return transformValue;
  }

  loop (chainOptions:ChainOptions) {
    this.animations.forEach(animation => {
      /* istanbul ignore else */
      if (animation != null) {
        animation.loop(chainOptions);
      }
    });
  }
}

module.exports = Attribute;
