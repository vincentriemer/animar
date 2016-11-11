import PluginRegistry from '../src/pluginRegistry';
import * as AttributeFunctions from '../src/attribute';

import { assert } from 'chai';
import sinon from 'sinon';

const renderStub = sinon.stub().returns(10);
const testRenderPlugin = {
  name: 'testRenderPlugin',
  attributes: [ 'foo', 'bar' ],
  render: renderStub
};

describe('PluginRegistry', () => {
  afterEach(() => {
    renderStub.reset();
  });

  describe('#constructor', () => {
    it('should initialize all of the instance properties', () => {
      const registry = new PluginRegistry();

      assert.deepEqual(registry.renderRegistry, {});
      assert.deepEqual(registry.attributePluginMapping, {});
      assert.isNull(registry.timingPlugin);
    });
  });

  describe('#addRenderPlugin', () => {
    it('should add the render function to the renderRegistry', () => {
      const testName = 'test';
      const testRenderFunction = () => {};

      const registry = new PluginRegistry();
      registry.addRenderPlugin({
        name: testName,
        attributes: [],
        render: testRenderFunction
      });

      assert.strictEqual(registry.renderRegistry[testName], testRenderFunction);
    });

    it('should add a new attribute to the mapping if it has not been added before', () => {
      const testName = 'test';
      const testRenderFunction = () => {};
      const testAttributeName = 'testAttribute';

      const registry = new PluginRegistry();
      registry.addRenderPlugin({
        name: testName,
        attributes: [ testAttributeName ],
        render: testRenderFunction
      });

      assert.isDefined(registry.attributePluginMapping[testAttributeName]);
      assert.include(registry.attributePluginMapping[testAttributeName], testName);
    });

    it('should append a plugin name to an attribute mapping if the attribute has already been added', () => {
      const testName1 = 'test1';
      const testName2 = 'test2';
      const testRenderFunction = () => {};
      const testAttributeName = 'testAttribute';

      const registry = new PluginRegistry();
      registry.addRenderPlugin({
        name: testName1,
        attributes: [ testAttributeName ],
        render: testRenderFunction
      });
      registry.addRenderPlugin({
        name: testName2,
        attributes: [ testAttributeName ],
        render: testRenderFunction
      });

      assert.isDefined(registry.attributePluginMapping[testAttributeName]);
      assert.include(registry.attributePluginMapping[testAttributeName], testName1);
      assert.include(registry.attributePluginMapping[testAttributeName], testName2);
    });
  });

  describe('#addTimingPlugin', () => {
    it('should set the timing plugin property', () => {
      const timingFunction = () => {};
      const registry = new PluginRegistry();
      registry.addTimingPlugin(timingFunction);

      assert.strictEqual(registry.timingPlugin, timingFunction);
    });

    it('should throw an error if a timing plugin has already been set', () => {
      const timingFunction = () => {};
      const registry = new PluginRegistry();

      registry.addTimingPlugin(timingFunction);

      assert.throws(() => registry.addTimingPlugin(timingFunction));
    });
  });

  describe('#callRenderPlugins', () => {
    let stubbedCalculate;

    beforeEach(() => {
      stubbedCalculate = sinon.stub(AttributeFunctions, 'calculateAttributeDisplayValue').returns(10);
    });

    afterEach(() => {
      stubbedCalculate.restore();
    });

    it('should do nothing if there is not any render plugins', () => {
      const registry = new PluginRegistry();
      registry.callRenderPlugins({}, { attributes: { 'test': {} } });

      sinon.assert.notCalled(stubbedCalculate);
    });

    it('should call the render plugin with the calculated display value', () => {
      const testTarget = {};
      const registry = new PluginRegistry();

      registry.addRenderPlugin(testRenderPlugin);
      registry.callRenderPlugins(testTarget, {
        attributes: {
          foo: {}
        }
      });

      sinon.assert.calledWith(renderStub, testTarget, { foo: 10 });
    });
  });

  describe('#addPreset', () => {
    it('should add multiple render functions and a single timing plugin', () => {
      const registry = new PluginRegistry();

      const timingPlugin = () => {};
      const renderPlugin1 = { foo: 'bar' };
      const renderPlugin2 = { bar: 'foo' };

      sinon.stub(registry, 'addRenderPlugin');
      sinon.stub(registry, 'addTimingPlugin');

      registry.addPreset({ renderPlugins: [renderPlugin1, renderPlugin2], timingPlugin });

      assert.equal(registry.addRenderPlugin.firstCall.args[0], renderPlugin1);
      assert.equal(registry.addRenderPlugin.secondCall.args[0], renderPlugin2);
      assert.equal(registry.addTimingPlugin.firstCall.args[0], timingPlugin);
    });
  });
});
