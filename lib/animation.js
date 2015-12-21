'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* @flow */
//eslint-disable-line no-unused-vars

/**
 * Class that holds all of the individual animation information.
 * @protected
 */
/*:: import type { ChainOptions } from './animar';*/

var Animation = (function () {

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

  function Animation(currentIteration /*:number*/, startValue /*:number*/, changeInValue /*:number*/, totalIterations /*:number*/, easingFunction /*:Function*/, loop /*:boolean*/, delay /*:number*/, wait /*:number*/) {
    _classCallCheck(this, Animation);

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

  _createClass(Animation, [{
    key: 'step',
    value: function step(timescale /*:number*/) {
      if (this.currentIteration < this.totalIterations + this.wait) {
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

  }, {
    key: 'loop',
    value: function loop(chainOptions /*:ChainOptions*/) {
      this.looping = true;
      this.wait = chainOptions.totalDuration - this.delay - this.totalIterations;
    }
  }]);

  return Animation;
})();

exports.default = Animation;