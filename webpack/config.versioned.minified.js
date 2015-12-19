var _ = require('lodash'),
  pjson = require('./../package.json');

module.exports = _.merge(require('./config.minified.js'), {
  output: {
    filename: 'animar-v' + pjson.version + '.min.js'
  }
});
