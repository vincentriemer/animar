[![Build Status](https://img.shields.io/travis/vincentriemer/animar/master.svg?style=flat)](https://travis-ci.org/vincentriemer/animar) [![npm version](https://badge.fury.io/js/animar.svg)](https://badge.fury.io/js/animar)

[![bitHound Dependencies](https://www.bithound.io/github/vincentriemer/animar/badges/dependencies.svg)](https://www.bithound.io/github/vincentriemer/animar/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/vincentriemer/animar/badges/devDependencies.svg)](https://www.bithound.io/github/vincentriemer/animar/master/dependencies/npm)

[![bitHound Overall Score](https://www.bithound.io/github/vincentriemer/animar/badges/score.svg)](https://www.bithound.io/github/vincentriemer/animar) [![codecov.io](https://codecov.io/github/vincentriemer/animar/coverage.svg?branch=master)](https://codecov.io/github/vincentriemer/animar?branch=master)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/vincentriemer.svg)](https://saucelabs.com/u/vincentriemer)

# Animar

**NOTE**: This is still very much a work in progress (espcially in the documentation department). If you attempt to use this in its current state, you are doing so at your own risk.

## Example

```javascript
var Animar = require('animar');

// Custom easing function (Animar only defaults to a linear ease)
function quadInOut(t, b, c, d) {
  t /= d / 2;
  if (t < 1) { return c / 2 * t * t + b; }
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
}

// Initialize the library (set the default easing function to the one created above)
var animar = new Animar({ 
  defaults: { 
    easingFunction: quadInOut 
  } 
});

// Get the target from the DOM
var target = document.getElementById('target');

// Construct an animation chain and start it immediately.
animar.add(target, { translateX: [0, 300], translateY: [0, 300] })
      .then() // Any animation added after this point will start after the previous ones have finished
      .add(target, { translateX: [300, 0], translateY: [300, 0], { delay: -30 }) // set a negative delay to make it begin sooner than the time the previous step ends.
      .start();
```
