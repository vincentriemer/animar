'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = require('./helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* @flow */
//eslint-disable-line no-unused-vars
/*:: import type Attribute from './attribute';*/
//eslint-disable-line no-unused-vars
/*:: import type { ChainOptions } from './animar';*/

/**
 * Class that holds all the animation information for an HTML DOM Element.
 * @protected
 */

var Element = (function () {

  /**
   * Create a new Element instance
   * @param element
   */

  function Element(element /*:HTMLElement*/) {
    _classCallCheck(this, Element);

    this.attributes = new Map();
    this.domElement = element;
  }

  /**
   * Render the Element's current animation state to the DOM.
   * @param hardwareAcceleration
   */

  _createClass(Element, [{
    key: 'render',
    value: function render(hardwareAcceleration /*:boolean*/) {
      var _this = this;

      var transformValues /*:Array<?[string, string]>*/ = [];

      this.attributes.forEach(function (attribute) {
        var currentTransform = attribute.render(_this.domElement);
        var index = _helpers.TRANSFORM_ATTRIBUTES.indexOf(currentTransform[0]);
        transformValues[index] = currentTransform;
      });

      if (transformValues.length !== 0) {
        if (hardwareAcceleration && transformValues[2] == null) {
          transformValues[2] = ['translateZ', '0'];
        }

        // Array.filter function currently doesn't work properly with FlowType
        var filteredTransformValues /*:Array<[string, string]>*/ = [];
        for (var i = 0; i < transformValues.length; i++) {
          if (transformValues[i] != null) {
            filteredTransformValues.push(transformValues[i]);
          }
        }

        var transformStringArray = filteredTransformValues.map(function (v) {
          return v[0] + '(' + v[1] + ')';
        });

        (0, _helpers.applyStyle)(this.domElement, 'transform', transformStringArray.join(' '));
      }
    }

    /**
     * Merge elements' properties.
     * @param target
     * @returns {Element}
     */

  }, {
    key: 'merge',
    value: function merge(target /*:Element*/) {
      var mergedElement = new Element(this.domElement);
      mergedElement.attributes = new Map(this.attributes);
      target.attributes.forEach(function (attr, attrName) {
        var mergedAttribute = undefined;

        var existingAttribute = mergedElement.attributes.get(attrName);
        if (existingAttribute != null) {
          mergedAttribute = existingAttribute.merge(attr);
        } else {
          mergedAttribute = attr;
        }

        mergedElement.attributes.set(attrName, mergedAttribute);
      });

      return mergedElement;
    }

    /**
     * Add an {@link Attribute} to the Element instance.
     * @param attrName
     * @param attribute
     */

  }, {
    key: 'addAttribute',
    value: function addAttribute(attrName /*:string*/, attribute /*:Attribute*/) {
      this.attributes.set(attrName, attribute);
    }

    /**
     * Step the Element's animation state forward.
     * @param timescale
     * @returns {boolean}
     */

  }, {
    key: 'step',
    value: function step(timescale /*:number*/) {
      var somethingChanged = false;
      this.attributes.forEach(function (attribute) {
        if (attribute.step(timescale)) {
          somethingChanged = true;
        }
      });
      return somethingChanged;
    }

    /**
     * Update the Element's animation state to loop.
     * @param chainOptions
     */

  }, {
    key: 'loop',
    value: function loop(chainOptions /*:ChainOptions*/) {
      this.attributes.forEach(function (attribute) {
        attribute.loop(chainOptions);
      });
    }
  }]);

  return Element;
})();

exports.default = Element;