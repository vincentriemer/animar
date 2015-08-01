'use strict';

import Animation from './animation';
import Attribute from './attribute';
import Element from './element';
import { getStartValue } from './helpers';

export default class Animar {
  constructor() {
    this.ticking = false;
    this.elementMap = new Map();
    this.defaults = {
      delay: 0,
      easingFunction: (t, b, c, d) => { return c * t / d + b; }, // linear easing function
      duration: 60,
      loop: false
    };
    this.timescale = 1;
  }

  add(element, attributes, options) {
    let resolvedOptions = typeof options === 'undefined' ? {} : options;

    return this._add(
      element,
      attributes,
      resolvedOptions,
      {
        delay: 0,
        currentDuration: 0,
        totalDuration: 0
      },
      new Map()
    );
  }

  _mergeElements(src, target) {
    let result = new Map(src);

    target.forEach((element, elementRef) => {
      let mergedElement;

      console.log(result);
      if (result.has(elementRef)) {
        mergedElement = result.get(elementRef).merge(element);
      } else {
        mergedElement = element;
      }
      result.set(elementRef, mergedElement);
    });

    return result;
  }

  _resolveStartValue(start, element, attribute, currentChain) {
    let resolvedStart = start;
    
    if (typeof start === 'undefined') {
      if (currentChain.has(element) && currentChain.get(element).hasAttribute(attribute)) {
        resolvedStart = currentChain.get(element).getModelFromAttribute(attribute);
      } else if (this.elementMap.has(element) && this.elementMap.get(element).hasAttribute(attribute)) {
        resolvedStart = this.elementMap.get(element).getModelFromAttribute(attribute);
      } else {
        resolvedStart = getStartValue(element, attribute);
      }
    }
    
    return resolvedStart;
  }

  _add(element, attributes, options, chainOptions, currentChain) {
    const resolvedOptions = {
      delay: typeof options.delay === 'undefined' ?
        this.defaults.delay : options.delay,
      easingFunction: typeof options.easingFunction === 'undefined' ?
        this.defaults.easingFunction : options.easingFunction,
      duration: typeof options.duration === 'undefined' ?
        this.defaults.duration : options.duration,
      loop: typeof options.loop === 'undefined' ?
        this.defaults.loop : options.loop
    };

    for (const attribute in attributes) {
      if (attributes.hasOwnProperty(attribute)) {
        const attributeValue = attributes[attribute];
        let start, destination;

        if (typeof attributeValue === 'number') {
          destination = attributeValue;
        } else {
          start = attributeValue[0];
          destination = attributeValue[1];
        }

        start = this._resolveStartValue(start, element, attribute, currentChain);

        start -= destination;

        let newAnimation = new Animation(
          0 - (resolvedOptions.delay + chainOptions.delay),
          start,
          0 - start,
          resolvedOptions.duration,
          resolvedOptions.easingFunction,
          resolvedOptions.loop,
          resolvedOptions.delay + chainOptions.delay,
          0
        );

        let newAttribute = new Attribute(attribute, destination);
        newAttribute.addAnimation(newAnimation);

        let newElement = new Element(element);
        newElement.addAttribute(attribute, newAttribute);

        let tempEMap = new Map();
        tempEMap.set(element, newElement);
     
        currentChain = this._mergeElements(currentChain, tempEMap);
      }
    }
    chainOptions.currentDuration = Math.max(chainOptions.currentDuration, resolvedOptions.delay + resolvedOptions.duration);
    return this._fullChainObjectFactory(chainOptions, currentChain);
  }

  _fullChainObjectFactory(chainOptions, chain) {
    return {
      start: this._startChainFunctionFactory(chain),
      loop: this._loopChainFunctionFactory(chainOptions, chain),
      add: this._addChainFunctionFactory(chainOptions, chain),
      then: this._thenChainFunctionFactory(chainOptions, chain),
      wait: this._waitChainFunctionFactory(chainOptions, chain)
    };
  }

  _waitChainFunctionFactory(chainOptions, chain) {
    return numFrames => {
      chainOptions.totalDuration += numFrames;
      return this._thenChainFunctionFactory(chainOptions, chain);
    };
  }

  _thenChainFunctionFactory(chainOptions, chain) {
    return (element, attributes, options) => {
      chainOptions.totalDuration += chainOptions.currentDuration;
      chainOptions.currentDuration = 0;
      chainOptions.delay = chainOptions.totalDuration;
      let resolvedOptions = typeof options === 'undefined' ? {} : options;
      return this._add(element, attributes, resolvedOptions, chainOptions, chain);
    };
  }

  _addChainFunctionFactory(chainOptions, chain) {
    return (element, attributes, options) => {
      let resolvedOptions = typeof options === 'undefined' ? {} : options;
      return this._add(element, attributes, resolvedOptions, chainOptions, chain);
    };
  }

  _loopChainFunctionFactory(chainOptions, chain) {
    return () => {
      chainOptions.totalDuration += chainOptions.currentDuration;

      let newElementMap = new Map();

      chain.forEach((element, elementRef) => {
        element.forEachAnimationInAttribute(animation => {
          animation.loop = true;
          animation.wait = chainOptions.totalDuration - animation.delay - animation.totalIterations;
          return animation;
        });
        newElementMap.set(elementRef, element);
      });

      chain = newElementMap;

      return {
        start: this._startChainFunctionFactory(chain)
      };
    };
  }

  _startChainFunctionFactory(chain) {
    return () => {
      this.elementMap = this._mergeElements(this.elementMap, chain);
      this._requestTick();
    };
  }

  _requestTick() {
    if (!this.ticking) {
      window.requestAnimationFrame(this._update.bind(this));
      this.ticking = true;
    }
  }

  _update() {
    this.ticking = false;
    var hasChanged = this._step();

    if (hasChanged) {
      this._render();
      this._requestTick();
    }
  }

  _render() {
    this.elementMap.forEach((element, domElement) => {
      element.render(domElement);
    });
  }

  _step() {
    let somethingChanged = false;
    this.elementMap.forEach((element, domElement) => {
      element.forEachAnimationInAttribute(animation => {
        if (animation.step(this.timescale)) {
          somethingChanged = true;
          return animation;
        }
      });
    });
    return somethingChanged;
  }
}