/// <reference path="../typings/tsd.d.ts"/>
global.__DEV__ = true;

var Animar = require('../src/animar');
var assert = require('chai').assert;
var sinon = require('sinon');
var jsdom = require('jsdom');

const EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global[key] = window[key]
  }
}

describe('Animar', () => {
  let animar;

  beforeEach((done) => {
    if (__BROWSER__) {
      // TODO: Add browser environment setup
      done();
    } else {
      jsdom.env(
        '<div id="target1"></div><div id="target2"></div>',
        function (err, window) {
          propagateToGlobal(window);
          animar = new Animar();
          done();
        }
      );
    }
  });

  afterEach(() => {
    if (__BROWSER__) {
      // TODO: Add browser environment cleanup
    }
  });

  describe('#constructor()', () => {
    it('should initialize all of the class variables', () => {
      assert.equal(animar.ticking, false);
      assert.instanceOf(animar.elementMap, Map);
      assert.equal(animar.timescale, 1);

      // check defaults object
      assert.equal(animar.defaults.delay, 0);
      assert.typeOf(animar.defaults.easingFunction, 'function');
      assert.equal(animar.defaults.duration, 60);
      assert.equal(animar.defaults.loop, false);

      // check default easing function
      let result = animar.defaults.easingFunction(0, 0, 10, 60);
      assert.equal(result, 0);
    });
  });

  describe('#add()', () => {
    let testElement, testAttributes, testOptions, expectedResult;
    beforeEach(() => {
      expectedResult = 'chain object';
      animar._add = sinon.stub().returns(expectedResult);
      testElement = window.document.getElementById('target1');
      testAttributes = { test: [0, 100] };
      testOptions = { delay: 0, easingFunction: () => {}, duration: 60, loop: false };
    });

    it('should call the private _add function passing in chain defaults and parameters provided to it', () => {
      let result = animar.add(testElement, testAttributes, testOptions);

      assert.equal(result, expectedResult);
      assert.isTrue(animar._add.calledOnce);
      assert.isTrue(animar._add.calledWith(testElement, testAttributes, testOptions, {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      }, new Map()));
    });

    it('should use an empty options object if it is not provided', () => {
      animar._add = sinon.stub();

      animar.add(testElement, testAttributes);

      assert.isTrue(animar._add.calledWith(testElement, testAttributes, EMPTY_ANIMATION_OPTIONS, {
          delay: 0,
          currentDuration: 0,
          totalDuration: 0
        },
        new Map())
      );
    });

    it('should throw an error if an element is not provided', () => {
      let spy = sinon.spy(animar, 'add');
      try {
        animar.add(null, testAttributes, testOptions);
      } catch(e) {};
      assert.isTrue(spy.threw());
    });

    it('should throw an error if the element provided is not an instance of HTMLElement', () => {
      let spy = sinon.spy(animar, 'add');
      try {
        animar.add({}, testAttributes, testOptions);
      } catch(e) {};
      assert.isTrue(spy.threw());
    });

    it('should throw an error if the attributes parameter is not provided', () => {
      let spy = sinon.spy(animar, 'add');
      try {
        animar.add(testElement, null, testOptions);
      } catch(e) {};
      assert.isTrue(spy.threw());
    });

    it('should throw an error if the attributes parameter is of the wrong type', () => {
      let spy = sinon.spy(animar, 'add');
      try {
        animar.add(testElement, [], testOptions);
      } catch(e) {};
      assert.isTrue(spy.threw());
    });
  });

  describe('#mergeElementMaps()', () => {
    let sourceMap, targetMap;
    beforeEach(() => {
      sourceMap = new Map();
      targetMap = new Map();
    });

    it('should add target elements to the source if they don\'t exist in the source', () => {
      let expected = 'bar';
      targetMap.set('foo', expected);

      let result = animar.mergeElementMaps(sourceMap, targetMap);

      assert.equal(result.get('foo'), expected);
    });

    it('should call the merge function on elements which exist in both maps and put the output into the result', () => {
      let mergeStub = sinon.stub().returns('foo');
      sourceMap.set('test', { merge: mergeStub });
      targetMap.set('test', { foo: 'bar' });

      let result = animar.mergeElementMaps(sourceMap, targetMap);

      assert.isTrue(mergeStub.called);
      assert.isTrue(mergeStub.calledWith(targetMap.get('test')));
      assert.equal(result.get('test'), 'foo');
    });
  });
});
