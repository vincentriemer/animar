/* @flow */

var EasingFactory: {
    linear             : Function; 
    quadratic_in       : Function;
    quadratic_out      : Function;
    quadratic_in_out   : Function;
    cubic_in           : Function;
    cubic_out          : Function;
    cubic_in_out       : Function;
    quartic_in         : Function;
    quartic_out        : Function;
    quartic_in_out     : Function;
    quintic_in         : Function;
    quintic_out        : Function;
    quintic_in_out     : Function;
    sinusoidal_in      : Function;
    sinusoidal_out     : Function;
    sinusoidal_in_out  : Function;
    exponential_in     : Function;
    exponential_out    : Function;
    exponential_in_out : Function;
    circular_in        : Function;
    circular_out       : Function;
    circular_in_out    : Function;
  } = {
  linear: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        return c*t/d + b;
    }
  },
  quadratic_in: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        return c*t*t + b;
    }
  },
  quadratic_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        return -c * t*(t-2) + b;
    }
  },
  quadratic_in_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    }
  },
  cubic_in: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        return c*t*t*t + b;
    }
  },
  cubic_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        t--;
        return c*(t*t*t + 1) + b;
    }
  },
  cubic_in_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d/2;
        if (t < 1) return c/2*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t + 2) + b;
    }
  },
  quartic_in: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        return c*t*t*t*t + b;
    }
  },
  quartic_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        t--;
        return -c * (t*t*t*t - 1) + b;
    }
  },
  quartic_in_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d/2;
        if (t < 1) return c/2*t*t*t*t + b;
        t -= 2;
        return -c/2 * (t*t*t*t - 2) + b;
    }
  },
  quintic_in: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        return c*t*t*t*t*t + b;
    }
  },
  quintic_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        t--;
        return c*(t*t*t*t*t + 1) + b;
    }
  },
  quintic_in_out: function() {
      return function(t : number, b : number, c : number, d : number) : number {
        t /= d/2;
        if (t < 1) return c/2*t*t*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t*t*t + 2) + b;
    }
  },
  sinusoidal_in: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    }
  },
  sinusoidal_out: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    }
  },
  sinusoidal_in_out: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    }
  },
  exponential_in: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
    }
  },
  exponential_out: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
    }
  },
  exponential_in_out: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        t /= d/2;
        if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
        t--;
        return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
    }
  },
  circular_in: function() {
    return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        return -c * (Math.sqrt(1 - t*t) - 1) + b;
    }
  },
  circular_out: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t*t) + b;
    }
  },
  circular_in_out: function()  {
    return function(t : number, b : number, c : number, d : number) : number {
        t /= d/2;
        if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        t -= 2;
        return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
    }
  }
};

module.exports = EasingFactory;