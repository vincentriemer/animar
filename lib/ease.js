var EasingFactory = {
  linear: function() {
    return function(t, b, c, d) {
      return c*t/d + b;
    };
  },
  quadratic_in: function() {
    return function(t, b, c, d) {
      t /= d;
      return c*t*t + b;
    };
  },
  quadratic_out: function() {
    return function(t, b, c, d) {
      t /= d;
      return -c * t*(t-2) + b;
    };
  },
  quadratic_in_out: function() {
    return function(t, b, c, d) {
      t /= d/2;
      if (t < 1) { return c/2*t*t + b; }
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };
  },
  cubic_in: function() {
    return function(t, b, c, d) {
      t /= d;
      return c*t*t*t + b;
    };
  },
  cubic_out: function() {
    return function(t, b, c, d) {
      t /= d;
      t--;
      return c*(t*t*t + 1) + b;
    };
  },
  cubic_in_out: function() {
    return function(t, b, c, d) {
      t /= d/2;
      if (t < 1) { return c/2*t*t*t + b; }
      t -= 2;
      return c/2*(t*t*t + 2) + b;
    };
  },
  quartic_in: function() {
    return function(t, b, c, d) {
      t /= d;
      return c*t*t*t*t + b;
    };
  },
  quartic_out: function() {
    return function(t, b, c, d) {
      t /= d;
      t--;
      return -c * (t*t*t*t - 1) + b;
    };
  },
  quartic_in_out: function() {
    return function(t, b, c, d) {
      t /= d/2;
      if (t < 1) { return c/2*t*t*t*t + b; }
      t -= 2;
      return -c/2 * (t*t*t*t - 2) + b;
    };
  },
  quintic_in: function() {
    return function(t, b, c, d) {
      t /= d;
      return c*t*t*t*t*t + b;
    };
  },
  quintic_out: function() {
    return function(t, b, c, d) {
      t /= d;
      t--;
      return c*(t*t*t*t*t + 1) + b;
    };
  },
  quintic_in_out: function() {
    return function(t, b, c, d) {
      t /= d/2;
      if (t < 1) { return c/2*t*t*t*t*t + b; }
      t -= 2;
      return c/2*(t*t*t*t*t + 2) + b;
    };
  },
  sinusoidal_in: function()  {
    return function(t, b, c, d) {
      return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    };
  },
  sinusoidal_out: function()  {
    return function(t, b, c, d) {
      return c * Math.sin(t/d * (Math.PI/2)) + b;
    };
  },
  sinusoidal_in_out: function()  {
    return function(t, b, c, d) {
      return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    };
  },
  exponential_in: function()  {
    return function(t, b, c, d) {
      return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
    };
  },
  exponential_out: function()  {
    return function(t, b, c, d) {
      return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
    };
  },
  exponential_in_out: function()  {
    return function(t, b, c, d) {
      t /= d/2;
      if (t < 1) { return c/2 * Math.pow( 2, 10 * (t - 1) ) + b; }
      t--;
      return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
    };
  },
  circular_in: function() {
    return function(t, b, c, d) {
      t /= d;
      return -c * (Math.sqrt(1 - t*t) - 1) + b;
    };
  },
  circular_out: function() {
    return function(t, b, c, d) {
      t /= d;
      t--;
      return c * Math.sqrt(1 - t*t) + b;
    };
  },
  circular_in_out: function() {
    return function(t, b, c, d) {
      t /= d/2;
      if (t < 1) { return -c/2 * (Math.sqrt(1 - t*t) - 1) + b; }
      t -= 2;
      return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
    };
  },
  elastic: function(damping) {
    return function(currentIteration, startValue, changeInValue, totalIterations) {
      if (damping >= 1) {
        damping = 0.99;
      }
      // prepare variables
      var iterationMult = 27.42078669 * Math.pow(damping, -0.8623276489);
      var startVelocity = 0.0,
        spring = 0.7,
        weightedIteration = currentIteration * (iterationMult / totalIterations);

      // Spring simulation
      var wd = spring * Math.sqrt(1.0 - Math.pow(damping, 2.0));
      var theta = damping * spring;

      return Math.exp(-1.0 * theta * weightedIteration) *
        (startValue * Math.cos(wd * weightedIteration) +
          ((theta * startValue + startVelocity) / wd) * Math.sin(wd * weightedIteration));
    };
  }
};

module.exports = EasingFactory;