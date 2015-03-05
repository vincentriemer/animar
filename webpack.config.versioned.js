var _ = require('lodash');
var pjson = require('./package.json');

module.exports = _.merge(require('./webpack.config.js'), {
  output: {
    filename: 'animar-v' + pjson.version + '.js'
  }
});