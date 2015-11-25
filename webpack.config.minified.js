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
        warnings: false,
      },
      sourceMap: false,
      mangle: {
        except: ['$super', '$', 'exports', 'require', 'Animar', 'add']
      }
    }),
    new CompressionPlugin()
  ]
});