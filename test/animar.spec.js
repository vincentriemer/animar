/// <reference path="../typings/tsd.d.ts"/>
global.__DEV__ = true;

var Animar = require('../src/animar');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('Animar', () => {
  describe('#constructor()', () => {
    it('should do something', () => {
      var animar = new Animar();
    });
  });
});
