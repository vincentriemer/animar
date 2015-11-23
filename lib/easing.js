export function linear() {
  return (t, b, c, d) => {
    return c * t / d + b;
  };
}

export function quadraticIn() {
  return (t, b, c, d) => {
    t /= d;
    return c * t * t + b;
  };
}

export function quadraticOut() {
  return (t, b, c, d) => {
    t /= d;
    return -c * t * (t - 2) + b;
  };
}

export function quadraticInOut() {
  return (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) { return c / 2 * t * t + b; }
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };
}

export function cubicIn() {
  return (t, b, c, d) => {
    t /= d;
    return c * t * t * t + b;
  };
}

export function cubicOut() {
  return (t, b, c, d) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  };
}

export function cubicInOut() {
  return (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) { return c / 2 * t * t * t + b; }
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  };
}

export function quarticIn() {
  return (t, b, c, d) => {
    t /= d;
    return c * t * t * t * t + b;
  };
}

export function quarticOut() {
  return (t, b, c, d) => {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
  };
}

export function quarticInOut() {
  return (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) { return c / 2 * t * t * t * t + b; }
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
  };
}

export function quinticIn() {
  return (t, b, c, d) => {
    t /= d;
    return c * t * t * t * t * t + b;
  };
}

export function quinticOut() {
  return (t, b, c, d) => {
    t /= d;
    t--;
    return c * (t * t * t * t * t + 1) + b;
  };
}

export function quinticInOut() {
  return (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) { return c / 2 * t * t * t * t * t + b; }
    t -= 2;
    return c / 2 * (t * t * t * t * t + 2) + b;
  };
}

export function sinusoidalIn() {
  return (t, b, c, d) => {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  };
}

export function sinusoidalOut() {
  return (t, b, c, d) => {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  };
}

export function sinusoidalInOut() {
  return (t, b, c, d) => {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  };
}

export function exponentialIn() {
  return (t, b, c, d) => {
    return c * Math.pow( 2, 10 * (t / d - 1) ) + b;
  };
}

export function exponentialOut() {
  return (t, b, c, d) => {
    return c * ( -Math.pow( 2, -10 * t / d ) + 1 ) + b;
  };
}

export function exponentialInOut() {
  return (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) { return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b; }
    t--;
    return c / 2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
  };
}

export function circularIn() {
  return (t, b, c, d) => {
    t /= d;
    return -c * (Math.sqrt(1 - t * t) - 1) + b;
  };
}

export function circularOut() {
  return (t, b, c, d) => {
    t /= d;
    t--;
    return c * Math.sqrt(1 - t * t) + b;
  };
}

export function circularInOut() {
  return (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) { return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b; }
    t -= 2;
    return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
  };
}
