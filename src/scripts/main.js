/* @flow */

var Animator = require("./Animator/animator"),
  Animation = require("./Animator/animation"),
  EasingFactory = require("./Animator/ease");

var target = document.getElementById('target'),
  animator = new Animator();

animator.addAnimation(target, 'translateX', 0, 100, 100, EasingFactory.linear());  