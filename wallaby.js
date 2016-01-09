var babel = require('babel-core');

process.env.NODE_ENV = 'test';

var babelConfig = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '.babelrc')));
babelConfig.babel = babel;

module.exports = function (wallaby) {
    return {
      files: [
        'src/*.js'
      ],

      tests: [
        'test/*.spec.js'
      ],

      testFramework: 'mocha',

      env: {
        type: 'node',
        runner: 'node'
      },

      compilers: {
        '**/*.js': wallaby.compilers.babel(babelConfig)
      },

      bootstrap: function (w) {
        var mocha = w.testFramework;

        global.BROWSER = false;
        global.__DEV__ = true;
        global.sinon = require('sinon');
        global.assert = require('chai').assert;
        global.jsdom = require('jsdom');

        mocha.suite.beforeEach('sinon before', function() {
          if (null == this.sinon) {
            this.sinon = sinon.sandbox.create();
          }
        });
        mocha.suite.afterEach('sinon after', function() {
          if (this.sinon && 'function' === typeof this.sinon.restore) {
            this.sinon.restore();
          }
        });
      }
    };
  };
