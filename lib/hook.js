'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* @flow */
//eslint-disable-line no-unused-vars

/**
 * Class that the information for a function hook.
 * @protected
 */
/*:: import type { ChainOptions } from './animar';*/

var Hook = (function () {

  /**
   * Create a new Animation instance.
   * @param {Function} hook
   * @param {number} currentIteration
   * @param {boolean} loop
   * @param {number} delay
   * @param {number} wait
   */

  function Hook(hook /*:Function*/, currentIteration /*:number*/, loop /*:boolean*/, delay /*:number*/, wait /*:number*/) {
    _classCallCheck(this, Hook);

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

  _createClass(Hook, [{
    key: 'step',
    value: function step(timescale /*:number*/) {
      if (this.currentIteration <= this.wait) {
        this.currentIteration += timescale;
      }

      var unfinished = this.currentIteration <= this.wait;

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

  }, {
    key: 'loop',
    value: function loop(chainOptions /*:ChainOptions*/) {
      this.looping = true;
      this.wait = chainOptions.totalDuration - this.delay;
    }
  }]);

  return Hook;
})();

exports.default = Hook;