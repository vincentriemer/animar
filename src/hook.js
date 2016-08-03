/* @flow */

import { ChainOptions, Hook, HookFunction } from './types';

const HOOK_DEFAULTS = {
  looping: false,
  called:  false,
  wait:    0
};

export function stepHook(timescale: number) {
  return (hook: Hook): Hook => {
    let output = { ...hook };

    if (output.currentIteration <= output.wait) {
      output.currentIteration = output.currentIteration + timescale;
    }

    if (output.currentIteration > 0 && !output.called) {
      output.hook();
      output.called = true;
    } else if ( output.currentIteration === hook.currentIteration && output.looping) {
      output.currentIteration = 0 - output.delay;
      output.called = false;
    }

    return output;
  };
}

export function loopHook(chainOptions: ChainOptions) {
  return (hook: Hook): Hook => ({
    ...hook,
    looping: true,
    wait: chainOptions.totalDuration - hook.delay
  });
}

export default function(hook: HookFunction, currentIteration: number, delay: number): Hook {
  return {
    ...HOOK_DEFAULTS,
    hook, currentIteration, delay
  };
}
