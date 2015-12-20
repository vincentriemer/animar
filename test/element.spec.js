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

    it('should append transformation strings and apply the transform, adding translateZ if hardware acceleration ' +
      'is true', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');
      let translateRenderFunction = sinon.stub().returns(['translateX', '10px']);
      let scaleRenderFunction = sinon.stub().returns(['scaleY', '20deg']);
      testElement.attributes.set('translateX', { render: translateRenderFunction });
      testElement.attributes.set('translateY', { render: scaleRenderFunction });

      testElement.render(true);

      assert.isTrue(translateRenderFunction.called);
      assert.isTrue(scaleRenderFunction.called);
      assert.isTrue(applyStyleStub.calledWith(testDomElement, 'transform', 'translateX(10px) translateZ(0) scaleY(20deg)'));

      applyStyleStub.restore();
    });

    it('should append transformation strings and apply the transform, not adding translateZ when hardware ' +
      'acceleration is off', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');
      let translateRenderFunction = sinon.stub().returns(['translateX', '10px']);
      let scaleRenderFunction = sinon.stub().returns(['translateY', '2px']);
      testElement.attributes.set('translateX', { render: translateRenderFunction });
      testElement.attributes.set('translateY', { render: scaleRenderFunction });

      testElement.render(false);

      assert.isTrue(translateRenderFunction.called);
      assert.isTrue(scaleRenderFunction.called);
      assert.isTrue(applyStyleStub.calledWith(testDomElement, 'transform', 'translateX(10px) translateY(2px)'));

      applyStyleStub.restore();
    });

    it('should properly order the css transform attributes', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');

      let translateX = sinon.stub().returns(['translateX', '10px']);
      let translateY = sinon.stub().returns(['translateY', '10px']);
      let translateZ = sinon.stub().returns(['translateZ', '10px']);
      let scale = sinon.stub().returns(['scale', '10']);
      let scaleX = sinon.stub().returns(['scaleX', '10']);
      let scaleY = sinon.stub().returns(['scaleY', '10']);
      let scaleZ = sinon.stub().returns(['scaleZ', '10']);
      let rotateX = sinon.stub().returns(['rotateX', '10deg']);
      let rotateY = sinon.stub().returns(['rotateY', '10deg']);
      let rotateZ = sinon.stub().returns(['rotateZ', '10deg']);
      let rotate = sinon.stub().returns(['rotate', '10deg']);

      // deliberately out of order
      testElement.attributes.set('rotateX', { render: rotateX });
      testElement.attributes.set('rotateY', { render: rotateY });
      testElement.attributes.set('rotateZ', { render: rotateZ });
      testElement.attributes.set('scale', { render: scale });
      testElement.attributes.set('scaleX', { render: scaleX });
      testElement.attributes.set('scaleY', { render: scaleY });
      testElement.attributes.set('rotate', { render: rotate });
      testElement.attributes.set('translateX', { render: translateX });
      testElement.attributes.set('translateY', { render: translateY });
      testElement.attributes.set('translateZ', { render: translateZ });
      testElement.attributes.set('scaleZ', { render: scaleZ });

      testElement.render(false);

      sinon.assert.calledWith(applyStyleStub, testDomElement, 'transform',
        'translateX(10px) translateY(10px) translateZ(10px) scale(10) scaleX(10) scaleY(10) scaleZ(10) rotateX(10deg)' +
        ' rotateY(10deg) rotateZ(10deg) rotate(10deg)');

      applyStyleStub.restore();
    });

    it('should not add translateZ for hardware acceleration if there is already a translateZ defined', () => {
      let applyStyleStub = sinon.stub(Helpers, 'applyStyle');

      let translateZ = sinon.stub().returns(['translateZ', '10px']);
      testElement.attributes.set('translateZ', { render: translateZ });

      testElement.render(true);
      sinon.assert.calledWith(applyStyleStub, testDomElement, 'transform', 'translateZ(10px)');

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
