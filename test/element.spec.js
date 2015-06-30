/// <reference path="../typings/tsd.d.ts"/>
'use strict';

// let assert = require('chai').assert;
// let sinon = require('sinon');
// let jsdom = require('jsdom');

// import Element from '../lib/element';

// jsdom.env(
//   '<div id="test1"></div><div id="test2></div>',
//   [], (errors, window) => {
//     describe('Element', () => {
//       let testDOMElement1 = window.document.getElementById("test1");
//       // let testDOMElement2 = window.document.getElementById("test2");
      
//       describe('#constructor()', () => {
//         it('should store the dom element and initialize a new Map', () => {
//           let testElement = new Element(testDOMElement1);
          
//           assert.equal(testElement.domElement, testDOMElement1);
//           assert.property(testElement, 'attributes');
//         });
//       });
//     });
//   });