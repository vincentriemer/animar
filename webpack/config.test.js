/// <reference path="typings/node/node.d.ts"/>
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var testDir = './test';
var entrypoints = {};

fs.readdirSync(testDir).filter(function(file) {
  return file.substr(-3) === '.js';
}).forEach(function(file) {
  entrypoints[file.substr(0, file.length - 3)] = './' + path.join(testDir, file);
});

entrypoints['browser-test'] = './test-scripts/browser-test.js';

module.exports = {
  entry: entrypoints,
  output: {
    path: './browser-test',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
      __BROWSER__: true
    })
  ]
};
