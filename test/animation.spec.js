/// <reference path="../typings/tsd.d.ts"/>
'use strict';

let assert = require('chai').assert;

import Animation from '../lib/animation';

describe('Animation', () => {
  describe('#constructor()', () => {
    it('should correctly set the instance properties', () => {
      const currentIter = 0,
        startVal = -20,
        changeInVal = 20,
        totalIter = 60,
        testEasingFunction = function () { },
        loopVal = false,
        delayVal = 0,
        waitVal = 0;
      
      const testAnimation = new Animation(
        currentIter,
        startVal,
        changeInVal,
        totalIter,
        testEasingFunction,
        loopVal,
        delayVal,
        waitVal
      );
      
      assert.equal(testAnimation.currentIteration, currentIter);
      assert.equal(testAnimation.startValue, startVal);
      assert.equal(testAnimation.changeInValue, changeInVal);
      assert.equal(testAnimation.totalIterations, totalIter);
      assert.equal(testAnimation.easingFunction, testEasingFunction);
      assert.equal(testAnimation.loop, loopVal);
      assert.equal(testAnimation.delay, delayVal);
      assert.equal(testAnimation.wait, waitVal);
    });
  });
  
  describe('#step()', () => {
    it('should increment the currentIteration value', () => {
      let testAnimation = new Animation(0, -20, 20, 60, () => { }, false, 0, 0);
      testAnimation.step();
      
      assert.equal(testAnimation.currentIteration, 1);
    });
    
    it('should reset the currentIteration value to the inverse of the animation\'s' +
      'delay value if looping is enabled and the currentIteration matches the' +
      'totalIterations', () => {
        let testAnimation = new Animation(60, -20, 20, 60, () => { }, true, 10, 0);
        testAnimation.step();
        
        assert.equal(testAnimation.currentIteration, -10);
      });
    
    it('should continue iterating after totalIterations if the animation has a wait' +
      'value', () => {
        let testAnimation = new Animation(60, -20, 20, 60, () => { }, false, 0, 10);
        testAnimation.step();
        
        assert.equal(testAnimation.currentIteration, 61);
      });
    
    it('should not increment if the animation is over', () => {
      let testAnimation = new Animation(60, -20, 20, 60, () => { }, false, 0, 0);
      testAnimation.step();
      
      assert.equal(testAnimation.currentIteration, 60);
    });
    
  });
});