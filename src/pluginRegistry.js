import { calculateAttributeDisplayValue } from './attribute';
import { entries, reduce } from './objUtils';

const RegistryPrototype = {

  addRenderPlugin({ name, attributes, render }) {
    this.renderRegistry[name] = render;
    attributes.forEach(attribute => {
      if (this.attributePluginMapping[attribute] == null) this.attributePluginMapping[attribute] = [];
      this.attributePluginMapping[attribute].push(name);
    });
  },

  callRenderPlugins(target, element) {
    const renderValues = reduce(element.attributes)((output, attr, name) => {
      const mappings = this.attributePluginMapping[name];

      if (mappings == null) return output;

      mappings.forEach(mapping => {
        if (output[mapping] == null) output[mapping] = {};
        output[mapping][name] = calculateAttributeDisplayValue(attr);
      });

      return output;
    }, {});

    entries(renderValues).forEach(([pluginName, attrValues]) => {
      this.renderRegistry[pluginName](target, attrValues);
    });
  },

  addTimingPlugin(tickMethod) {
    if (this.tickMethod !== null) {
      console.warn('WARNING: A timing plugin was already installed, overriding...');
    }
    this.tickMethod = tickMethod;
  },

  addPreset({ renderPlugins = [], timingPlugin }) {
    renderPlugins.forEach(this.addRenderPlugin.bind(this));
    if (timingPlugin != null) {
      this.addTimingPlugin(timingPlugin);
    }
  }

};

export default function() {
  return Object.assign(
    Object.create(RegistryPrototype),
    {
      renderRegistry: {},
      attributePluginMapping: {},
      tickMethod: null
    }
  );
}
