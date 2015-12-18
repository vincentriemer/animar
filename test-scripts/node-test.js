import Mocha from 'mocha';
import fs from 'fs';
import path from 'path';

global.BROWSER = false;
global.__DEV__ = true;
global.sinon = require('sinon');
global.chai = require('chai');
global.jsdom = require('jsdom');

const testDir = 'test';

let mocha = new Mocha({ reporter: 'spec' });

fs.readdirSync(testDir).filter(file => {
  return file.substr(-3) === '.js';
}).forEach(file => {
  mocha.addFile(
    path.join(testDir, file)
  );
});

mocha.suite.beforeEach('sinon before', function() {
  if (null == this.sinon) {
    this.sinon = sinon.sandbox.create();
  }
});
mocha.suite.afterEach('sinon after', function() {
  if (this.sinon && 'function' === typeof this.sinon.restore) {
    this.sinon.restore();
  }
});

// Run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
