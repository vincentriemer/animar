/* @flow */

import { Animation, EasingFunction, ChainOptions } from './types';

const ANIMATION_DEFAULTS = {
  looping: false,
  wait:    0
};

function animationValueReducer(animationValue: number, animation: Animation): number {
  let { currentIteration, totalIterations, easingFunction, startValue, changeInValue } = animation;

  if (currentIteration < 0) {
    currentIteration = 0;
  } else if (currentIteration > totalIterations) {
    currentIteration = totalIterations;
  }

  return animationValue + easingFunction(currentIteration, startValue, changeInValue, totalIterations);
}

export function calculateAnimationValue (animations: Array<Animation>) {
  return animations.reduce(animationValueReducer, 0);
}

export function stepAnimation(timescale: number) {
  return (animation: Animation): Animation|null => {
    let { currentIteration, totalIterations, wait, delay, looping } = animation;

    if (currentIteration < (totalIterations + wait)) {
      return { ...animation, currentIteration: currentIteration + timescale };
    } else if (looping) {
      return { ...animation, currentIteration: 0 - delay };
    } else {
      return null;
    }
  };
}

export function loopAnimation(chainOptions: ChainOptions): (animation: Animation) => Animation {
  return animation => ({
    ...animation,
    looping: true,
    wait: chainOptions.totalDuration - animation.delay - animation.totalIterations
  });
}

export default function(
    currentIteration: number,
    startValue:       number,
    changeInValue:    number,
    totalIterations:  number,
    easingFunction:   EasingFunction,
    delay:            number
    ): Animation {
  return {
    currentIteration,
    startValue,
    changeInValue,
    totalIterations,
    easingFunction,
    delay,
    looping: ANIMATION_DEFAULTS.looping,
    wait: ANIMATION_DEFAULTS.wait
  };
}
