import Hook, { stepHook, loopHook } from '../src/hook';

import { assert } from 'chai';
import sinon from 'sinon';

describe('Hook', () => {
  describe('#Hook', () => {
    it('should return an Immutable Map with the arguments properly set', () => {
      const expectedHook = () => {};
      const expectedCurIteration = 1;
      const expectedDelay = 2;

      const testHook = Hook(expectedHook, expectedCurIteration, expectedDelay);

      const {
        hook: actualHook,
        currentIteration: actualCurIteration,
        delay: actualDelay
      } = testHook;

      assert.equal(actualHook, expectedHook);
      assert.equal(actualCurIteration, expectedCurIteration);
      assert.equal(actualDelay, expectedDelay);
    });

    it('should set the looping and wait properties to their defaults', () => {
      const expectedLooping = false;
      const expectedWait = 0;
      const expectedCalled = false;

      const testHook = Hook(()=>{}, 0, 0);

      const {
        looping: actualLooping,
        wait: actualWait,
        called: actualCalled
      } = testHook;

      assert.equal(actualLooping, expectedLooping);
      assert.equal(actualWait, expectedWait);
      assert.equal(actualCalled, expectedCalled);
    });
  });

  describe('#stepHook', () => {
    it('should step the currentIteration forward by the provided timescale amount', () => {
      const testHook = Hook(()=>{}, -1, 1);
      const result = stepHook(0.5)(testHook);
      assert.equal(result.currentIteration, -0.5);
    });

    it('should not step the currentIteration forward if it is greater than or equal to the wait value', () => {
      const testHook = Hook(()=>{}, 1, 0);
      const result = stepHook(0.5)(testHook);
      assert.equal(result.currentIteration, 1);
    });

    it('should run the hook function if currentIteration is greater than 0 and it hasn\'t been called before', () => {
      const hookSpy = sinon.spy();
      let testHook = Hook(hookSpy, 0, 0);
      testHook = testHook.merge({ wait: 40 });

      const result = stepHook(0.5)(testHook);

      sinon.assert.calledOnce(hookSpy);
      assert.equal(result.called, true);
    });

    it('should not run the hook function if it has been called before', () => {
      const hookSpy = sinon.spy();
      let testHook = Hook(hookSpy, 0, 0);
      testHook = testHook.merge({
        wait: 40, called: true
      });

      sinon.assert.notCalled(hookSpy);
    });

    it('should reset the currentIteration and called properties if the currentIteration is greater than the wait and' +
      'looping is set to true', () => {
      const hookSpy = sinon.spy();
      let testHook = Hook(hookSpy, 41, 20);
      testHook = testHook.merge({
        wait: 40, called: true, looping: true
      });

      const {
        currentIteration,
        called
      } = stepHook(0.5)(testHook);

      assert.equal(currentIteration, -20);
      assert.equal(called, false);
    });
  });

  describe('loopHook', () => {
    it('should set looping to true and set the wait value based on the chainoptions duration and hook delay', () => {
      const testHook = Hook(()=>{}, -20, 20);
      const testChainOptions = { totalDuration: 50 };
      const result = loopHook(testChainOptions)(testHook);

      assert.equal(result.looping, true);
      assert.equal(result.wait, 30);
    });
  });
});
