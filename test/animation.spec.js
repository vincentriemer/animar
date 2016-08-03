import Animation, { stepAnimation, loopAnimation, calculateAnimationValue } from '../src/animation';

const assert = chai.assert;

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
      let testAnimation = Animation(60, -20, 20, 60, () => {}, 0);
      testAnimation.wait = 10;

      let result = stepAnimation(1)(testAnimation);

      assert.equal(result.currentIteration, 61);
    });

    it('should return a function which returns null if the animation is over', () => {
      let testAnimation = Animation(60, -20, 20, 60, () => {}, 0);

      let result = stepAnimation(1)(testAnimation);
      assert.strictEqual(result, null);
    });
  });

  describe('#loopAnimation', () => {
    it('should return a function which returns a copy of the given animation but with the looping property set to' +
      'true', () => {
      let chainOptions = { totalDuration: 100 };
      let testAnimation = Animation(0, -20, 20, 60, () => {}, 0);

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

  describe('#calculateAnimationValue', () => {
    it('should add the result of passing the animation\'s propertes to its easing function', () => {
      let testEasingFunction1 = sinon.stub().returns(10);
      let testEasingFunction2 = sinon.stub().returns(20);

      let testAnimation1 = Animation(0, -20, 20, 30, testEasingFunction1, false, 0, 0);
      let testAnimation2 = Animation(0, -20, 20, 30, testEasingFunction2, false, 0, 0);
      let testAnimations = [testAnimation1, testAnimation2];

      let result = calculateAnimationValue(testAnimations);

      assert.isTrue(testEasingFunction1.called);
      assert.isTrue(testEasingFunction2.called);
      assert.equal(result, 30);
    });

    it('should consider the currentIteration to be 0 if it\'s less than 0', () => {
      let testEasingFunction1 = sinon.stub().returns(10);
      let testAnimation1 = Animation(-10, -20, 20, 30, testEasingFunction1, false, 0, 0);
      let testAnimations = [testAnimation1];

      let result = calculateAnimationValue(testAnimations);

      sinon.assert.calledWith(testEasingFunction1, 0,
        testAnimation1.startValue,
        testAnimation1.changeInValue,
        testAnimation1.totalIterations);

      assert.equal(result, 10);
    });

    it('should consider the currentIteration to be equal to totalIterations if it is greater than totalIterations', () => {
      let testEasingFunction1 = sinon.stub().returns(10);
      let testAnimation1 = Animation(35, -20, 20, 30, testEasingFunction1, false, 0, 0);
      let testAnimations = [testAnimation1];

      let result = calculateAnimationValue(testAnimations);

      sinon.assert.calledWith(testEasingFunction1,
        testAnimation1.totalIterations,
        testAnimation1.startValue,
        testAnimation1.changeInValue,
        testAnimation1.totalIterations);
      assert.equal(result, 10);
    });
  });
});
