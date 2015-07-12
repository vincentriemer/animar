'use strict';

import { calculateAnimationValue, applyStyle } from './helpers';
import { TRANSFORM_ATTRIBUTES } from './constants';

export default class Attribute {
  constructor(name, model) {
    this.model = model;
    this.animations = [];
    this.name = name;
  }

  addAnimation(animation) {
    this.animations.push(animation);
  }

  merge(target) {
    let newAttribute = new Attribute(target.name, target.model);
    newAttribute.animations = this.animations.concat(target.animations);
    return newAttribute;
  }

  forEachAnimation(callback) {
    this.animations = this.animations.map(callback);
  }
  
  render(domElement) {
    let transformValue = ''
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
}