/* @flow */

// imports
var Animator = require("./Animator/animator");
var target = document.getElementById('target');

Animator.addAnimation({
  target         : target, 
  attribute      : 'translateX', 
  destination    : 700,
  duration       : 60,
  easingFunction : 'quadratic_in_out'
});

Animator.addAnimation({
  target         : target, 
  attribute      : 'translateY', 
  destination    : 700,
  duration       : 60,
  easingFunction : 'quadratic_in_out'
});

window.setInterval(function() {
  Animator.addAnimation({
    target         : target, 
    attribute      : 'translateY', 
    destination    : 0,
    duration       : 60,
    easingFunction : 'quadratic_in_out'
  });
}, 500);

window.setInterval(function() {
  Animator.addAnimation({
    target         : target, 
    attribute      : 'translateX', 
    destination    : 0,
    duration       : 60,
    easingFunction : 'quadratic_in_out'
  });
},750);