/* @flow */
import type Animation from './animation'; //eslint-disable-line no-unused-vars
import type { ChainOptions } from './animar'; //eslint-disable-line no-unused-vars
import { calculateAnimationValue, applyStyle, TRANSFORM_ATTRIBUTES} from './helpers';

/**
 * Class that holds all of the animation information for an {@link Element}'s Attribute.
 * @protected
 */
export default class Attribute {
  model:number;
  animations:Array<?Animation>;
  name:string;

  /**
   * Create a new Attribute instance.
   * @param name
   * @param model
   */
  constructor (name:string, model:number) {
    this.model = model;
    this.animations = [];
    this.name = name;
  }

  /**
   * Add an {@link Animation} to the Attribute instance.
   * @param animation
   */
  addAnimation (animation:Animation) {
    this.animations.push(animation);
  }

  /**
   * Merge this Attribute's instance properties with a target Attribute.
   * @param target
   * @returns {Attribute}
   */
  merge (target:Attribute):Attribute {
    let newAttribute = new Attribute(target.name, target.model);
    newAttribute.animations = this.animations.concat(target.animations);
    return newAttribute;
  }

  /**
   * Step the Attribute's animation state forward.
   * @param timescale
   * @returns {boolean}
   */
  step (timescale:number):boolean {
    let somethingChanged = false;

    this.animations = this.animations.map(animation => {
      if (animation != null && animation.step(timescale)) {
        somethingChanged = true;
        return animation;
      }
    }).filter((x) => x != null);

    return somethingChanged;
  }

  /**
   * Render the Attribute's value to the DOM.
   * @param domElement
   * @returns {string}
   */
  render (domElement:HTMLElement):string {
    let transformValue = '';
    let targetValue = String(this.model + calculateAnimationValue(this.animations));

    const pxRegex = /(perspective)|(translate[XYZ])/,
      degRegex = /rotate[XYZ]?/;

    targetValue += (
      pxRegex.test(this.name) ? 'px' : (
        degRegex.test(this.name) ? 'deg' : ''
      )
    );

    if (TRANSFORM_ATTRIBUTES.indexOf(this.name) !== -1) {
      transformValue += `${this.name}(${targetValue}) `;
    } else {
      applyStyle(domElement, this.name, targetValue);
    }

    return transformValue;
  }

  /**
   * Update the Attribute's animation animation state to loop.
   * @param chainOptions
   */
  loop (chainOptions:ChainOptions) {
    this.animations.forEach(animation => {
      if (animation != null) {
        animation.loop(chainOptions);
      }
    });
  }
}
