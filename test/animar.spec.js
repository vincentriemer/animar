import Animar,
  { DEFAULT_EASING_FUNCTION, DEFAULT_DELAY, DEFAULT_DURATION, EMPTY_ANIMATION_OPTIONS, initialChainOptions }
from '../src/animar';

const assert = chai.assert;

describe('new Animar', () => {
  describe('#new Animar', () => {
    it('should properly initialize an Animar object when given no arguments', () => {
      const actual = new Animar();
      assert.equal(actual.ticking, false);
      assert.deepEqual(actual.elementMap, new Map());
      assert.deepEqual(actual.defaults, {
        delay: DEFAULT_DELAY,
        easingFunction: DEFAULT_EASING_FUNCTION,
        duration: DEFAULT_DURATION
      });
      assert.deepEqual(actual.hooks, []);
      assert.equal(actual.firstFrame, true);
      assert.equal(actual.previousTime, 0);
    });

    it('should set the default delay value if provided as an argument', () => {
      const expected = 10;
      const { defaults: { delay: actual } } = new Animar({ defaults: { delay: expected }});
      assert.equal(actual, expected);
    });

    it('should set the default easing function if provided as an argument', () => {
      const expected = () => {};
      const { defaults: { easingFunction: actual } } = new Animar({ defaults: { easingFunction: expected } });
      assert.equal(actual, expected);
    });

    it('should set the default duration value if provided as an argument', () => {
      const expected = 69;
      const { defaults: { duration: actual } } = new Animar({ defaults: { duration: expected } });
      assert.equal(actual, expected);
    });
  });

  describe('#resolveConstructorOptions', () => {
    it('should use the instance\'s default values when not provided', () => {
      const animar = new Animar();
      const expected = {
        delay: DEFAULT_DELAY,
        easingFunction: DEFAULT_EASING_FUNCTION,
        duration: DEFAULT_DURATION
      };
      const actual = animar.resolveAnimationOptions({});
      assert.deepEqual(actual, expected);
    });

    it('should use the values in the options object if they are provided', () => {
      const animar = new Animar();
      const expected = {
        delay: 13,
        easingFunction: ()=>{},
        duration: 69
      };
      const actual = new animar.resolveAnimationOptions(expected);
      assert.deepEqual(actual, expected);
    });
  });

  describe('#add', () => {
    it('should correctly call the private _add function', () => {
      const animar = new Animar();
      const stub = sinon.stub(animar, '_add');
      const args = [{}, { translateX: [0, 10] }, { delay: 4, easingFunction: ()=>{}, duration: 60}];
      animar.add(...args);

      const calledArgs = stub.firstCall.args;

      assert.equal(calledArgs[0], args[0]);
      assert.equal(calledArgs[1], args[1]);
      assert.equal(calledArgs[2], args[2]);
      assert.deepEqual(calledArgs[3], initialChainOptions());
      assert.instanceOf(calledArgs[4], Map);
      assert.deepEqual(calledArgs[5], []);
    });

    it('should use EMPTY_ANIMATION_OPTIONS if the animation options argument is not provided', () => {
      const animar = new Animar();
      const stub = sinon.stub(animar, '_add');
      const args = [{}, { translateX: [0, 10] }];
      animar.add(...args);

      const calledArgs = stub.firstCall.args;

      assert.equal(calledArgs[2], EMPTY_ANIMATION_OPTIONS);
    });
  });

  describe('#_add', () => {
    it('should add the new animation to the current chain and update the chainOptions', () => {
      const animar = new Animar();
      const stub = sinon.stub(animar, 'fullChainObjectFactory').returns('boosh');
      const element = { foo: 'bar' };
      const easingFunction = () => {};
      const args = [element,
        { // attributes
          translateX: [0, 60],
          translateY: [0, 30]
        },
        { // animation options
          delay: 15,
          duration: 69,
          easingFunction
        },
        initialChainOptions(),
        new Map(),
        []
      ];

      const result = animar._add(...args);

      const [actualChainOptions, actualCurrentChain] = stub.firstCall.args;
      assert.equal(result, 'boosh');
      assert.deepEqual(actualChainOptions, { delay: 0, currentDuration: 84, totalDuration: 0 });
      assert.deepEqual(actualCurrentChain.get(element), {
        attributes: {
          translateX: {
            model: 60,
            animations: [
              {
                currentIteration: -15,
                startValue: -60,
                changeInValue: 60,
                totalIterations: 69,
                easingFunction: easingFunction,
                delay: 0,
                looping: false,
                wait: 0
              }
            ]
          },
          translateY: {
            model: 30,
            animations: [
              {
                currentIteration: -15,
                startValue: -30,
                changeInValue: 30,
                totalIterations: 69,
                easingFunction: easingFunction,
                delay: 0,
                looping: false,
                wait: 0
              }
            ]
          }
        }
      });
    });
  });

  describe('#addHook', () => {
    it('should return the full chain object with the new hook added', () => {
      const animar = new Animar();
      const stub = sinon.stub(animar, 'fullChainObjectFactory').returns('boosh');
      const testHook = () => {};

      const result = animar.addHook(testHook,
        Object.assign(initialChainOptions(), {delay: 20}),
        new Map(),
        []
      );

      const [, , actual] = stub.firstCall.args;
      assert.equal(result, 'boosh');
      assert.equal(actual.length, 1);
      assert.deepEqual(actual[0], {
        hook: testHook,
        currentIteration: -20,
        delay: 20,
        looping: false,
        wait: 0,
        called: false
      });
    });
  });

  describe('#fullChainObjectFactory', () => {
    it('should return an object with all the possible chain functions', () => {
      const animar = new Animar();

      // stub out all function factories
      const startStub = sinon.stub(animar, 'startChainFunctionFactory').returns('start');
      const loopStub = sinon.stub(animar, 'loopChainFunctionFactory').returns('loop');
      const addStub = sinon.stub(animar, 'addChainFunctionFactory').returns('add');
      const thenStub = sinon.stub(animar, 'thenChainFunctionFactory').returns('then');
      const hookStub = sinon.stub(animar, 'hookChainFunctionFactory').returns('hook');

      // initialize expected argument lists
      const args = [{foo: 'bar'}, new Map(), []];
      const startArgs = [args[1], args[2]];

      const actual = animar.fullChainObjectFactory.apply(animar, args);

      assert.deepEqual(actual, {
        start: 'start',
        loop: 'loop',
        add: 'add',
        then: 'then',
        hook: 'hook'
      });

      assert.deepEqual(startStub.firstCall.args, startArgs);
      assert.deepEqual(loopStub.firstCall.args, args);
      assert.deepEqual(addStub.firstCall.args, args);
      assert.deepEqual(thenStub.firstCall.args, args);
      assert.deepEqual(hookStub.firstCall.args, args);
    });
  });

  describe('#thenChainFunctionFactory', () => {
    it('should return a function', () => {
      const animar = new Animar();
      const actual = animar.thenChainFunctionFactory();
      assert.typeOf(actual, 'function');
    });

    describe('returned function', () => {
      function thenTestSetup(chainOptions) {
        const animar = new Animar();
        const addStub = sinon.stub(animar, 'addChainFunctionFactory').returns('add');
        const hookStub = sinon.stub(animar, 'hookChainFunctionFactory').returns('hook');
        const returnedFunction = animar.thenChainFunctionFactory(chainOptions, new Map(), []);

        return [returnedFunction, addStub, hookStub];
      }

      it('should update the chain options to add a new rung of the animation chain', () => {
        const [returnedFunction, addStub, hookStub] = thenTestSetup({
          totalDuration: 10,
          currentDuration: 20,
          delay: 0
        });

        const result = returnedFunction(35);
        assert.deepEqual(result, { add: 'add', hook: 'hook'});

        assert.deepEqual(addStub.firstCall.args[0], {
          totalDuration: 65,
          currentDuration: 0,
          delay: 65
        });

        assert.deepEqual(hookStub.firstCall.args[0], {
          totalDuration: 65,
          currentDuration: 0,
          delay: 65
        });
      });

      it('should consider the wait argument to be 0 if not provided', () => {
        const [returnedFunction, addStub, hookStub] = thenTestSetup({
          totalDuration: 10,
          currentDuration: 20,
          delay: 0
        });

        const result = returnedFunction();
        assert.deepEqual(result, { add: 'add', hook: 'hook'});

        assert.deepEqual(addStub.firstCall.args[0], {
          totalDuration: 30,
          currentDuration: 0,
          delay: 30
        });

        assert.deepEqual(hookStub.firstCall.args[0], {
          totalDuration: 30,
          currentDuration: 0,
          delay: 30
        });
      });
    });
  });

  describe('#addChainFunctionFactory', () => {
    it('should return a function', () => {
      const animar = new Animar();
      const result = animar.addChainFunctionFactory();
      assert.typeOf(result, 'function');
    });

    describe('returned function', () => {
      function addChainTestSetup(chainOptions, chain, hooks) {
        const animar = new Animar();
        const addStub = sinon.stub(animar, '_add').returns('add');
        const returnedFunction = animar.addChainFunctionFactory(chainOptions, chain, hooks);

        return [addStub, returnedFunction];
      }

      it('should behave the same way the public `add` function works and pass its parameters through to _add', () => {
        const chainOptions = { 'my': 'chainOptions' };
        const chain = new Map();
        const hooks = [];

        const [addStub, returnedFunction] = addChainTestSetup(chainOptions, chain, hooks);

        const element = { foo: 'bar' };
        const attributes = { translateX: [0, 100] };
        const options = { duration: 120 };

        const result = returnedFunction(element, attributes, options);

        assert.equal(result, 'add');
        assert.deepEqual(addStub.firstCall.args, [element, attributes, options, chainOptions, chain, hooks]);
      });

      it('should use EMPTY_ANIMATION_OPTIONS if no options are provided', () => {
        const chainOptions = { 'my': 'chainOptions' };
        const chain = new Map();
        const hooks = [];

        const [addStub, returnedFunction] = addChainTestSetup(chainOptions, chain, hooks);

        const element = { foo: 'bar' };
        const attributes = { translateX: [0, 100] };

        const result = returnedFunction(element, attributes);

        assert.equal(result, 'add');
        assert.deepEqual(addStub.firstCall.args, [element, attributes, EMPTY_ANIMATION_OPTIONS, chainOptions, chain, hooks]);
      });
    });
  });

  describe('#startChainFunctionFactory', () => {
    it('should return a function', () => {
      const animar = new Animar();
      const result = animar.startChainFunctionFactory();
      assert.typeOf(result, 'function');
    });

    describe('returned function', () => {
      function startChainTestSetup(chain, hooks) {
        const animar = new Animar();
        const curriedMergeStub = sinon.stub().returns('merged');
        const mergeStub = sinon.stub(animar, 'mergeElementMaps').returns(curriedMergeStub);
        const requestStub = sinon.stub(animar, 'requestTick');
        const returnedFunction = animar.startChainFunctionFactory(chain, hooks);

        return [animar, returnedFunction, mergeStub, curriedMergeStub, requestStub];
      }

      it('should merge the instance\'s element map with the chain\'s', () => {
        const [animar, returnedFuncion, mergeStub, curriedMergeStub] =
          startChainTestSetup(new Map([['foo', 'bar']]), ['foo', 'bar']);

        returnedFuncion();

        assert.deepEqual([...mergeStub.firstCall.args[0].entries()], [['foo', 'bar']]);
        assert.deepEqual(curriedMergeStub.firstCall.args[0], {});
        assert.equal(animar.elementMap, 'merged');
      });

      it('should append the chain hooks to the instance hooks', () => {
        const [animar, returnedFuncion] =
          startChainTestSetup(new Map([['foo', 'bar']]), ['foo', 'bar']);
        animar.hooks = ['existing'];
        returnedFuncion();

        assert.deepEqual(animar.hooks, ['existing', 'foo', 'bar']);
      });

      it('should call requestTick', () => {
        const [, returnedFunction, , , requestStub] =
          startChainTestSetup(new Map([['foo', 'bar']]), ['foo', 'bar']);

        returnedFunction();

        assert.ok(requestStub.called);
      });
    });
  });
});
