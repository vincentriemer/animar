import Mocha from 'mocha';
import fs from 'fs';
import path from 'path';

global.__BROWSER__ = false;

const testDir = 'test';

let mocha = new Mocha();
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