import * as es6Map from 'core-js/es6/map';
import * as es6Object from 'core-js/es6/object';

window.__DEV__ = true;
window.BROWSER = true;
window.assert = chai.assert;

mocha.suite.beforeEach(function() {
  let wrapper = document.getElementById('wrapper');

  if (wrapper == null) {
    wrapper = document.createElement('div');
    wrapper.id = 'wrapper';
    document.body.appendChild(wrapper);
  }

  let target1 = document.createElement('div');
  target1.id = 'target';
  wrapper.appendChild(target1);
});

mocha.suite.afterEach(function() {
  let wrapper = document.getElementById('wrapper');
  while (wrapper.hasChildNodes()) {
    wrapper.removeChild(wrapper.lastChild);
  }
});
