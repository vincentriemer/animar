/* @flow */
import type { ChainOptions } from './animar'; //eslint-disable-line no-unused-vars

/**
 * Class that holds all of the individual animation information.
 * @protected
 */
export default class Animation {
  currentIteration:number;
  startValue:number;
  changeInValue:number;
  totalIterations:number;
  easingFunction:Function;
  looping:boolean;
  delay:number;
  wait:number;

  /**
   * Create a new Animation instance.
   * @param currentIteration
   * @param startValue
   * @param changeInValue
   * @param totalIterations
   * @param easingFunction
   * @param loop
   * @param delay
   * @param wait
   */
  constructor (currentIteration:number,
              startValue:number,
              changeInValue:number,
              totalIterations:number,
              easingFunction:Function,
              loop:boolean,
              delay:number,
              wait:number) {
    this.currentIteration = currentIteration;
    this.startValue = startValue;
    this.changeInValue = changeInValue;
    this.totalIterations = totalIterations;
    this.easingFunction = easingFunction;
    this.looping = loop;
    this.delay = delay;
    this.wait = wait;
  }

  /**
   * Step the animation instance forward.
   * @param timescale
   * @returns {boolean}
   */
  step (timescale:number):boolean {
    if (this.currentIteration < (this.totalIterations + this.wait)) {
      this.currentIteration += timescale;
    } else if (this.looping) {
      this.currentIteration = 0 - this.delay;
    } else {
      return false;
    }
    return true;
  }

  /**
   * Loop the animation instance.
   * @param chainOptions
   */
  loop (chainOptions:ChainOptions) {
    this.looping = true;
    this.wait = chainOptions.totalDuration - this.delay - this.totalIterations;
  }
}
