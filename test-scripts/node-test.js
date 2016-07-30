import Mocha from 'mocha';
import fs from 'fs';
import path from 'path';

global.BROWSER = false;
global.__DEV__ = true;
global.sinon = require('sinon');
global.assert = require('chai').assert;

const testDir = 'test';

function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;

    global[key] = window[key];
  }
}

let mocha = new Mocha({ reporter: 'spec' });

fs.readdirSync(testDir).filter(file => {
  return file.substr(-3) === '.js';
}).forEach(file => {
  mocha.addFile(
    path.join(testDir, file)
  );
});

// Run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
