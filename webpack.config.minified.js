var webpack = require('webpack'),
  CompressionPlugin = require('compression-webpack-plugin'),
  _ = require('lodash');

module.exports = _.merge(require('./webpack.config.js'), {
  output: {
    filename: 'animar.min.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new CompressionPlugin()
  ]
});