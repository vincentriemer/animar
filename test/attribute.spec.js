/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/chai/chai.d.ts"/>
'use strict';

let assert = require('chai').assert;

import Attribute from '../lib/attribute';

describe('Attribute', () => {
  describe('#constructor()', () => {
    it('should correctly set the instance properties', () => {
      let testAttribute = new Attribute('translateX', 36);
      
      assert.equal(testAttribute.model, 36);
      assert.equal(testAttribute.name, 'translateX');
      assert.property(testAttribute, 'animations');
      assert.lengthOf(testAttribute.animations, 0);
    });
  });
  
  describe('#addAnimation()', () => {
    it('should push an animation to it\'s instance animations property', () => {
      let testAttribute = new Attribute('translateX', 20);
      let mockAnimation = { foo: 'bar' };
      
      testAttribute.addAnimation(mockAnimation);
      
      assert.equal(testAttribute.animations[0], mockAnimation);
    });
  });
  
  describe('#merge()', () => {
    it('should use the target\'s model value for the merged value', () => {
      let sourceAttribute = new Attribute('test', 20);
      let targetAttribute = new Attribute('test2', 36);
      
      let mergedAttribute = sourceAttribute.merge(targetAttribute);
      
      assert.equal(mergedAttribute.model, 36);
    });
    
    it('should concatenate the animations from both attributes', () => {
      let sourceAttribute = new Attribute('test', 20);
      sourceAttribute.addAnimation({ foo: 'bar' });
      let targetAttribute = new Attribute('test2', 36);
      targetAttribute.addAnimation({ foo: 'bar' });
      targetAttribute.addAnimation({ test: 'lol' });
      
      let mergedAttribute = sourceAttribute.merge(targetAttribute);
      
      assert.lengthOf(mergedAttribute.animations, 3);
    });
  });
  
  describe('#forEachAnimation', () => {
    it('should perform a mutating function on all animations', () => {
      let testAttribute = new Attribute('test', 0);
      testAttribute.animations = [0, 1, 2, 3, 4, 5, 6, 7];
      
      testAttribute.forEachAnimation((animation) => {
        return animation.toString();
      });
      
      testAttribute.animations.forEach((animation) => {
        assert.typeOf(animation, 'string');
      });
    });
  });
});
