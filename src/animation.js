const ANIMATION_DEFAULTS = {
  looping: false,
  wait: 0
};

export function calculateAnimationValue (animations) {
  return animations.reduce((animationValue, {
    currentIteration, totalIterations, startValue, changeInValue, easingFunction
  }) => {
    if (currentIteration < 0) {
      currentIteration = 0;
    } else if (currentIteration > totalIterations) {
      currentIteration = totalIterations;
    }
    return animationValue + easingFunction(currentIteration, startValue, changeInValue, totalIterations);
  }, 0);
}

export function stepAnimation(timescale) {
  return (anim) => {
    let currentIteration = anim.currentIteration;

    if (anim.currentIteration < (anim.totalIterations + anim.wait)) {
      currentIteration += timescale;
    } else if (anim.looping) {
      currentIteration = 0 - anim.delay;
    } else {
      return anim; // nothing changed so we can return the original object
    }

    return Object.assign({}, anim, { currentIteration });
  };
}

export function loopAnimation(chainOptions) {
  return (anim) => Object.assign({}, anim, {
    looping: true,
    wait: chainOptions.totalDuration - anim.delay - anim.totalIterations
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
