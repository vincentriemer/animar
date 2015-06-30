'use strict';

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
}