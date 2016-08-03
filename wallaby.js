process.env.NODE_ENV = 'test';

module.exports = function (wallaby) {
  return {
    files: [
      'src/*.js'
    ],

    tests: [
      'test/*.spec.js'
    ],

    env: {
      type: 'node',
      runner: 'node',
      params: {
        runner: ''
      }
    },

    testFramework: 'mocha',

    compilers: {
      '**/*.js': wallaby.compilers.babel({ babel: require('babel-core') })
    },

    bootstrap: function (w) {
      var mocha = w.testFramework;

      global.BROWSER = false;
      global.__DEV__ = true;
      global.sinon = require('sinon');
      global.chai = require('chai');

      function propagateToGlobal (window) {
        for (var key in window) {
          if (!window.hasOwnProperty(key)) continue;
          if (key in global) continue;

          global[key] = window[key];
        }
      }
    }
  };
};
