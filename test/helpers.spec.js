/// <reference path="../typings/tsd.d.ts"/>
'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const jsdom = require('jsdom');

import * as Helpers from '../lib/helpers';
import Animation from '../lib/animation';

jsdom.env(
  '<div id="test"></div>',
  [], (errors, window) => {
    describe('Helpers', () => {
      let testDOMElement = window.document.getElementById("test");
      
      afterEach(() => {
        // reset all animateable properties
        testDOMElement.style.webkitTransform = '';
        testDOMElement.style.MozTransform = '';
        testDOMElement.style.msTransform = '';
        testDOMElement.style.OTransform = '';
        testDOMElement.style.transform = '';
        testDOMElement.style.opacity = '1';
        testDOMElement.style.perspective = 'none';
      });
      
      describe('#applyStyle()', () => {
        it('should set a transform string', () => {
          const transformString = 'translateX(20px) scale(1) rotate(30deg)';
          Helpers.applyStyle(testDOMElement, 'transform', transformString);
          assert.equal(testDOMElement.style.transform, transformString);
        });
        
        it('should set the opacity', () => {
          const opacityValue = '0';
          Helpers.applyStyle(testDOMElement, 'opacity', opacityValue);
          assert.equal(testDOMElement.style.opacity, opacityValue);
        });
        
        it('should set the perspective', () => {
          const perspectiveValue = '30px';
          Helpers.applyStyle(testDOMElement, 'perspective', perspectiveValue);
          assert.equal(testDOMElement.style.perspective, perspectiveValue);
        })
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
  });