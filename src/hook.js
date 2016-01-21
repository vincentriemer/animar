import Immutable from 'immutable';

const HOOK_DEFAULTS = {
  looping: false,
  wait: 0,
  called: false
};

export function stepHook(timescale) {
  return (hook) => {
    let output = hook;

    if (output.get('currentIteration') <= output.get('wait')) {
      output = output.update('currentIteration', currentIteration => currentIteration + timescale);
    }

    if (output.get('currentIteration') > 0 && !output.get('called')) {
      output.get('hook')();
      output = output.set('called', true);
    } else if ( output === hook && output.get('looping')) {
      output = output
        .set('currentIteration', 0 - output.get('delay'))
        .set('called', false);
    }

    return output;
  };
}

export function loopHook(chainOptions) {
  return (hook) => hook
    .set('looping', true)
    .set('wait', chainOptions.totalDuration - hook.get('delay'));
}

export default function(hook, currentIteration, delay) {
  return Immutable.Map(Object.assign({
    hook,
    currentIteration,
    delay
  }, HOOK_DEFAULTS));
}
