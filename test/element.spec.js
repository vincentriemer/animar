/// <reference path="../typings/tsd.d.ts"/>

import Element from '../src/element.js';
import * as Helpers from '../src/helpers.js';

var assert = chai.assert;

describe('Element', () => {
  let testDomElement, testElement;

  beforeEach(() => {
    // TODO: use actual HTMLElement instead of mock object
    testDomElement = {};
    testElement = new Element(testDomElement);
  });

  describe('#constructor()', () => {
    it('should store the dom element and initialize a new Map', () => {
      assert.equal(testElement.domElement, testDomElement);
      assert.property(testElement, 'attributes');
    });
  });

  describe('#render()', () => {
    it('should call the render function on all attributes', () => {
      let attributeRenderFunction = sinon.stub().returns('');
      testElement.attributes.set('opacity', { render: attributeRenderFunction });
      testElement.attributes.set('perspective', { render: attributeRenderFunction });

      testElement.render();

      assert.isTrue(attributeRenderFunction.calledTwice);
    });

    it('should append transformation strings and apply the transform, adding translateZ when hardware acceleration' +
      'is on', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');
      let translateRenderFunction = sinon.stub().returns('translateX(10px) ');
      let scaleRenderFunction = sinon.stub().returns('scale(2) ');
      testElement.attributes.set('translateX', { render: translateRenderFunction });
      testElement.attributes.set('scale', { render: scaleRenderFunction });

      testElement.render(true);

      assert.isTrue(translateRenderFunction.called);
      assert.isTrue(scaleRenderFunction.called);
      assert.isTrue(applyStyleStub.calledWith(testDomElement, 'transform', 'translateX(10px) scale(2) translateZ(0)'));

      applyStyleStub.restore();
    });

    it('should append transformation strings and apply the transform, not adding translateZ when hardware ' +
      'acceleration is off', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');
      let translateRenderFunction = sinon.stub().returns('translateX(10px) ');
      let scaleRenderFunction = sinon.stub().returns('scale(2) ');
      testElement.attributes.set('translateX', { render: translateRenderFunction });
      testElement.attributes.set('scale', { render: scaleRenderFunction });

      testElement.render(false);

      assert.isTrue(translateRenderFunction.called);
      assert.isTrue(scaleRenderFunction.called);
      assert.isTrue(applyStyleStub.calledWith(testDomElement, 'transform', 'translateX(10px) scale(2) '));

      applyStyleStub.restore();
    });
  });

  describe('#merge()', () => {
    it('should correctly call merge on all attributes that exist in both elements', () => {
      let testElement2 = new Element({});
      let mergeStub = sinon.stub().returns('blah');
      testElement.addAttribute('test', {merge: mergeStub});
      testElement2.addAttribute('test', {});

      let result = testElement.merge(testElement2);

      assert.isTrue(mergeStub.calledOnce);
      assert.equal(result.attributes.get('test'), 'blah');
    });

    it('should add attributes which it doesn\'t have from the target', () => {
      let testElement2 = new Element({});
      let mergeStub = sinon.stub().returns('blah');
      testElement.addAttribute('test', {merge: mergeStub});
      testElement2.addAttribute('test2', {});

      let result = testElement.merge(testElement2);

      assert.isFalse(mergeStub.calledOnce);
      assert.isTrue(result.attributes.has('test2'));
    });
  });

  describe('#addAttribute', () => {
    it('should add an attribute to the element', () => {
      let testAttribute = { foo: 'bar' };
      testElement.addAttribute('test', testAttribute);
      assert.equal(testElement.attributes.get('test'), testAttribute);
    });
  });

  describe('#step()', () => {
    it('should execute the step function on every attribute in the attributes map, passing in the timescale parameter', () => {
      let timescale = 1;
      let stepStub1 = sinon.stub();
      let stepStub2 = sinon.stub();
      let testAttribute1 = { step: stepStub1 };
      let testAttribute2 = { step: stepStub2 };
      testElement.addAttribute('test1', testAttribute1);
      testElement.addAttribute('test2', testAttribute2);

      testElement.step(timescale);

      assert.isTrue(stepStub1.calledOnce);
      assert.isTrue(stepStub1.calledWith(timescale));

      assert.isTrue(stepStub2.calledOnce);
      assert.isTrue(stepStub2.calledWith(timescale));
    });

    it('should return false if all attribute step functions return false', () => {
      let timescale = 1;
      let stepStub1 = sinon.stub().returns(false);
      let stepStub2 = sinon.stub().returns(false);
      let testAttribute1 = { step: stepStub1 };
      let testAttribute2 = { step: stepStub2 };
      testElement.addAttribute('test1', testAttribute1);
      testElement.addAttribute('test2', testAttribute2);

      let result = testElement.step(timescale);

      assert.equal(result, false);
    });

    it('should return true if at least 1 attribute step function returns true', () => {
      let timescale = 1;
      let stepStub1 = sinon.stub().returns(true);
      let stepStub2 = sinon.stub().returns(false);
      let testAttribute1 = { step: stepStub1 };
      let testAttribute2 = { step: stepStub2 };
      testElement.addAttribute('test1', testAttribute1);
      testElement.addAttribute('test2', testAttribute2);

      let result = testElement.step(timescale);

      assert.equal(result, true);
    });
  });

  describe('#loop', () => {
    let chainOptions;
    beforeEach(() => {
      chainOptions = {totalDuration: 100};
    });

    it('should call the loop function on each of its animations', () => {
      let testAttribute1 = {loop: sinon.spy()};
      let testAttribute2 = {loop: sinon.spy()};

      testElement.addAttribute('test1', testAttribute1);
      testElement.addAttribute('test2', testAttribute2);

      testElement.loop(chainOptions);

      sinon.assert.calledWith(testAttribute1.loop, chainOptions);
      sinon.assert.calledWith(testAttribute2.loop, chainOptions);
    });
  });
});
