/* @flow */

// imports
var Animation     = require("./animation"),
    EasingFactory = require("./ease");

type Options = {

};

/**
 * The main animation API.
 * @constructor
 * @param {Options} options - the options which configure the animation library.
 */
var Animator = function(options?: Options) {

    this.options = options || {};
    this.elementMap = new Map();

    /**
     * Add a new animation to the target and start it immediately
     * @param {HTMLElement} target - the target HTML DOM element that will be animated                   
     * @param {string} attribute - the attribute that will be animated
     * @param {number} start - the attribute's starting value                       
     * @param {number} end - the attribute's ending value                                          
     * @param {number} duration - the number of frames the animation will take to complete
     * @param {Function} ease - the easing function which is applied to the animation                                    
     */
    this.addAnimation = function(
        target    : HTMLElement, 
        attribute : string, 
        start     : number, 
        end       : number, 
        duration  : number, 
        ease      : Function) {

    };
};

module.exports = Animator;