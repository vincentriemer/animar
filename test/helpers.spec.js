/// <reference path="../typings/tsd.d.ts"/>
'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const jsdom = require('jsdom');

import * as Helpers from '../lib/helpers';

jsdom.env(
  '<div id="test"></div>',
  [], (errors, window) => {
    describe('Helpers', () => {
      let testDOMElement = window.document.getElementById("test");
      
      afterEach(() => {
        // reset all animateable properties
        testDOMElement.style.webkitTransform = '';
        testDOMElement.style.MozTransform = '';
        testDOMElement.style.msTransform = '';
        testDOMElement.style.OTransform = '';
        testDOMElement.style.transform = '';
        testDOMElement.style.opacity = '1';
        testDOMElement.style.perspective = 'none';
      });
      
      describe('#applyStyle()', () => {
        it('should set a transform string', () => {
          const transformString = 'translateX(20px) scale(1) rotate(30deg)';
          Helpers.applyStyle(testDOMElement, 'transform', transformString);
          assert.equal(testDOMElement.style.transform, transformString);
        });
        
        it('should set the opacity', () => {
          const opacityValue = '0';
          Helpers.applyStyle(testDOMElement, 'opacity', opacityValue);
          assert.equal(testDOMElement.style.opacity, opacityValue);
        });
        
        it('should set the perspective', () => {
          const perspectiveValue = '30px';
          Helpers.applyStyle(testDOMElement, 'perspective', perspectiveValue);
          assert.equal(testDOMElement.style.perspective, perspectiveValue);
        })
      });
    });
  });