import Animar from '../src/animar';
import PluginRegistry from '../src/pluginRegistry';

import { assert } from 'chai';

function assertMemberFunction (property) {
  assert.isDefined(property);
  assert.isFunction(property);
}

describe('Animar', () => {
  describe('#factory', () => {
    it('should create an object with only the relevant entry functions', () => {
      const animar = Animar();

      assertMemberFunction(animar.set);
      assertMemberFunction(animar.add);
      assertMemberFunction(animar.addPreset);
      assertMemberFunction(animar.addRenderPlugin);
      assertMemberFunction(animar.addTimingPlugin);
    });

    it('should create an object that exposes the internal state when testing', () => {
      const animar = Animar();
      assert.isDefined(animar.state);
    });

    it('should initialize internal state', () => {
      const { state: { ticking, elementMap, hooks, firstFrame, previousTime, registry } } = Animar();

      assert.isFalse(ticking);
      assert.instanceOf(elementMap, Map);
      assert.strictEqual(elementMap.size, 0);
      assert.deepEqual(hooks, []);
      assert.isTrue(firstFrame);
      assert.strictEqual(previousTime, 0);
      assert.instanceOf(registry, PluginRegistry);
    });

    it('should set built-in defaults if none are provided to the factory function', () => {
      const { state: { defaults: { delay, duration, easingFunction } } } = Animar();

      assert.strictEqual(delay, 0);
      assert.strictEqual(duration, 60);
      assert.isFunction(easingFunction);
    });

    it('should set the state defaults if provided', () => {
      const providedDefaults = {
        delay: 13,
        duration: 120,
        easingFunction: () => {}
      };
      const { state: { defaults } } = Animar(providedDefaults);

      assert.deepEqual(defaults, providedDefaults);
    });
  });

  describe('#set', () => {
    it('should return an object with chainable add and set functions', () => {
      const animar = Animar();

      const result = animar.set({}, {});

      assert.isFunction(result.add);
      assert.isFunction(result.set);
    });

    it('should immediately add elements and attributes if they don\'t already exist in state', () => {
      const animar = Animar();
      const testElementTarget = {};
      animar.set(testElementTarget, {
        'foo': 13,
        'bar': 15
      });

      const elementMap = animar.state.elementMap;
      assert.isDefined(elementMap.get(testElementTarget));
      assert.deepEqual(elementMap.get(testElementTarget).attributes, {
        foo: { model: 13, animations: [] },
        bar: { model: 15, animations: [] }
      });
    });

    it('should merge elements if they already exist in state', () => {
      const animar = Animar();
      const testElementTarget = {};
      animar.set(testElementTarget, {foo: 13})
            .set(testElementTarget, {bar: 15});

      const elementMap = animar.state.elementMap;
      assert.isDefined(elementMap.get(testElementTarget));
      assert.deepEqual(elementMap.get(testElementTarget).attributes, {
        foo: { model: 13, animations: [] },
        bar: { model: 15, animations: [] }
      });
    });
  });

  describe('#add', () => {

  });
});
