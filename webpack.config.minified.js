var webpack = require('webpack'),
  CompressionPlugin = require('compression-webpack-plugin'),
  _ = require('lodash');

module.exports = _.merge(require('./webpack.config.js'), {
  output: {
    filename: 'animar.min.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true,
        sequences: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true,
        evaluate: true,
        pure_getters: true,
        screw_ie8: true
      },
      sourceMap: false
    }),
    new CompressionPlugin()
  ]
});