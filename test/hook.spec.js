/// <reference path="../typings/tsd.d.ts"/>

import Hook from '../src/hook';
let assert = chai.assert;

describe('Animation', () => {
  describe('#constructor', () => {
    it('should correctly set the instance properties', () => {
      const hookFunction = () => {},
        currentIteration = 12,
        loop = false,
        delay = 4,
        wait = 0;

      let hook = new Hook(hookFunction, currentIteration, loop, delay, wait);

      assert.equal(hook.hook, hookFunction);
      assert.equal(hook.currentIteration, currentIteration);
      assert.equal(hook.looping, loop);
      assert.equal(hook.delay, delay);
      assert.equal(hook.wait, wait);
      assert.equal(hook.called, false);
    });
  });

  describe('#step', () => {
    it('should step forward if the currentIteration is less than the wait', () => {
      let hook = new Hook(() => {}, -10, false, 10, 20);
      let result = hook.step(1);
      assert.equal(hook.currentIteration, -9);
      assert.isTrue(result);
    });

    it('should call the hook function once if the currentIteration is over 0', () => {
      let spy = sinon.spy();

      let hook = new Hook(spy, -1, false, 0, 20);
      hook.step(1);
      hook.step(1);

      sinon.assert.calledOnce(spy);
    });

    it('should return false if the currentIteration is over the wait time and is not looping', () => {
      let hook = new Hook(() => {}, 20, false, 0, 20);
      hook.called = true;

      let result = hook.step(1);

      assert.isFalse(result);
    });

    it('should reset the currentIteration value if it has past the wait time and is looping', () => {
      let hook = new Hook(() => {}, 20, true, 10, 20);
      hook.called = true;

      let result = hook.step(1);

      assert.isTrue(result);
      assert.equal(hook.currentIteration, -10);
      assert.isFalse(hook.called);
    });
  });

  describe('#loop', () => {
    it('should set the looping property to true and update the wait property', () => {
      let hook = new Hook(() => {}, 0, false, 20, 0);
      let chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 30
      };

      hook.loop(chainOptions);

      assert.isTrue(hook.looping);
      assert.equal(hook.wait, 10);
    });
  });
});
