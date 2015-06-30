/// <reference path="../typings/tsd.d.ts"/>
'use strict';

let assert = require('chai').assert;
let sinon = require('sinon');

import Attribute from '../lib/attribute';
import * as Helper from '../lib/helper';

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
  
  describe('#render', () => {
    let applyStyleStub, calculateStub;
    
    beforeEach(() => {
      applyStyleStub = sinon.stub(Helper, 'applyStyle');
      calculateStub = sinon.stub(Helper, 'calculateAnimationValue').returns(10);
    })
    
    afterEach(() => {
      applyStyleStub.restore();
      calculateStub.restore();
    });
    
    it('should correctly apply an attribute that isn\'t a transform attribute', () => {
      let testAttribute = new Attribute('opacity', 20);
      let transformString = testAttribute.render({}, '');
      
      assert.isTrue(calculateStub.calledOnce);
      assert.isTrue(applyStyleStub.calledWith({}, 'opacity', '30'));
      assert.equal(transformString, '');
    });
    
    it('should append a transform declaration to the transform string', () => {
      let testAttribute = new Attribute('scaleX', 20);
      let transformString = testAttribute.render({}, 'translateX(10px) ');
      
      assert.isTrue(calculateStub.calledOnce);
      assert.isFalse(applyStyleStub.called);
      assert.equal(transformString, 'translateX(10px) scaleX(30) ');
    });
    
    it('should correctly apply the deg unit for rotation attributes', () => {
      let testAttribute = new Attribute('rotate', 20);
      let testAttributeX = new Attribute('rotateX', 20);
      let testAttributeY = new Attribute('rotateY', 20);
      let testAttributeZ = new Attribute('rotateZ', 20);
      
      let transString = testAttribute.render({}, '');
      let transStringX = testAttributeX.render({}, '');
      let transStringY = testAttributeY.render({}, '');
      let transStringZ = testAttributeZ.render({}, '');
      
      assert.isFalse(applyStyleStub.called);
      assert.equal(calculateStub.callCount, 4);
      
      assert.equal(transString, 'rotate(30deg) ');
      assert.equal(transStringX, 'rotateX(30deg) ');
      assert.equal(transStringY, 'rotateY(30deg) ');
      assert.equal(transStringZ, 'rotateZ(30deg) ');
    });
    
    it('should correctly apply the px unit for perspective', () => {
      let testAttribute = new Attribute('perspective', 20);
      let transformString = testAttribute.render({}, '');
      
      assert.isTrue(calculateStub.calledOnce);
      assert.equal(transformString, '');
      
      assert.isTrue(applyStyleStub.calledWith({}, 'perspective', '30px'));
    });
    
    it('should correctly apply the px unit for translate transforms', () => {
      let testAttributeX = new Attribute('translateX', 20);
      let testAttributeY = new Attribute('translateY', 20);
      let testAttributeZ = new Attribute('translateZ', 20);
      
      let transStringX = testAttributeX.render({}, '');
      let transStringY = testAttributeY.render({}, '');
      let transStringZ = testAttributeZ.render({}, '');
      
      assert.isFalse(applyStyleStub.called);
      assert.equal(calculateStub.callCount, 3);
      
      assert.equal(transStringX, 'translateX(30px) ');
      assert.equal(transStringY, 'translateY(30px) ');
      assert.equal(transStringZ, 'translateZ(30px) ');
    });
  });
});
