'use strict';

class Animation {

  constructor(currentIteration, startValue, changeInValue, totalIterations, easingFunction, loop, delay, wait) {
    this.currentIteration = currentIteration;
    this.startValue = startValue;
    this.changeInValue = changeInValue;
    this.totalIterations = totalIterations;
    this.easingFunction = easingFunction;
    this.loop = loop;
    this.delay = delay;
    this.wait = wait;
  }

  step() {
    if (this.currentIteration > (this.totalIterations + this.wait)) {
      this.currentIteration += 1;
    } else if (this.loop) {
      this.currentIteration = 0 - this.delay;
    }
  }

}

class Attribute {

  constructor(model) {
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

}

class Element {

  constructor() {
    this.attributes = new Map();
  }

  hasAttribute(name) {
    return this.attributes.hasOwnProperty(name);
  }

  merge(target) {
    let mergedElement = new Element();
    mergedElement.attributes = new Map(this.attributes);

    target.attributes.forEach((attr, attrName) => {
      let mergedAttribute;

      if (mergedElement.attributes.has(attrName)) {
        mergedAttribute = mergedElement.attributes.get(attrName).merge(attr);
      } else {
        mergedAttribute = attr;
      }

      mergedElement.attributes.set(attrName, mergedAttribute);
    });

    return mergedElement;
  }

  addAttribute(attrName, attribute) {
    this.attributes.set(attrName, attribute);
  }
}

let testElementOne = new Element();
let testAttributeOne = new Attribute(10);
let testAnimation = new Animation(0, 1, 2, 3, 4, 5, 6, 7);
testAttributeOne.addAnimation(testAnimation);
testElementOne.addAttribute('translateX', testAttributeOne);

let testElementTwo = new Element();
let testAttributeTwo = new Attribute(5);
let testAnimationTwo = new Animation(0, 1, 2, 3, 4, 5, 6, 7);
testAttributeTwo.addAnimation(testAnimationTwo);
testElementTwo.addAttribute('translateX', testAttributeTwo);

console.log(testElementOne);
console.log(testElementTwo);

let mergedElement = testElementOne.merge(testElementTwo);
console.log(mergedElement);
console.log(mergedElement.attributes.get('translateX').animations);






