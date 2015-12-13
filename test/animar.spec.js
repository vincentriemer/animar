/// <reference path="../typings/tsd.d.ts"/>

// Compatibility Polyfills
require('core-js/es6/map');

global.__DEV__ = true;

var Animar = require('../src/animar');
var Element = require('../src/element');
var Attribute = require('../src/attribute');
var assert = chai.assert;

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
    if (BROWSER) {
      if (document.getElementById('wrapper') == null) {
        let wrapper = document.createElement('div');
        wrapper.id = 'wrapper';
        document.body.appendChild(wrapper);
      }
      let wrapper = document.getElementById('wrapper');

      let target1 = document.createElement('div');
      target1.id = 'target1';
      let target2 = document.createElement('div');
      target2.id = 'target2';

      wrapper.appendChild(target1);
      wrapper.appendChild(target2);

      animar = new Animar();
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
    if (BROWSER) {
      let wrapper = document.getElementById('wrapper');
      while(wrapper.hasChildNodes()) {
        wrapper.removeChild(wrapper.lastChild);
      }
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

  describe('#resolveStartValue', () => {
    let testElement;
    beforeEach(() => {
      testElement = document.getElementById('target1');
    });

    it('should return the provided start value if it is provided', () => {
      let result = animar.resolveStartValue(13, testElement, 'translateX', new Map());
      assert.equal(result, 13);
    });

    it('should return an inferred start value from the current chain', () => {
      let exampleElement = new Element(testElement);
      let exampleAttribute = new Attribute('translateX', 13);
      exampleElement.addAttribute('translateX', exampleAttribute);
      let testChain = new Map().set(testElement, exampleElement);

      let result = animar.resolveStartValue(null, testElement, 'translateX', testChain);
      assert.equal(result, 13);
    });

    it('should return an inferred start value from animar\'s element map', () => {
      let exampleElement = new Element(testElement);
      let exampleAttribute = new Attribute('translateX', 13);
      exampleElement.addAttribute('translateX', exampleAttribute);
      animar.elementMap = new Map().set(testElement, exampleElement);

      let result = animar.resolveStartValue(null, testElement, 'translateX', new Map());
      assert.equal(result, 13);
    });

    it('should call the helper getStartValue if the start value cannot be inferred', () => {
      let Helpers = require('../src/helpers');
      let getStartValueStub = sinon.stub(Helpers, 'getStartValue').returns(13);
      let attributeString = 'translateX';
      let result = animar.resolveStartValue(null, testElement, attributeString, new Map());

      assert.equal(result, 13);
      assert.isTrue(getStartValueStub.called);
      assert.isTrue(getStartValueStub.calledWith(testElement, attributeString));

      getStartValueStub.restore();
    });
  });
});
