/* @flow */
import type { ChainOptions } from './animar';

class Animation {
  currentIteration:number;
  startValue:number;
  changeInValue:number;
  totalIterations:number;
  easingFunction:Function;
  looping:boolean;
  delay:number;
  wait:number;

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

  loop (chainOptions:ChainOptions) {
    this.looping = true;
    this.wait = chainOptions.totalDuration - this.delay - this.totalIterations;
  }
}

export default Animation;
