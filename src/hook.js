const HOOK_DEFAULTS = {
  looping: false,
  wait: 0,
  called: false
};

export function stepHook(timescale) {
  return (hook) => {
    let output = Object.assign({}, hook);

    if (output.currentIteration <= output.wait) {
      output.currentIteration = output.currentIteration + timescale;
    }

    if (output.currentIteration > 0 && !output.called) {
      output.hook();
      output.called = true;
    } else if ( output.currentIteration === hook.currentIteration &&
        output.looping) {
      output.currentIteration = 0 - output.delay;
      output.called = false;
    }

    return output;
  };
}

export function loopHook(chainOptions) {
  return hook => Object.assign({}, hook, {
    looping: true,
    wait: chainOptions.totalDuration - hook.delay
  });
}

export default function(hook, currentIteration, delay) {
  return Object.assign({}, HOOK_DEFAULTS, {
    hook, currentIteration, delay
  });
}
