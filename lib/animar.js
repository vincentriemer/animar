'use strict';

import Animation from './animation';
import Attribute from './attribute';
import Element from './element';

import * as Easing from './ease';
import { getStartValue } from './helper';

export default class Animar {

  constructor() {
    this.ticking = false;
    this.elementMap = new Map();
    this.defaults = {
      delay: 0,
      easingFunction: Easing.quarticInOut(),
      duration: 60,
      loop: false
    };
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
    let result = new Map(this.elementMap);

    target.forEach((element, elementRef) => {
      let mergedElement;

      if (result.has(elementRef)) {
        mergedElement = result.get(elementRef).merge(element);
      } else {
        mergedElement = element;
      }

      result.set(elementRef, mergedElement);
    });

    return result;
  }

  _resolveEasingFunction(canidateEasingFunction) {
    if (typeof canidateEasingFunction === 'undefined') {
      return this.defaults.easingFunction;
    } else if (typeof canidateEasingFunction === 'string') {
      return Easing[canidateEasingFunction]();
    } else {
      return canidateEasingFunction;
    }
  }

  _resolveStartValue(start, element, attribute, currentChain) {
    let resolvedStart = start;
    if (typeof start === 'undefined') {
      if (currentChain.has(element) &&
          currentChain.get(element).hasAttribute(attribute)) {
        resolvedStart = currentChain.get(element).getModelFromAttribute(attribute);
      } else if (this.elementMap.has(element) &&
                 this.elementMap.get(element).hasAttribute(attribute)) {
        resolvedStart = this.elementMap.get(element).getModelFromAttribute(attribute);
      } else {
        resolvedStart = getStartValue(element, attribute);
      }
    }
    return resolvedStart;
  }

  _add(element, attributes, options, chainOptions, currentChain) {
    let resolvedOptions = {
      delay: typeof options.delay === 'undefined' ?
        this.defaults.delay : options.delay,
      easingFunction: this._resolveEasingFunction(options.easingFunction),
      duration: typeof options.duration === 'undefined' ?
        this.defaults.duration : options.duration,
      loop: typeof options.loop === 'undefined' ?
        this.defaults.loop : options.loop
    };

    for (let attribute in attributes) {
      if (attributes.hasOwnProperty(attribute)) {
        let start, destination;
        let attributeValue = attributes[attribute];

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

        let newElement = new Element();
        newElement.addAttribute(attribute, newAttribute);

        let tempEMap = new Map();
        tempEMap.set(element, newElement);

        currentChain = this._mergeElements(currentChain, tempEMap);
      }
    }
  }

  _fullChainObjectFactory(chainOptions, chain) {
    return {
      start: this._startChainFunctionFactory(chain),
      loop: this._loopChainFunctionFactory(chain, chainOptions),
      and: this._addChainFunctionFactory(chain, chainOptions),
      then: this._thenChainFunctionFactory(chain, chainOptions),
      wait: this._waitChainFunctionFactory(chain, chainOptions)
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
      return this._add(element, attributes, options, chainOptions, chain);
    };
  }

  _addChainFunctionFactory(chainOptions, chain) {
    return (element, attributes, options) => {
      return this._add(element, attributes, options, chainOptions, chain);
    };
  }

  _loopChainFunctionFactory(chainOptions, chain) {
    return () => {
      chainOptions.totalDuration += chainOptions.currentDuration;

      let newElementMap = new Map();

      chain.elementMap.forEach((element, elementRef) => {
        newElementMap.set(
          elementRef,
          element.forEachAnimationInAttribute(animation => {
            animation.loop = true;
            animation.wait = chainOptions.totalDuration - animation.delay - animation.totalIterations;
            return animation;
          })
        );
      });

      chain.elementMap = newElementMap;

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
      window.requestAnimationFrame(this.update.bind(this));
      this.ticking = true;
    }
  }

  _update() {
    var hasChanged = this._step();
    this.ticking = false;

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
    let changed = false;
    this.elementMap.forEach((element, domElement) => {
      this.elementMap.set(
        domElement,
        element.forEachAnimationInAttribute(animation => {
          if (animation.currentIteration < (animation.totalIterations + animation.wait)) {
            animation.currentIteration += 1;
            changed = true;
          } else if (animation.loop) {
            animation.currentIteration = 0 - animation.delay;
            changed = true;
          }
        }));
    });
    return changed;
  }

}