/**
 * Created by vincentriemer on 11/17/14.
 * @flow
 */

var Animation = require("./animation");
var EasingFactory = require("./ease");

type Options = {

};

/**
 * The main animation api.
 * @constructor
 * @param {Options} options - the options which configure the animation library.
 */
var Animator = function(options?: Options) {

    this.options = options || {};
    this.elementMap = new Map();

    this.addAnimation = function() {};
};

module.exports = Animator;