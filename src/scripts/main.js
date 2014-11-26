/* @flow */

// imports
var Animator      = require("./Animator/animator"),
    EasingFactory = require("./Animator/ease");

var target   = document.getElementById('target'),
    animator = new Animator();

animator.addAnimation(target, 'translateX', 0, 500, 100, EasingFactory.linear());
animator.addAnimation(target, 'translateY', 0, 300, 100, EasingFactory.linear());
