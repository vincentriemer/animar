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
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        hoist_vars: true,
        unsafe: true
      }
    }),
    new CompressionPlugin()
  ]
});