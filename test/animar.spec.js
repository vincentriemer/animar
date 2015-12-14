/// <reference path="../typings/tsd.d.ts"/>

// Compatibility Polyfills
require('core-js/es6/map');

global.__DEV__ = true;

import Animation from '../src/animation';
import Element from '../src/element';
import Attribute from '../src/attribute';

var Animar = require('../src/animar');

var assert = chai.assert;

const EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

function propagateToGlobal(window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;

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
      while (wrapper.hasChildNodes()) {
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
      testAttributes = {test: [0, 100]};
      testOptions = {
        delay: 0, easingFunction: () => {
        }, duration: 60, loop: false
      };
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

    // TODO: move validation tests to validateAddParameters
    it('should throw an error if an element is not provided', () => {
      assert.throw(() => animar.add(null, testAttributes, testOptions));
    });

    it('should throw an error if the element provided is not an instance of HTMLElement', () => {
      assert.throw(() => animar.add({}, testAttributes, testOptions));
    });

    it('should throw an error if the attributes parameter is not provided', () => {
      assert.throw(() => animar.add(testElement, null, testOptions));
    });

    it('should throw an error if the attributes parameter is of the wrong type', () => {
      assert.throw(() => animar.add(testElement, [], testOptions));
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

    it('should call the merge function on elements which exist in both maps and put the output into the result',
      () => {
        let mergeStub = sinon.stub().returns('foo');
        sourceMap.set('test', {merge: mergeStub});
        targetMap.set('test', {foo: 'bar'});

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

  describe('#resolveAnimationOptions', () => {
    it('should return the same object provided to it if all properties are provided', () => {
      let testOptions = {
        delay: 0,
        easingFunction: () => {
        },
        duration: 60,
        loop: false
      };

      let result = animar.resolveAnimationOptions(testOptions);
      assert.deepEqual(result, testOptions);
    });

    it('should return defaults for the properties that are not provided', () => {
      let defaultOptions = {
        delay: animar.defaults.delay,
        easingFunction: animar.defaults.easingFunction,
        duration: animar.defaults.duration,
        loop: animar.defaults.loop
      };

      let result = animar.resolveAnimationOptions({});
      assert.deepEqual(result, defaultOptions);
    });
  });

  describe('#_add', () => {
    let chainOptions, testElement, resolveOptionsStub, resolveStartStub, addAnimationStub, fullChainStub,
      resolvedOptions;

    beforeEach(() => {
      resolvedOptions = {
        delay: 0,
        easingFunction: ()=> {
        },
        duration: 60,
        loop: false
      };
      testElement = document.getElementById('target1');
      resolveOptionsStub = sinon.stub(animar, 'resolveAnimationOptions').returns(resolvedOptions);
      resolveStartStub = sinon.stub(animar, 'resolveStartValue').returns(10);
      addAnimationStub = sinon.stub(animar, 'addAnimationToChain').returns(new Map([['foo', 'bar']]));
      fullChainStub = sinon.stub(animar, 'fullChainObjectFactory');
      chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
    });

    afterEach(() => {
      resolveOptionsStub.restore();
      resolveStartStub.restore();
      addAnimationStub.restore();
      fullChainStub.restore();
    });

    it('should resolve it\'s provided options', () => {
      animar._add(testElement, {}, {foo: 'bar'}, chainOptions, new Map());
      sinon.assert.calledWith(resolveOptionsStub, {foo: 'bar'});
    });

    it('should properly handle only the destination value being provided', () => {
      animar._add(testElement, {translateX: 40}, null, chainOptions, new Map());
      sinon.assert.calledWith(resolveStartStub, undefined, testElement, 'translateX', new Map());
    });

    it('should properly handle the start and destination value being provided', () => {
      animar._add(testElement, {translateX: [0, 40]}, null, chainOptions, new Map());
      sinon.assert.calledWith(resolveStartStub, 0, testElement, 'translateX', new Map());
    });

    it('should throw an error if the start value cannot be resolved', () => {
      resolveStartStub.returns(null);
      assert.throw(() => animar._add(testElement, {translateX: 40}, null, chainOptions, new Map()));
    });

    it('should properly call addAnimationToChain', () => {
      animar._add(testElement, {translateX: 40}, null, chainOptions, new Map());
      sinon.assert.calledWith(addAnimationStub, 10, 40, resolvedOptions, chainOptions, 'translateX',
        testElement, new Map());
    });

    // TODO: write better description
    it('should set the chainOptions currentDuration properly', () => {
      // case: when animation's duration is longer than the chainOptions' duration
      animar._add(testElement, {translateX: 40}, null, chainOptions, new Map());
      sinon.assert.calledWith(fullChainStub, {
        delay: chainOptions.delay,
        currentDuration: 60,
        totalDuration: 0
      }, new Map([['foo', 'bar']]));
      fullChainStub.reset();

      // case: when chainOptions' duration is longer than animation's
      let longerChainOptions = {
        delay: chainOptions.delay,
        currentDuration: 120,
        totalDuration: 0
      };
      animar._add(testElement, {translateX: 40}, null, longerChainOptions, new Map());
      sinon.assert.calledWith(fullChainStub, longerChainOptions, new Map([['foo', 'bar']]));
    });

    it('should handle multiple attributes inside the attributes object', () => {
      animar._add(testElement, {translateX: 40, translateY: 80}, chainOptions, new Map());
      assert.isTrue(resolveStartStub.calledTwice);
      assert.isTrue(addAnimationStub.calledTwice);
    });
  });

  describe('#addAnimationToChain', () => {
    let animationInstanceStub, attributeInstanceStub, elementInstanceStub,
      animationStub, attributeStub, elementStub, resolvedOptions, chainOptions,
      testElement, mergeElementStub;
    beforeEach(() => {
      resolvedOptions = {
        delay: 0,
        easingFunction: ()=> {
        },
        duration: 60,
        loop: false
      };
      chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      testElement = document.getElementById('target1');

      animationInstanceStub = sinon.createStubInstance(Animation);
      attributeInstanceStub = sinon.createStubInstance(Attribute);
      elementInstanceStub = sinon.createStubInstance(Element);

      animationStub = sinon.spy(() => animationInstanceStub);
      attributeStub = sinon.spy(() => attributeInstanceStub);
      elementStub = sinon.spy(() => elementInstanceStub);

      Animar.__Rewire__('Animation', animationStub);
      Animar.__Rewire__('Attribute', attributeStub);
      Animar.__Rewire__('Element', elementStub);

      mergeElementStub = sinon.stub(animar, 'mergeElementMaps').returns(new Map([['foo', 'bar']]));
    });

    afterEach(() => {
      Animar.__ResetDependency__('Animation');
      Animar.__ResetDependency__('Attribute');
      Animar.__ResetDependency__('Element');

      mergeElementStub.restore();
    });

    // TODO: write a better description
    it('should do what it do', () => {
      let result = animar.addAnimationToChain(0, 20, resolvedOptions, chainOptions,
        'translateX', testElement, new Map());

      assert.deepEqual(result, new Map([['foo', 'bar']]));
      sinon.assert.calledWithNew(animationStub);
      sinon.assert.calledWith(animationStub, 0, -20, 20, 60, resolvedOptions.easingFunction, false, 0, 0);

      sinon.assert.calledWithNew(attributeStub);
      sinon.assert.calledWith(attributeStub, 'translateX', 20);
      sinon.assert.calledWith(attributeInstanceStub.addAnimation, animationInstanceStub);

      sinon.assert.calledWithNew(elementStub);
      sinon.assert.calledWith(elementStub, testElement);
      sinon.assert.calledWith(elementInstanceStub.addAttribute, 'translateX', attributeInstanceStub);

      sinon.assert.calledWith(mergeElementStub, new Map(), new Map([[testElement, elementInstanceStub]]));
    });
  });

  describe('#fullChainObjectFactory', () => {
    let startStub, loopStub, addStub, thenStub;

    beforeEach(() => {
      startStub = sinon.stub(animar, 'startChainFunctionFactory').returns(0);
      loopStub = sinon.stub(animar, 'loopChainFunctionFactory').returns(1);
      addStub = sinon.stub(animar, 'addChainFunctionFactory').returns(2);
      thenStub = sinon.stub(animar, 'thenChainFunctionFactory').returns(3);
    });

    afterEach(() => {
      startStub.restore();
      loopStub.restore();
      addStub.restore();
      thenStub.restore();
    });

    it('should return an object with all the chain functions initialized from their factories', () => {
      let chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      let chain = new Map([['foo', 'bar']]);

      let result = animar.fullChainObjectFactory(chainOptions, chain);

      assert.deepEqual(result, {
        start: 0,
        loop: 1,
        add: 2,
        then: 3
      });
      sinon.assert.calledWith(startStub, chain);
      sinon.assert.calledWith(loopStub, chainOptions, chain);
      sinon.assert.calledWith(addStub, chainOptions, chain);
      sinon.assert.calledWith(thenStub, chainOptions, chain);
    });
  });

  describe('#thenChainFunctionFactory', () => {
    let addChainStub, chainOptions, chain;

    beforeEach(() => {
      addChainStub = sinon.stub(animar, 'addChainFunctionFactory').returns('addChainFunctionFactory');
      chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      chain = new Map([['foo', 'bar']]);
    });

    afterEach(() => {
      addChainStub.restore();
    });

    it('should return a function which returns an object with an add chain function', () => {
      let result = animar.thenChainFunctionFactory(chainOptions, chain);
      assert.deepEqual(result(), { add: 'addChainFunctionFactory'});
    });

    it('should increment the chainOptions totalDuration by the currentDuration + provided wait', () => {
      chainOptions.currentDuration = 60;
      let result = animar.thenChainFunctionFactory(chainOptions, chain);
      result(0);

      let noWaitCall = addChainStub.firstCall;
      assert.equal(noWaitCall.args[0].totalDuration, 60);

      addChainStub.reset();

      result(20);
      let waitCall = addChainStub.firstCall;
      assert.equal(waitCall.args[0].totalDuration, 80);
    });

    it('should default the wait parameter to zero if it is not provided', () => {
      chainOptions.currentDuration = 60;
      let result = animar.thenChainFunctionFactory(chainOptions, chain);
      result();

      let noWaitCall = addChainStub.firstCall;
      assert.equal(noWaitCall.args[0].totalDuration, 60);
    });

    it('should set the currentDuration to zero', () => {
      chainOptions.currentDuration = 60;
      let result = animar.thenChainFunctionFactory(chainOptions, chain);
      result(0);

      let curDurCall = addChainStub.firstCall;
      assert.equal(curDurCall.args[0].currentDuration, 0);
    });

    it('should set the delay chainOptions to whatever the new totalDuration is', () => {
      chainOptions.currentDuration = 60;
      let result = animar.thenChainFunctionFactory(chainOptions, chain);
      result(0);

      let noWaitCall = addChainStub.firstCall;
      assert.equal(noWaitCall.args[0].delay, 60);
    });
  });
});
