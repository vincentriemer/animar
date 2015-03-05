var path = require('path');

module.exports = {
  entry: './lib/animar.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'animar.js',
    library: 'Animar',
    libraryTarget: 'umd'
  }
};