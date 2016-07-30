const ANIMATION_DEFAULTS = {
  looping: false,
  wait: 0
};

function animationValueReducer(animationValue, animation) {
  let { currentIteration, totalIterations, easingFunction, startValue, changeInValue } = animation;

  if (currentIteration < 0) {
    currentIteration = 0;
  } else if (currentIteration > totalIterations) {
    currentIteration = totalIterations;
  }

  return animationValue + easingFunction(currentIteration, startValue, changeInValue, totalIterations);
}

export function calculateAnimationValue (animations) {
  return animations.reduce(animationValueReducer, 0);
}

export function stepAnimation(timescale) {
  return (animation) => {
    let { currentIteration, totalIterations, wait, delay, looping } = animation;

    if (currentIteration < (totalIterations + wait)) {
      return Object.assign({}, animation, {
        currentIteration: currentIteration + timescale
      });
    } else if (looping) {
      return Object.assign({}, animation, {
        currentIteration: 0 - delay
      });
    } else {
      return null;
    }
  };
}

export function loopAnimation(chainOptions) {
  return animation => Object.assign({}, animation, {
    looping: true,
    wait: chainOptions.totalDuration - animation.delay - animation.totalIterations
  });
}

export default function(currentIteration, startValue, changeInValue, totalIterations, easingFunction, delay) {
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
