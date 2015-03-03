var webpack = require('webpack'),
  path = require('path'),
  CompressionPlugin = require('compression-webpack-plugin');

module.exports = {

  entry: './lib/animar.js',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'animar.min.js'
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        hoist_vars: true,
        unsafe: true
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new CompressionPlugin()
  ]
};