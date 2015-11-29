/* global GLOBAL */
/// <reference path="../typings/tsd.d.ts"/>
var assert = require('chai').assert;
var sinon = require('sinon');
var jsdom = require('jsdom');

import Animation from '../src/animation.js';
import * as Helpers from '../src/helpers.js';

function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global[key] = window[key]
  }
}

describe('Helpers', () => {
  let mockElement;

  beforeEach((done) => {
    if (__BROWSER__) {
      // TODO: Add browser environment setup
      done();
    } else {
      jsdom.env(
        '<div id="target"></div>',
        function (err, window) {
          global.window = window;
          global.document = window.document;
          propagateToGlobal(window);
          mockElement = document.getElementById('target');
          done();
        }
      );
    }
  });

  afterEach(() => {
    if (__BROWSER__) {
      // TODO: Add browser environment cleanup
    }
  });

  describe('#applyStyle()', () => {
    it('should set a transform string', () => {
      const transformString = 'translateX(20px) scale(1) rotate(30deg)';
      Helpers.applyStyle(mockElement, 'transform', transformString);
      assert.equal(mockElement.style.transform, transformString);
    });

    it('should set the opacity', () => {
      const opacityValue = '0';
      Helpers.applyStyle(mockElement, 'opacity', opacityValue);
      assert.equal(mockElement.style.opacity, opacityValue);
    });

    it('should set the perspective', () => {
      const perspectiveValue = '30px';
      Helpers.applyStyle(mockElement, 'perspective', perspectiveValue);
      assert.equal(mockElement.style.perspective, perspectiveValue);
    });

    it('should throw an error if it\'s provided an unknown attribute', () => {
      let exceptionSpy = sinon.spy(Helpers, 'applyStyle');
      try {
        Helpers.applyStyle(mockElement, 'blah', '20px');
      } catch (e) {} finally {
        assert.isTrue(Helpers.applyStyle.threw());
        exceptionSpy.restore();
      }
    });
  });

  describe('#calculateAnimationValue', () => {
    it('should add the result of passing the animation\'s propertes to its easing function', () => {
      let testEasingFunction1 = sinon.stub().returns(10);
      let testEasingFunction2 = sinon.stub().returns(20);

      let testAnimation1 = new Animation(0, -20, 20, 30, testEasingFunction1, false, 0, 0);
      let testAnimation2 = new Animation(0, -20, 20, 30, testEasingFunction2, false, 0, 0);
      let testAnimations = [testAnimation1, testAnimation2];

      let result = Helpers.calculateAnimationValue(testAnimations);

      assert.isTrue(testEasingFunction1.called);
      assert.isTrue(testEasingFunction2.called);
      assert.equal(result, 30);
    });

    it('should consider the currentIteration to be 0 if it\'s less than 0', () => {
      let testEasingFunction1 = sinon.stub().returns(10);
      let testAnimation1 = new Animation(-10, -20, 20, 30, testEasingFunction1, false, 0, 0);
      let testAnimations = [testAnimation1];

      let result = Helpers.calculateAnimationValue(testAnimations);

      assert.isTrue(testEasingFunction1.calledWith(0, testAnimation1.startValue, testAnimation1.changeInValue, testAnimation1.totalIterations));
      assert.equal(result, 10);
    });

    it('should consider the currentIteration to be equal to totalIterations if it is greater than totalIterations', () => {
      let testEasingFunction1 = sinon.stub().returns(10);
      let testAnimation1 = new Animation(35, -20, 20, 30, testEasingFunction1, false, 0, 0);
      let testAnimations = [testAnimation1];

      let result = Helpers.calculateAnimationValue(testAnimations);

      assert.isTrue(testEasingFunction1.calledWith(testAnimation1.totalIterations, testAnimation1.startValue, testAnimation1.changeInValue, testAnimation1.totalIterations));
      assert.equal(result, 10);
    });
  });

  describe("#getStartValue()", () => {
    let getTransformStub, getOpacityStub;

    beforeEach(() => {
      getTransformStub = sinon.stub(Helpers, 'getTransform').returns(5);
      getOpacityStub = sinon.stub(Helpers, 'getOpacity').returns(0.5);
    });

    afterEach(() => {
      getTransformStub.restore();
      getOpacityStub.restore();
    });

    it("should get a transform value", () => {
      let testAttribute = 'translateX';
      let result = Helpers.getStartValue(mockElement, testAttribute);
      assert.isTrue(getTransformStub.called);
      assert.equal(result, 5);
    });

    it("should get an opacity value", () => {
      let testAttribute = 'opacity';
      let result = Helpers.getStartValue(mockElement, testAttribute);
      assert.isTrue(getOpacityStub.called);
      assert.equal(result, 0.5);
    });

    it("should throw an error if it's provided an unknown attribute", () => {
      let testAttribute = 'foo';
      let getStartValueSpy = sinon.spy(Helpers, 'getStartValue');
      try {
        Helpers.getStartValue(mockElement, testAttribute);
      } catch (e) { } finally {
        assert.isTrue(getStartValueSpy.threw());
        getStartValueSpy.restore();
      }
    });
  });

  describe("#getOpacity()", () => {
    it("should get the computed opacity value for a dom element", () => {
      mockElement.style.opacity = 0.5;
      let result = Helpers.getOpacity(mockElement);
      assert.equal(result, 0.5);
    });
  });

  describe("#getTransform()", () => {

    // EXPECTED TRANSFORM RESULT = translateX(10px) translateY(10px) scaleX(5) scaleY(5) rotate(45deg)

    let getTransformMatrixStub;

    beforeEach(() => {
      getTransformMatrixStub = sinon.stub(Helpers, 'getTransformMatrix').returns([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    });

    afterEach(() => {
      getTransformMatrixStub.restore();
    });

    it("should get the correct translateX value", () => {
      let result = Helpers.getTransform(mockElement, 'translateX');
      assert.equal(result, 10);
    });

    it("should get the correct translateY value", () => {
      let result = Helpers.getTransform(mockElement, 'translateY');
      assert.equal(result, 10);
    });

    it("should get the correct scaleX value", () => {
      let result = Helpers.getTransform(mockElement, 'scaleX');
      assert.equal(result, 5);
    });

    it("should get the correct scaleY value", () => {
      let result = Helpers.getTransform(mockElement, 'scaleY');
      assert.equal(result, 5);
    });

    it("should should get the correct rotate value", () => {
      let result = Helpers.getTransform(mockElement, 'rotate');
      assert.equal(result, 45);
    });

    it("should throw an error if it is provided an unsupported transformation name", () => {
      let getTransformSpy = sinon.spy(Helpers, 'getTransform');
      try {
        Helpers.getTransform(mockElement, 'foo');
      } catch (e) { } finally {
        assert.isTrue(getTransformSpy.threw());
        getTransformSpy.restore();
      }
    });
  });

  describe("#getTransformMatrix()", () => {
    it("should correctly parse the matrix string", () => {
      window.getComputedStyle = sinon.stub().returns({
        getPropertyValue: function (arg) {
          return 'matrix(3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10)';
        }
      });

      let result = Helpers.getTransformMatrix(mockElement);
      assert.isTrue(window.getComputedStyle.called);
      assert.deepEqual(result, [3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    });

    it("should correctly handle an element that hasn't been transformed", () => {
      window.getComputedStyle = sinon.stub().returns({
        getPropertyValue: function (arg) {
          return 'none';
        }
      });

      let result = Helpers.getTransformMatrix(mockElement);
      assert.isTrue(window.getComputedStyle.called);
      assert.deepEqual(result, [1, 0, 0, 1, 0, 0]);
    });
  });
});