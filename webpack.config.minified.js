var webpack = require('webpack'),
  path = require('path');

module.exports = {

  entry: './lib/animar.js',

  devtool: 'source-map',

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
    })
  ]
};