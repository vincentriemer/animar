export default class Animation {
  constructor(currentIteration, startValue, changeInValue, totalIterations, easingFunction, loop, delay, wait) {
    this.currentIteration = currentIteration;
    this.startValue = startValue;
    this.changeInValue = changeInValue;
    this.totalIterations = totalIterations;
    this.easingFunction = easingFunction;
    this.loop = loop;
    this.delay = delay;
    this.wait = wait;
  }

  step(timescale) {
    if (this.currentIteration < (this.totalIterations + this.wait)) {
      this.currentIteration += timescale;
    } else if (this.loop) {
      this.currentIteration = 0 - this.delay;
    } else {
      return false;
    }
    return true;
  }
}
