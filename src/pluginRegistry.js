/* @flow */

import {Element} from './types';
import { calculateAttributeDisplayValue } from './attribute';
import { entries, reduce } from './objUtils';

type RenderFunction = (element: any, attrValues: { [attributeName: string]: string }) => void;

type RenderPlugin = {
  name:       string,
  attributes: Array<string>,
  render:     RenderFunction
}

type TimingPlugin = () => (update: (timestamp: number) => void) => void;

type Preset = {
  renderPlugins: Array<RenderPlugin>,
  timingPlugin:  TimingPlugin
};

class PluginRegistry {
  renderRegistry:         { [pluginName: string]: RenderFunction };
  attributePluginMapping: { [pluginName: string]: Array<string> };
  timingPlugin:           ?TimingPlugin;

  constructor() {
    this.renderRegistry         = {};
    this.attributePluginMapping = {};
    this.timingPlugin           = null;
  }

  addRenderPlugin({ name, attributes, render }: RenderPlugin): void {
    this.renderRegistry[name] = render;
    attributes.forEach(attribute => {
      if (this.attributePluginMapping[attribute] == null) this.attributePluginMapping[attribute] = [];
      this.attributePluginMapping[attribute].push(name);
    });
  }

  callRenderPlugins(target: any, element: Element): void {
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
  }

  addTimingPlugin(timingPlugin: TimingPlugin): void {
    if (this.tickMethod !== null) {
      console.warn('WARNING: A timing plugin was already installed, overriding...');
    }
    this.timingPlugin = timingPlugin;
  }

  addPreset({ renderPlugins = [], timingPlugin }: Preset): void {
    renderPlugins.forEach(this.addRenderPlugin.bind(this));
    if (timingPlugin != null) {
      this.addTimingPlugin(timingPlugin);
    }
  }
}

export default PluginRegistry;
