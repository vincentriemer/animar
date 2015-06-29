'use strict';

export default class Attribute {
  constructor(name, model) {
    this.model = model;
    this.animations = [];
  }

  addAnimation(animation) {
    this.animations.push(animation);
  }

  merge(target) {
    let newAttribute = new Attribute(target.model);
    newAttribute.animations.push(this.animations);
    newAttribute.animations.push(target.animations);
    return newAttribute;
  }

  forEachAnimation(callback) {
    this.animations = this.animations.map(callback);
    return this;
  }
}