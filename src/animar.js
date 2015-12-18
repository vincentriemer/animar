/* @flow */
/* global __DEV__ */
import Animation from './animation';
import Attribute from './attribute';
import Element from './element';

type ElementMap = Map<HTMLElement, Element>;
type AnimationOptions = {
  delay: ?any,
  easingFunction: ?any,
  duration: ?any,
  loop: ?any
};
type ResolvedAnimationOptions = {
  delay: number,
  easingFunction: Function,
  duration: number,
  loop: boolean
};
export type AttributesOptions = { [key: string]: number | Array<number> };
export type ChainOptions = {
  delay: number,
  currentDuration: number,
  totalDuration: number
}

type AddFunction = (element:HTMLElement, attributes:AttributesOptions, options:AnimationOptions) => FullChainObject;
type StartFunction = () => void;
type ThenFunction = (wait:number) => { add: AddFunction };
type LoopFunction = () => { start: StartFunction };

type FullChainObject = {
  start: StartFunction,
  loop: LoopFunction,
  add: AddFunction,
  then: ThenFunction
};

const EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null,
  loop: null
};

class Animar {
  ticking:boolean;
  elementMap:ElementMap;
  defaults:{ delay: number, easingFunction: Function, duration: number, loop: boolean };
  timescale:number;

  constructor () {
    this.ticking = false;
    this.elementMap = new Map();
    this.defaults = {
      delay: 0,
      easingFunction: (t, b, c, d) => {
        return c * t / d + b;
      }, // linear easing function
      duration: 60,
      loop: false
    };
    this.timescale = 1;
  }

  add (element:HTMLElement, attributes:AttributesOptions, options:AnimationOptions):FullChainObject {
    let resolvedOptions = options == null ? EMPTY_ANIMATION_OPTIONS : options;

    /* istanbul ignore else */
    if (__DEV__) {
      var validateAddParameters = require('./helpers').validateAddParameters;
      validateAddParameters(element, attributes, resolvedOptions);
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

  mergeElementMaps (src:ElementMap, target:ElementMap):ElementMap {
    let result = new Map(src);

    target.forEach((element, elementRef) => {
      let mergedElement;

      let existingElement = result.get(elementRef);
      if (existingElement != null) {
        mergedElement = existingElement.merge(element);
      } else {
        mergedElement = element;
      }
      result.set(elementRef, mergedElement);
    });

    return result;
  }

  resolveStartValue (start:?number, element:HTMLElement, attribute:string, currentChain:ElementMap):?number {
    // just return the start value if it was supplied
    if (start != null) {
      return start;
    }

    // TODO: Replace existence logic with hasAttribute once FlowType has fixed its bug
    let currentChainElement = currentChain.get(element);
    let animarMapElement = this.elementMap.get(element);

    if (currentChainElement != null && currentChainElement.hasAttribute(attribute)) {
      // check to see if start value can be inferred from current chain element map
      return currentChainElement.getModelFromAttribute(attribute);
    } else if (animarMapElement != null && animarMapElement.hasAttribute(attribute)) {
      // check to see if start value can be inferred from existing element map in Animar instance
      return animarMapElement.getModelFromAttribute(attribute);
    } else {
      throw new Error('Start value not specified and model does not exist');
    }
  }

  resolveAnimationOptions (options:AnimationOptions):ResolvedAnimationOptions {
    return {
      delay: options.delay == null ?
        this.defaults.delay : options.delay,
      easingFunction: options.easingFunction == null ?
        this.defaults.easingFunction : options.easingFunction,
      duration: options.duration == null ?
        this.defaults.duration : options.duration,
      loop: options.loop == null ?
        this.defaults.loop : options.loop
    };
  }

  _add (element:HTMLElement,
       attributes:{ [key: string]: number | Array<number> },
       options:AnimationOptions,
       chainOptions:ChainOptions,
       currentChain:ElementMap):FullChainObject {
    let resolvedOptions = this.resolveAnimationOptions(options);
    Object.keys(attributes).forEach((attribute) => {
      const attributeValue = attributes[attribute];
      let start, destination;

      if (typeof attributeValue === 'number') {
        destination = attributeValue;
      } else {
        start = attributeValue[0];
        destination = attributeValue[1];
      }

      start = this.resolveStartValue(start, element, attribute, currentChain);

      if (start == null) {
        throw new Error('Animation start value is not provided and cannot be inferred');
      } else {
        currentChain = this.addAnimationToChain(start, destination, resolvedOptions, chainOptions, attribute,
          element, currentChain);
      }
    });
    chainOptions.currentDuration = Math.max(chainOptions.currentDuration,
      resolvedOptions.delay + resolvedOptions.duration);
    return this.fullChainObjectFactory(chainOptions, currentChain);
  }

  addAnimationToChain (start:number,
                      destination:number,
                      resolvedOptions:ResolvedAnimationOptions,
                      chainOptions:ChainOptions,
                      attribute:string,
                      element:HTMLElement,
                      currentChain:ElementMap):ElementMap {
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

    return this.mergeElementMaps(currentChain, tempEMap);
  }

  fullChainObjectFactory (chainOptions:ChainOptions, chain:ElementMap):FullChainObject {
    return {
      start: this.startChainFunctionFactory(chain),
      loop: this.loopChainFunctionFactory(chainOptions, chain),
      add: this.addChainFunctionFactory(chainOptions, chain),
      then: this.thenChainFunctionFactory(chainOptions, chain)
    };
  }

  thenChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap):ThenFunction {
    return (wait = 0) => {
      let newChainOptions = Object.create(chainOptions);
      newChainOptions.totalDuration += (chainOptions.currentDuration + wait);
      newChainOptions.currentDuration = 0;
      newChainOptions.delay = newChainOptions.totalDuration;
      return {
        add: this.addChainFunctionFactory(newChainOptions, chain)
      };
    };
  }

  addChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap):AddFunction {
    return (element, attributes, options) => {
      let resolvedOptions = options == null ? EMPTY_ANIMATION_OPTIONS : options;

      /* istanbul ignore else */
      if (__DEV__) {
        var validateAddParameters = require('./helpers').validateAddParameters;
        validateAddParameters(element, attributes, resolvedOptions);
      }

      return this._add(element, attributes, resolvedOptions, chainOptions, chain);
    };
  }


  loopChainFunctionFactory (chainOptions:ChainOptions, chain:ElementMap):LoopFunction {
    return () => {
      chainOptions.totalDuration += chainOptions.currentDuration;

      let newElementMap = new Map();
      chain.forEach((element, elementRef) => {
        element.loop(chainOptions);
        newElementMap.set(elementRef, element);
      });
      chain = newElementMap;

      return {
        start: this.startChainFunctionFactory(chain)
      };
    };
  }

  startChainFunctionFactory (chain:ElementMap):StartFunction {
    return () => {
      this.elementMap = this.mergeElementMaps(this.elementMap, chain);
      this.requestTick();
    };
  }

  requestTick () {
    if (!this.ticking) {
      window.requestAnimationFrame(this.update.bind(this));
      this.ticking = true;
    }
  }

  update () {
    this.ticking = false;
    var hasChanged = this.step();

    if (hasChanged) {
      this.render();
      this.requestTick();
    }
  }

  render () {
    this.elementMap.forEach((element, domElement) => {
      element.render(domElement);
    });
  }

  step ():boolean {
    let somethingChanged = false;
    this.elementMap.forEach(element => {
      if (element.step(this.timescale)) {
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }
}

module.exports = Animar;
