/// <reference path="typings/node/node.d.ts"/>
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: './dist',
    filename: 'animar.js',
    library: 'Animar',
    libraryTarget: 'umd'
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
      __DEV__: true && process.env.NODE_ENV !== 'production'
    })
  ]
};
