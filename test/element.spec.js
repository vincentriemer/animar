/// <reference path="../typings/tsd.d.ts"/>
'use strict';

let assert = require('chai').assert;
let sinon = require('sinon');

import Element from '../lib/element';
import Attribute from '../lib/attribute';
import * as Helpers from '../lib/helpers';

describe('Element', () => {
  let testDomElement, testElement;
  
  beforeEach(() => {
    testDomElement = {};
    testElement = new Element(testDomElement);
  });
  
  describe('#constructor()', () => {
    it('should store the dom element and initialize a new Map', () => {
      assert.equal(testElement.domElement, testDomElement);
      assert.property(testElement, 'attributes');
    });
  });
  
  describe("#render()", () => {
    it("should call the render function on all attributes", () => {
      let attributeRenderFunction = sinon.stub().returns('');
      testElement.attributes.set('opacity', { render: attributeRenderFunction });
      testElement.attributes.set('perspective', { render: attributeRenderFunction });
      
      testElement.render();
      
      assert.isTrue(attributeRenderFunction.calledTwice);
    });
    
    it('should append transformation strings and apply the transfrom', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');
      let translateRenderFunction = sinon.stub().returns('translateX(10px) ');
      let scaleRenderFunction = sinon.stub().returns('scale(2) ');
      testElement.attributes.set('translateX', { render: translateRenderFunction });
      testElement.attributes.set('scale', { render: scaleRenderFunction });
      
      testElement.render();
      
      assert.isTrue(translateRenderFunction.called);
      assert.isTrue(scaleRenderFunction.called);
      assert.isTrue(applyStyleStub.calledWith(testDomElement, 'transform', 'translateX(10px) scale(2) translateZ(0)'));
      
      applyStyleStub.restore();
    });
  });
  
  describe("#merge()", () => {
    it("should correctly call merge on all attributes that exist in both elements", () => {
      let testElement2 = new Element({});
      let mergeStub = sinon.stub().returns('blah');
      testElement.addAttribute('test', {merge: mergeStub});
      testElement2.addAttribute('test', {});
      
      let result = testElement.merge(testElement2);
      
      assert.isTrue(mergeStub.calledOnce);
      assert.equal(result.attributes.get('test'), 'blah');
    });
    
    it("should add attributes which it doesn't have from the target", () => {
      let testElement2 = new Element({});
      let mergeStub = sinon.stub().returns('blah');
      testElement.addAttribute('test', {merge: mergeStub});
      testElement2.addAttribute('test2', {});
      
      let result = testElement.merge(testElement2);
      
      assert.isFalse(mergeStub.calledOnce);
      assert.isTrue(result.attributes.has('test2'));
    });
  });
  
  describe("#addAttribute", () => {
    it('should add an attribute to the element', () => {
      let testAttribute = { foo: 'bar' };
      testElement.addAttribute('test', testAttribute);
      assert.equal(testElement.attributes.get('test'), testAttribute);
    });
  });
  
  describe("#forEachAnimationInAttribute()", () => {
    it("should perform an attribute's forEachAnimation passing the callback", () => {
      let forEachStub = sinon.stub().returns('blah');
      let testAttribute = { forEachAnimation: forEachStub };
      
      testElement.addAttribute('test', testAttribute);
      
      let testCallback = () => { let foo = 'bar'; };
      
      let result = testElement.forEachAnimationInAttribute(testCallback);
      
      assert.isTrue(forEachStub.calledOnce);
      assert.equal(result.get('test'), 'blah');
    });
  });
  
  describe("#hasAttribute()", () => {
    it("should return a boolean representing the existance of an attribute", () => {
      testElement.addAttribute('test', {});
      assert.isTrue(testElement.hasAttribute('test'));
      assert.isFalse(testElement.hasAttribute('foo'));
    });
  });
  
  describe("#getModelFromAttribute", () => {
    it("should return the model from the given attribute name", () => {
      let testAttribute = new Attribute('test', 23);
      testElement.addAttribute('test', testAttribute);
      
      assert.equal(testElement.getModelFromAttribute('test'), 23);
    });
  });
});