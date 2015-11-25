/* @flow */

module.exports = class Animation {
  currentIteration: number;
  startValue: number;
  changeInValue: number;
  totalIterations: number;
  easingFunction: Function;
  loop: boolean;
  delay: number;
  wait: number;

  constructor(
    currentIteration: number,
    startValue: number,
    changeInValue: number,
    totalIterations:number,
    easingFunction: Function,
    loop: boolean,
    delay: number,
    wait: number
  ) {
    this.currentIteration = currentIteration;
    this.startValue = startValue;
    this.changeInValue = changeInValue;
    this.totalIterations = totalIterations;
    this.easingFunction = easingFunction;
    this.loop = loop;
    this.delay = delay;
    this.wait = wait;
  }

  step(timescale: number): boolean {
    if (this.currentIteration < (this.totalIterations + this.wait)) {
      this.currentIteration += timescale;
    } else if (this.loop) {
      this.currentIteration = 0 - this.delay;
    } else {
      return false;
    }
    return true;
  }
};
