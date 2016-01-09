import Animation, { stepAnimation, loopAnimation } from '../src/animation';

describe('Animation', () => {
  describe('#Animation', () => {
    it('should return an object with all the properties set from it\'s given arguments', () => {
      const currentIteration = 0,
        startValue = -20,
        changeInValue = 20,
        totalIterations = 60,
        easingFunction = function () { },
        looping = false, // is a default
        delay = 0,
        wait = 0; // is a default

      const actual = Animation(currentIteration, startValue, changeInValue, totalIterations, easingFunction, delay);

      assert.deepEqual(actual, {
        currentIteration,
        startValue,
        changeInValue,
        totalIterations,
        easingFunction,
        looping,
        delay,
        wait
      });
    });
  });

  describe('#stepAnimation', () => {
    it('should return a function which returns an animation with a currentIteration incremented by the provided ' +
      'timescale', () => {
      let testAnimation = Animation(0, -20, 20, 60, () => {}, 0);
      let timescale = 0.5;

      let result = stepAnimation(timescale)(testAnimation);

      assert.equal(result.currentIteration, timescale);
    });

    it('should return a function which returns an animation that has reset the currentIteration value to the ' +
      'inverse of the animation\'s delay value if looping is enabled and the currentIteration is greater than or' +
      'equal to the totalIterations', () => {
      let testAnimation = Animation(60, -20, 20, 60, () => {}, 10);
      testAnimation.looping = true;

      let result = stepAnimation(1)(testAnimation);
      assert.equal(result.currentIteration, -10);
    });

    it('should return a function which continues iterating after totalIterations if the input animation has a wait' +
      'value', () => {
      let testAnimation = new Animation(60, -20, 20, 60, () => {}, 0);
      testAnimation.wait = 10;

      let result = stepAnimation(1)(testAnimation);

      assert.equal(result.currentIteration, 61);
    });

    it('should return a function which does returns it\'s input if the animation is over', () => {
      let testAnimation = new Animation(60, -20, 20, 60, () => {}, 0);

      let result = stepAnimation(1)(testAnimation);
      assert.strictEqual(result, testAnimation);
    });
  });

  describe('#loopAnimation', () => {
    it('should return a function which returns a copy of the given animation but with the looping property set to' +
      'true', () => {
      let chainOptions = { totalDuration: 100 };
      let testAnimation = new Animation(0, -20, 20, 60, () => {}, 0);

      let result = loopAnimation(chainOptions)(testAnimation);

      assert.isTrue(result.looping);
    });

    it('should return a function that returns a copy of the given animation but with its wait value set to the ' +
      'chain\'s totalDuration minus the animation\'s delay and totalIterations', () => {
      let chainOptions = { totalDuration: 100 };
      let testAnimation = Animation(0, -20, 20, 60, () => {}, 0);

      let result = loopAnimation(chainOptions)(testAnimation);

      assert.equal(result.wait, 40);
    });
  });
});
