/* @flow */
/* global __DEV__ */
import Animation from './animation';
import Attribute from './attribute';
import Element from './element';
import { getStartValue } from './helpers';

type ElementMap = Map<HTMLElement, Element>;
type AnimationOptions = { // user-provided so can't assume correct type or existance
  delay: ?any,
  easingFunction: ?any,
  duration: ?any,
  loop: ?any
};
type AttributesOptions = { [key: string]: number | Array<number> };
type ChainOptions = {
  delay: number,
  currentDuration: number,
  totalDuration: number
}
type FullChainObject = {
  start: Function,
  loop: Function,
  add: Function,
  then: Function
};
type ThenChainObject = {
  add: Function
};
type LoopChainObject = {
  start: Function
}
type AddChainObject = FullChainObject;

export default class Animar {
  ticking: boolean;
  elementMap: ElementMap;
  defaults: { delay: number, easingFunction: Function, duration: number, loop: boolean };
  timescale: number;

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

  add(element: HTMLElement, attributes: AttributesOptions, options: AnimationOptions): FullChainObject {
    let resolvedOptions = options == null ? {
      delay: null,
      easingFunction: null,
      duration: null,
      loop: null
    } : options;

    if (__DEV__) {
      if (element == null) {
        throw 'Missing or null parameter: element';
      }
      if (!element instanceof HTMLElement) {
        throw "Parameter 'element' should be of type HTMLElement";
      }
      if (typeof attributes === 'undefined') {
        throw 'Missing or null parameter: attribtues';
      }
      if (typeof attributes !== 'object') {
        throw "Parameter 'attributes' should be of type Object";
      }
      // TODO: Validate attributes contents
    }

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

  _mergeElementMaps(src: ElementMap, target: ElementMap): ElementMap {
    let result = new Map(src);

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

  _resolveStartValue(start: ?number, element: HTMLElement, attribute: string, currentChain: ElementMap): number {
    if (start == null) {
      if (currentChain.has(element) && currentChain.get(element).hasAttribute(attribute)) {
        start = currentChain.get(element).getModelFromAttribute(attribute);
      } else if (this.elementMap.has(element) && this.elementMap.get(element).hasAttribute(attribute)) {
        start = this.elementMap.get(element).getModelFromAttribute(attribute);
      } else {
        start = getStartValue(element, attribute);
      }
    }
    return start;
  }

  _add(element: HTMLElement,
       attributes: { [key: string]: number | Array<number> },
       options: AnimationOptions,
       chainOptions: ChainOptions,
       currentChain: ElementMap): FullChainObject
   {
    const resolvedOptions = {
      delay: options.delay === null || options.delay === undefined ?
        this.defaults.delay : options.delay,
      easingFunction: options.easingFunction === null || options.easingFunction === undefined ?
        this.defaults.easingFunction : options.easingFunction,
      duration: options.duration === null || options.duration === undefined ?
        this.defaults.duration : options.duration,
      loop: options.loop === null || options.loop === undefined ?
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

        currentChain = this._mergeElementMaps(currentChain, tempEMap);
      }
    }
    chainOptions.currentDuration = Math.max(chainOptions.currentDuration, resolvedOptions.delay + resolvedOptions.duration);
    return this._fullChainObjectFactory(chainOptions, currentChain);
  }

  _fullChainObjectFactory(chainOptions: ChainOptions, chain: ElementMap): FullChainObject {
    return {
      start: this._startChainFunctionFactory(chain),
      loop: this._loopChainFunctionFactory(chainOptions, chain),
      add: this._addChainFunctionFactory(chainOptions, chain),
      then: this._thenChainFunctionFactory(chainOptions, chain)
    };
  }

  _thenChainFunctionFactory(chainOptions: ChainOptions, chain: ElementMap): Function {
    return (wait=0) => {
      chainOptions.totalDuration += (chainOptions.currentDuration + wait);
      chainOptions.currentDuration = 0;
      chainOptions.delay = chainOptions.totalDuration;
      return {
        add: this._addChainFunctionFactory(chainOptions, chain)
      };
    };
  }

  _addChainFunctionFactory(chainOptions: ChainOptions, chain: ElementMap): Function {
    return (element, attributes, options) => {
      let resolvedOptions = typeof options === 'undefined' ? {
        delay: null,
        easingFunction: null,
        duration: null,
        loop: null
      } : options;
      return this._add(element, attributes, resolvedOptions, chainOptions, chain);
    };
  }

  _loopChainFunctionFactory(chainOptions: ChainOptions, chain: ElementMap): Function {
    return () => {
      chainOptions.totalDuration += chainOptions.currentDuration;

      let newElementMap = new Map();

      chain.forEach((element, elementRef) => {
        element.forEachAnimationInAttribute(animation => {
          if (animation !== null && animation !== undefined) {
            animation.loop = true;
            animation.wait = chainOptions.totalDuration - animation.delay - animation.totalIterations;
            return animation;
          }
        });
        newElementMap.set(elementRef, element);
      });

      chain = newElementMap;

      return {
        start: this._startChainFunctionFactory(chain)
      };
    };
  }

  _startChainFunctionFactory(chain: ElementMap): Function {
    return () => {
      console.log(chain);
      this.elementMap = this._mergeElementMaps(this.elementMap, chain);
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

  _step(): boolean {
    let somethingChanged = false;
    this.elementMap.forEach(element => {
      if (element.step(this.timescale)) {
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }
}
