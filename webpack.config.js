var path = require('path');

var pjson = require('./package.json');

module.exports = {

  entry: './lib/animar.js',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'animar-v' + pjson.version + '.js',
    library: 'Animar',
    libraryTarget: 'umd'
  }

};