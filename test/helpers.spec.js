/* global global */
/// <reference path="../typings/tsd.d.ts"/>

import Animation from '../src/animation.js';
import * as Helpers from '../src/helpers.js';

var assert = chai.assert;

function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;

    global[key] = window[key];
  }
}

describe('Helpers', () => {
  let mockElement;

  beforeEach((done) => {
    if (BROWSER) {
      if (document.getElementById('wrapper') == null) {
        let wrapper = document.createElement('div');
        wrapper.id = 'wrapper';
        document.body.appendChild(wrapper);
      }
      let wrapper = document.getElementById('wrapper');

      let target1 = document.createElement('div');
      target1.id = 'target';
      wrapper.appendChild(target1);

      mockElement = document.getElementById('target');
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
    if (BROWSER) {
      let wrapper = document.getElementById('wrapper');
      while (wrapper.hasChildNodes()) {
        wrapper.removeChild(wrapper.lastChild);
      }
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
      assert.throw(() => Helpers.applyStyle(mockElement, 'blah', '20px'));
      exceptionSpy.restore();
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
});
