var webpack = require('webpack'),
  path = require('path'),
  CompressionPlugin = require('compression-webpack-plugin');

var pjson = require('./package.json');

module.exports = {

  entry: './lib/animar.js',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'animar-v' + pjson.version + '.min.js',
    library: 'Animar',
    libraryTarget: 'umd'
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
};