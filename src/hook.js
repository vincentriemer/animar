/* @flow */
import type { ChainOptions } from './animar'; //eslint-disable-line no-unused-vars

/**
 * Class that the information for a function hook.
 * @protected
 */
export default class Hook {
  hook:Function;
  currentIteration:number;
  looping:boolean;
  delay:number;
  wait:number;
  called:boolean;

  /**
   * Create a new Animation instance.
   * @param {Function} hook
   * @param {number} currentIteration
   * @param {boolean} loop
   * @param {number} delay
   * @param {number} wait
   */
  constructor (hook:Function,
               currentIteration:number,
               loop:boolean,
               delay:number,
               wait:number) {
    this.hook = hook;
    this.currentIteration = currentIteration;
    this.looping = loop;
    this.delay = delay;
    this.wait = wait;
    this.called = false;
  }

  /**
   * Step the hook instance forward.
   * @param timescale
   * @returns {boolean}
   */
  step (timescale:number):boolean {
    if (this.currentIteration <= this.wait) {
      this.currentIteration += timescale;
    }

    let unfinished = this.currentIteration <= this.wait;

    if (this.currentIteration > 0 && !this.called) {
      this.hook();
      this.called = true;
    } else if (!unfinished && this.looping) {
      this.currentIteration = 0 - this.delay;
      this.called = false;
      unfinished = true;
    }

    return unfinished;
  }

  /**
   * Loop the hook instance.
   * @param chainOptions
   */
  loop (chainOptions:ChainOptions) {
    this.looping = true;
    this.wait = chainOptions.totalDuration - this.delay;
  }
}

