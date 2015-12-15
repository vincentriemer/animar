/// <reference path="../typings/tsd.d.ts"/>

// Compatibility Polyfills
require('core-js/es6/map');

global.__DEV__ = true;

import Animation from '../src/animation';
import Element from '../src/element';
import Attribute from '../src/attribute';
import * as Helpers from '../src/helpers';

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
      assert.deepEqual(result(), {add: 'addChainFunctionFactory'});
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

  describe('#addChainFunctionFactory', () => {
    let validateStub, _addStub, testElement, attributeOptions, animationOptions, chainOptions, chain;

    beforeEach(() => {
      validateStub = sinon.stub(Helpers, 'validateAddParameters');
      _addStub = sinon.stub(animar, '_add').returns('fullChainObjectFactory');
      testElement = document.getElementById('target1');
      attributeOptions = {
        translateX: [0, 100]
      };
      animationOptions = {
        delay: 0,
        easingFunction: () => {
        },
        duration: 60,
        loop: false
      };
      chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      chain = new Map([['foo', 'bar']]);
    });

    afterEach(() => {
      validateStub.restore();
      _addStub.restore();
    });

    it('should return a function that validates all its provided arguments', () => {
      let result = animar.addChainFunctionFactory(chainOptions, chain);
      result(testElement, attributeOptions, animationOptions);
      sinon.assert.calledWith(validateStub, testElement, attributeOptions, animationOptions);
    });

    it('should return a function that properly initializes the options argument if it is not provided', () => {
      let result = animar.addChainFunctionFactory(chainOptions, chain);
      result(testElement, attributeOptions);
      sinon.assert.calledWith(validateStub, testElement, attributeOptions, EMPTY_ANIMATION_OPTIONS);
    });

    it('should return a function that properly passes its arguments to the _add function', () => {
      let result = animar.addChainFunctionFactory(chainOptions, chain);
      result(testElement, attributeOptions, animationOptions);
      sinon.assert.calledWith(_addStub, testElement, attributeOptions, animationOptions, chainOptions, chain);
    });
  });

  describe('#startChainFunctionFactory', () => {
    let mergeMapStub, requestTickStub, chain;
    beforeEach(() => {
      chain = new Map([['foo', 'bar']]);
      mergeMapStub = sinon.stub(animar, 'mergeElementMaps').returns(chain);
      requestTickStub = sinon.stub(animar, 'requestTick');
    });

    afterEach(() => {
      mergeMapStub.restore();
      requestTickStub.restore();
    });

    it('should return a function that merges the chain\'s map with instance\'s map', () => {
      let result = animar.startChainFunctionFactory(chain);
      result();

      sinon.assert.calledWith(mergeMapStub, new Map(), chain);
      assert.equal(animar.elementMap, chain);
    });

    it('should return a function that requests a requestAnimationFrame tick', () => {
      let result = animar.startChainFunctionFactory(chain);
      result();

      sinon.assert.called(requestTickStub);
    });
  });

  describe('#requestTick', () => {
    let updateStub;

    beforeEach(() => {
      updateStub = sinon.stub(animar, 'update');
      window.requestAnimationFrame = sinon.spy((update) => {
        update();
      });
    });

    afterEach(() => {
      updateStub.restore();
    });

    it('shouldn\'t do anything if the animar instance is already ticking', () => {
      animar.ticking = true;
      animar.requestTick();

      sinon.assert.notCalled(window.requestAnimationFrame);
      assert.isTrue(animar.ticking);
    });

    it('should set the instance\'s ticking to true if it is currently false', () => {
      animar.ticking = false;
      animar.requestTick();

      assert.isTrue(animar.ticking);
    });

    it('should call requestAnimationFrame with the update function', () => {
      animar.ticking = false;
      animar.requestTick();

      sinon.assert.called(window.requestAnimationFrame);
      sinon.assert.called(updateStub);
    });
  });

  describe('#update', () => {
    let stepStub, renderStub, requestTickStub;
    beforeEach(() => {
      stepStub = sinon.stub(animar, 'step').returns(false);
      renderStub = sinon.stub(animar, 'render');
      requestTickStub = sinon.stub(animar, 'requestTick');
    });

    afterEach(() => {
      stepStub.restore();
      renderStub.restore();
      requestTickStub.restore();
    });

    it('should set the instance\'s ticking to false', () => {
      animar.ticking = true;
      animar.update();
      assert.isFalse(animar.ticking);
    });

    it('should always call the step function', () => {
      stepStub.returns(false);
      animar.update();
      stepStub.returns(true);
      animar.update();

      sinon.assert.callCount(stepStub, 2);
    });

    it('should only call the render and requestTick functions if the step function has indicated that' +
      'something has changed', () => {
      stepStub.returns(false);
      animar.update();
      sinon.assert.notCalled(renderStub);
      sinon.assert.notCalled(requestTickStub);

      stepStub.returns(true);
      animar.update();
      sinon.assert.called(renderStub);
      sinon.assert.called(requestTickStub);
    });
  });

  describe('#render', () => {
    it('should call the render function on every element in elementMap', () => {
      let renderSpy1 = sinon.spy();
      let renderSpy2 = sinon.spy();
      let testElement1 = document.getElementById('target1');
      let testElement2 = document.getElementById('target2');
      animar.elementMap.set(testElement1, { render: renderSpy1 });
      animar.elementMap.set(testElement2, { render: renderSpy2 });

      animar.render();

      sinon.assert.calledWith(renderSpy1, testElement1);
      sinon.assert.calledWith(renderSpy2, testElement2);
    });
  });

  describe('#step', () => {
    let testElement1, testElement2, stepStub1, stepStub2;

    beforeEach(() => {
      testElement1 = document.getElementById('target1');
      testElement2 = document.getElementById('target2');
      stepStub1 = sinon.stub();
      stepStub2 = sinon.stub();
    });

    it('should call the step function (with timestamp argument) on every element in elementMap', () => {
      animar.elementMap.set(testElement1, { step: stepStub1 });
      animar.elementMap.set(testElement2, { step: stepStub2 });

      animar.step();

      sinon.assert.calledWith(stepStub1, animar.timescale);
      sinon.assert.calledWith(stepStub2, animar.timescale);
    });

    it('should return false if every step function returns false', () => {
      animar.elementMap.set(testElement1, { step: stepStub1.returns(false) });
      animar.elementMap.set(testElement2, { step: stepStub2.returns(false) });

      let result = animar.step();

      assert.isFalse(result);
    });

    it('should return true if at least one step function returns true', () => {
      animar.elementMap.set(testElement1, { step: stepStub1.returns(true) });
      animar.elementMap.set(testElement2, { step: stepStub2.returns(false) });

      let result = animar.step();

      assert.isTrue(result);
    });
  });
});
