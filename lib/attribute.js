'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = require('./helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* @flow */
//eslint-disable-line no-unused-vars
/*:: import type Animation from './animation';*/
//eslint-disable-line no-unused-vars
/*:: import type { ChainOptions } from './animar';*/

/**
 * Regex expression to detect transform attributes that require the px unit.
 * @type {RegExp}
 * @protected
 */
var pxRegex = /(perspective)|(translate[XYZ])/;

/**
 * Regex expression to detect transform attributes that require the deg unit.
 * @type {RegExp}
 * @protected
 */
var degRegex = /rotate[XYZ]?/;

/**
 * Class that holds all of the animation information for an {@link Element}'s Attribute.
 * @protected
 */

var Attribute = (function () {

  /**
   * Create a new Attribute instance.
   * @param name
   * @param model
   */

  function Attribute(name /*:string*/, model /*:number*/) {
    _classCallCheck(this, Attribute);

    this.model = model;
    this.animations = [];
    this.name = name;
  }

  /**
   * Add an {@link Animation} to the Attribute instance.
   * @param animation
   */

  _createClass(Attribute, [{
    key: 'addAnimation',
    value: function addAnimation(animation /*:Animation*/) {
      this.animations.push(animation);
    }

    /**
     * Merge this Attribute's instance properties with a target Attribute.
     * @param target
     * @returns {Attribute}
     */

  }, {
    key: 'merge',
    value: function merge(target /*:Attribute*/) {
      var newAttribute = new Attribute(target.name, target.model);
      newAttribute.animations = this.animations.concat(target.animations);
      return newAttribute;
    }

    /**
     * Step the Attribute's animation state forward.
     * @param timescale
     * @returns {boolean}
     */

  }, {
    key: 'step',
    value: function step(timescale /*:number*/) {
      var somethingChanged = false;

      this.animations = this.animations.map(function (animation) {
        if (animation != null && animation.step(timescale)) {
          somethingChanged = true;
          return animation;
        }
      }).filter(function (x) {
        return x != null;
      });

      return somethingChanged;
    }

    /**
     * Render the Attribute's value to the DOM.
     * @param domElement
     * @returns {Object}
     */

  }, {
    key: 'render',
    value: function render(domElement /*:HTMLElement*/) {
      var transformValue = [];
      var targetValue = String(this.model + (0, _helpers.calculateAnimationValue)(this.animations));

      targetValue += pxRegex.test(this.name) ? 'px' : degRegex.test(this.name) ? 'deg' : '';

      if (_helpers.TRANSFORM_ATTRIBUTES.indexOf(this.name) !== -1) {
        transformValue.push(this.name);
        transformValue.push(targetValue);
      } else {
        (0, _helpers.applyStyle)(domElement, this.name, targetValue);
      }

      return transformValue;
    }

    /**
     * Update the Attribute's animation animation state to loop.
     * @param chainOptions
     */

  }, {
    key: 'loop',
    value: function loop(chainOptions /*:ChainOptions*/) {
      this.animations.forEach(function (animation) {
        if (animation != null) {
          animation.loop(chainOptions);
        }
      });
    }
  }]);

  return Attribute;
})();

exports.default = Attribute;