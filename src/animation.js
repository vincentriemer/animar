import Immutable from 'immutable';

const ANIMATION_DEFAULTS = {
  looping: false,
  wait: 0
};

function animationValueReducer(animationValue, animation) {
  let { currentIteration, totalIterations, easingFunction, startValue, changeInValue } = animation.toJS();

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
  return (anim) => {
    let { currentIteration, totalIterations, wait, delay, looping } = anim.toJS();

    if (currentIteration < (totalIterations + wait)) {
      return anim.set('currentIteration', currentIteration += timescale);
    } else if (looping) {
      return anim.set('currentIteration', 0 - delay);
    } else {
      return null;
    }
  };
}

export function loopAnimation(chainOptions) {
  return (anim) => anim
    .set('looping', true)
    .set('wait', chainOptions.totalDuration - anim.get('delay') - anim.get('totalIterations'));
}

export default function(currentIteration, startValue, changeInValue, totalIterations, easingFunction, delay) {
  return Immutable.Map({
    currentIteration,
    startValue,
    changeInValue,
    totalIterations,
    easingFunction,
    delay,
    looping: ANIMATION_DEFAULTS.looping,
    wait: ANIMATION_DEFAULTS.wait
  });
}
