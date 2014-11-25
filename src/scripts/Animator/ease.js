/* @flow */

/**
 * A factory that produces some preset easing functions
 * @type {Object}
 */
var EasingFactory: {linear: Function} = {

    /**
     * Linear easing function.
     * @return {Function}
     */
    linear: function() {
       return function(currentIteration: number, startValue: number, changeInValue: number, totalIterations: number): number {
        return changeInValue * currentIteration / totalIterations + startValue;
      }
    }

};

module.exports = EasingFactory;