var babel = require('babel');

module.exports = {
  process: function(src) {
    return babel.transform(src).code;
  }
};