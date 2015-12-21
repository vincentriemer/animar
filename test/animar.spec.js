/// <reference path="../typings/tsd.d.ts"/>

import Animation from '../src/animation';
import Element from '../src/element';
import Attribute from '../src/attribute';

var Animar = require('../src/animar').default;

var assert = chai.assert;

const EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

/* istanbul ignore next */
function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;

    global[key] = window[key];
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
    it('should initialize all of the class variables to expected defaults', () => {
      assert.equal(animar.ticking, false);
      assert.instanceOf(animar.elementMap, Map);
      assert.equal(animar.hardwareAcceleration, true);
      assert.deepEqual(animar.hooks, []);
      assert.equal(animar.firstFrame, true);
      assert.equal(animar.previousTime, 0);

      // check defaults object
      assert.equal(animar.defaults.delay, 0);
      assert.typeOf(animar.defaults.easingFunction, 'function');
      assert.equal(animar.defaults.duration, 60);

      // check default easing function
      let result = animar.defaults.easingFunction(0, 0, 10, 60);
      assert.equal(result, 0);
    });

    it('should partially set default parameters if specified in argument', () => {
      animar = new Animar({
        defaults: {
          duration: 120
        }
      });
      assert.equal(animar.defaults.duration, 120);
    });

    it('should set the hardwareAcceleration option if provided in options argument', () => {
      animar = new Animar({
        hardwareAcceleration: false
      });
      assert.equal(animar.hardwareAcceleration, false);
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
        }, duration: 60
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
      }, new Map(), []));
    });

    it('should use an empty options object if it is not provided', () => {
      animar._add = sinon.stub();

      animar.add(testElement, testAttributes);

      assert.isTrue(animar._add.calledWith(testElement, testAttributes, EMPTY_ANIMATION_OPTIONS, {
          delay: 0,
          currentDuration: 0,
          totalDuration: 0
        },
        new Map(), [])
      );
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

  describe('#resolveAnimationOptions', () => {
    it('should return the same object provided to it if all properties are provided', () => {
      let testOptions = {
        delay: 0,
        easingFunction: () => {
        },
        duration: 60
      };

      let result = animar.resolveAnimationOptions(testOptions);
      assert.deepEqual(result, testOptions);
    });

    it('should return defaults for the properties that are not provided', () => {
      let defaultOptions = {
        delay: animar.defaults.delay,
        easingFunction: animar.defaults.easingFunction,
        duration: animar.defaults.duration
      };

      let result = animar.resolveAnimationOptions({});
      assert.deepEqual(result, defaultOptions);
    });
  });

  describe('#_add', () => {
    let chainOptions, testElement, resolveOptionsStub, addAnimationStub, fullChainStub,
      resolvedOptions;

    beforeEach(() => {
      resolvedOptions = {
        delay: 0,
        easingFunction: ()=> {
        },
        duration: 60
      };
      testElement = document.getElementById('target1');
      resolveOptionsStub = sinon.stub(animar, 'resolveAnimationOptions').returns(resolvedOptions);
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
      addAnimationStub.restore();
      fullChainStub.restore();
    });

    it('should resolve it\'s provided options', () => {
      animar._add(testElement, {}, {foo: 'bar'}, chainOptions, new Map(), []);
      sinon.assert.calledWith(resolveOptionsStub, {foo: 'bar'});
    });

    it('should properly call addAnimationToChain', () => {
      animar._add(testElement, {translateX: [0, 40]}, null, chainOptions, new Map(), []);
      sinon.assert.calledWith(addAnimationStub, 0, 40, resolvedOptions, chainOptions, 'translateX',
        testElement, new Map());
    });

    // TODO: write better description
    it('should set the chainOptions currentDuration properly', () => {
      // case: when animation's duration is longer than the chainOptions' duration
      animar._add(testElement, {translateX: [0, 40]}, null, chainOptions, new Map(), []);
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
      animar._add(testElement, {translateX: [0, 40]}, null, longerChainOptions, new Map(), []);
      sinon.assert.calledWith(fullChainStub, longerChainOptions, new Map([['foo', 'bar']]));
    });

    it('should handle multiple attributes inside the attributes object', () => {
      animar._add(testElement, {translateX: 40, translateY: 80}, null, chainOptions, new Map(), []);
      assert.isTrue(addAnimationStub.calledTwice);
    });

    it('should pass through the hooks argument', () => {
      let testHooks = 'this is an arbitrary string to show that the hooks object should not be touched';
      animar._add(testElement, {translateX: 40}, null, chainOptions, new Map(), testHooks);
      let callArgs = fullChainStub.firstCall.args;
      assert.deepEqual(callArgs[0], chainOptions);
      assert.instanceOf(callArgs[1], Map);
      assert.equal(callArgs[2], testHooks);
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
        duration: 60
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
    let startStub, loopStub, addStub, thenStub, hookStub;

    beforeEach(() => {
      startStub = sinon.stub(animar, 'startChainFunctionFactory').returns(0);
      loopStub = sinon.stub(animar, 'loopChainFunctionFactory').returns(1);
      addStub = sinon.stub(animar, 'addChainFunctionFactory').returns(2);
      thenStub = sinon.stub(animar, 'thenChainFunctionFactory').returns(3);
      hookStub = sinon.stub(animar, 'hookChainFunctionFactory').returns(4);
    });

    afterEach(() => {
      startStub.restore();
      loopStub.restore();
      addStub.restore();
      thenStub.restore();
      hookStub.restore();
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
        then: 3,
        hook: 4
      });
      sinon.assert.calledWith(startStub, chain);
      sinon.assert.calledWith(loopStub, chainOptions, chain);
      sinon.assert.calledWith(addStub, chainOptions, chain);
      sinon.assert.calledWith(thenStub, chainOptions, chain);
    });
  });

  describe('#thenChainFunctionFactory', () => {
    let addChainStub, hookChainStub, chainOptions, chain;

    beforeEach(() => {
      addChainStub = sinon.stub(animar, 'addChainFunctionFactory').returns('addChainFunctionFactory');
      hookChainStub = sinon.stub(animar, 'hookChainFunctionFactory').returns('hookChainFunctionFactory');
      chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      chain = new Map([['foo', 'bar']]);
    });

    afterEach(() => {
      addChainStub.restore();
      hookChainStub.restore();
    });

    it('should return a function which returns an object with an add chain function', () => {
      let result = animar.thenChainFunctionFactory(chainOptions, chain);
      assert.deepEqual(result(), {add: 'addChainFunctionFactory', hook: 'hookChainFunctionFactory'});
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
    let _addStub, testElement, attributeOptions, animationOptions, chainOptions, chain;

    beforeEach(() => {
      _addStub = sinon.stub(animar, '_add').returns('fullChainObjectFactory');
      testElement = document.getElementById('target1');
      attributeOptions = {
        translateX: [0, 100]
      };
      animationOptions = {
        delay: 0,
        easingFunction: () => {
        },
        duration: 60
      };
      chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      chain = new Map([['foo', 'bar']]);
    });

    afterEach(() => {
      _addStub.restore();
    });

    it('should return a function that properly passes its arguments to the _add function', () => {
      let result = animar.addChainFunctionFactory(chainOptions, chain);
      result(testElement, attributeOptions, animationOptions);
      sinon.assert.calledWith(_addStub, testElement, attributeOptions, animationOptions, chainOptions, chain);
    });

    it('should use EMPTY_ANIMATION_OPTIONS if the animationOptions argument is not provided', () => {
      let result = animar.addChainFunctionFactory(chainOptions, chain);
      result(testElement, attributeOptions);
      sinon.assert.calledWith(_addStub, testElement, attributeOptions, EMPTY_ANIMATION_OPTIONS, chainOptions, chain);
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

    it('should calculate the timescale based off of the previous frame\'s timestamp and the current timestamp', () => {
      // test 60Hz
      animar.firstFrame = false;
      let sixtyFPS = 16.67;
      let currentTime = 3000;
      animar.previousTime = currentTime - sixtyFPS;
      animar.update(currentTime);

      let resultingTimescale = stepStub.firstCall.args[0];
      assert.closeTo(resultingTimescale, 1, 0.01);
    });

    it('should override the changeInTime value if it\'s the first frame after pausing', () => {
      animar.firstFrame = true;
      let currentTime = 3000;
      animar.previousTime = currentTime - 500;
      animar.update(currentTime);

      let resultingTimescale = stepStub.firstCall.args[0];
      assert.closeTo(resultingTimescale, 1, 0.01);
    });
  });

  describe('#render', () => {
    it('should call the render function on every element in elementMap with the hardware acceleration flag', () => {
      animar.hardwareAcceleration = false;
      let renderSpy1 = sinon.spy();
      let renderSpy2 = sinon.spy();
      let testElement1 = document.getElementById('target1');
      let testElement2 = document.getElementById('target2');
      animar.elementMap.set(testElement1, { render: renderSpy1 });
      animar.elementMap.set(testElement2, { render: renderSpy2 });

      animar.render();

      sinon.assert.calledWith(renderSpy1, false);
      sinon.assert.calledWith(renderSpy2, false);
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

    it('should call the step function (with given timescale argument) on every element in elementMap', () => {
      let timescale = 0.9;

      animar.elementMap.set(testElement1, { step: stepStub1 });
      animar.elementMap.set(testElement2, { step: stepStub2 });

      animar.step(timescale);

      sinon.assert.calledWith(stepStub1, timescale);
      sinon.assert.calledWith(stepStub2, timescale);
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

    it('should call the step function on every hook', () => {
      let hookStub1 = sinon.stub().returns(true);
      let hookStub2 = sinon.stub().returns(true);
      let testHooks = [{step: hookStub1}, {step: hookStub2}];

      animar.hooks = testHooks;
      animar.step();

      sinon.assert.called(hookStub1);
      sinon.assert.called(hookStub2);

      assert.deepEqual(animar.hooks, testHooks);
    });

    it('should remove any hooks that return false', () => {
      let hookStub1 = sinon.stub().returns(true);
      let hookStub2 = sinon.stub().returns(false);

      animar.hooks = [{step: hookStub1}, {step: hookStub2}];
      animar.step();

      assert.deepEqual(animar.hooks, [{step: hookStub1}]);
    });
  });

  describe('#loopChainFunctionFactory', () => {
    let chainOptions, chain, startChainStub;

    beforeEach(() => {
      chainOptions = {
        delay: 0,
        currentDuration: 30,
        totalDuration: 40
      };
      chain = new Map();
      startChainStub = sinon.stub(animar, 'startChainFunctionFactory').returns('startFunction');
    });

    afterEach(() => {
      startChainStub.restore();
    });

    it('should return a function which increments the totalDuration by the currentDuration of the chainOptions', () => {
      let loopFunction = animar.loopChainFunctionFactory(chainOptions, chain, []);
      loopFunction();
      assert.equal(chainOptions.totalDuration, 70);
    });

    it('should return a function which calls the loop function on every element in the passed in chain', () => {
      let loopSpy = sinon.spy();
      chain.set('test', { loop: loopSpy });
      let loopFunction = animar.loopChainFunctionFactory(chainOptions, chain, []);
      loopFunction();

      sinon.assert.calledWith(loopSpy, { delay: 0, currentDuration: 30, totalDuration: 70});
    });

    it('should return a function which returns an object that contains the start function', () => {
      let loopFunction = animar.loopChainFunctionFactory(chainOptions, chain, []);
      let result = loopFunction();

      assert.deepEqual(result, { start: 'startFunction' });
      sinon.assert.calledWith(startChainStub, chain);
    });

    it('should return a function that calls the loop function on every hook', () => {
      let hookSpy1 = sinon.spy();
      let hookSpy2 = sinon.spy();
      let loopFunction = animar.loopChainFunctionFactory(chainOptions, chain, [{loop: hookSpy1}, {loop: hookSpy2}]);
      loopFunction();

      sinon.assert.called(hookSpy1);
      sinon.assert.called(hookSpy2);
    });
  });

  describe('#addHook', () => {
    it('should add a hook to the current element chain with a current iteration value that is 0 - the chainOptions ' +
      'delay value', () => {
      let expectedResult = 'test';
      let hookFunction = () => 1;
      let fullChainStub = sinon.stub(animar, 'fullChainObjectFactory').returns(expectedResult);
      let chain = new Map();
      let chainOptions = {
        delay: 30,
        currentDuration: 0,
        totalDuration: 50
      };
      let result = animar.addHook(hookFunction, chainOptions, chain, []);

      assert.equal(result, expectedResult);
      let resultingHook = fullChainStub.firstCall.args[2][0];
      assert.equal(resultingHook.hook, hookFunction);
      assert.equal(resultingHook.currentIteration, 0 - chainOptions.delay);
      assert.isFalse(resultingHook.looping);
      assert.equal(resultingHook.delay, chainOptions.delay);
      assert.equal(resultingHook.wait, 0);
    });
  });

  describe('#hookChainFunctionFactory', () => {
    it('should return a function which calls the addHook function with a given hook function', () => {
      let expectedResult = 'result';
      let addHookStub = sinon.stub(animar, 'addHook').returns(expectedResult);
      let chainOptions = {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      };
      let chain = new Map();
      let hooks = [];
      let addHookFunction = animar.hookChainFunctionFactory(chainOptions, chain, hooks);
      let hookFunction = () => 1;
      let result = addHookFunction(hookFunction);

      sinon.assert.calledWith(addHookStub, hookFunction, chainOptions, chain, hooks);
      assert.equal(result, expectedResult);
    });
  });
});
