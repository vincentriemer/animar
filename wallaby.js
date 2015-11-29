var babel = require('babel-core');

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

      bootstrap: function (wallaby) {
        global.__BROWSER__ = false;
      }
    };
  };