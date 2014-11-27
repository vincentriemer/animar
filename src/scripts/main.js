/* @flow */

// imports
var Animator      = require("./Animator/animator"),
    EasingFactory = require("./Animator/ease");

var target   = document.getElementById('target'),
    animator = new Animator();

animator.addAnimation(target, 'translateX', 0, 900, 50, EasingFactory.circular_in_out());