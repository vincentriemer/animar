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
});