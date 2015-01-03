var should = require('chai').should(),
    sinon = require('sinon'),
    Element = require('../lib/element'),
    Helper = require('../lib/helper');

var testEasingFunction = function() {};

describe('Element', function() {
  var testElement;

  beforeEach(function() {
    testElement = new Element();
  });

  describe('new Element()', function() {
    it('should initialize with an empty attribute map', function() {
      testElement.should.have.property('attributeMap');
    });
  });

  describe('#createAttribute()', function() {
    it('should add a new attribute object to the attributeMap', function() {
      testElement.createAttribute({ attribute: 'test', start: 0,});
      testElement.attributeMap.get('test').model.should.be.eql(0);
      testElement.attributeMap.get('test').animations.should.have.length(0);
    });
  });

  describe('#addAnimation()', function() {
    it('should create a new attribute if one doesn\'t exist', function() {
      var testAnimation = { attribute: 'test', start: 0, duration: 0, destination: 0, ease: testEasingFunction, delay: 0, loop: false };
      testElement.addAnimation(testAnimation);
      should.exist(testElement.attributeMap.get('test'));
    });
    it('should add a new animation to an attribute if it already exists', function() {
      var testAnimation1 = { attribute: 'test', start: 0, duration: 0, destination: 0, ease: testEasingFunction, delay: 0, loop: false };
      var testAnimation2 = { attribute: 'test', start: 1, duration: 0, destination: 0, ease: testEasingFunction, delay: 0, loop: false };
      testElement.addAnimation(testAnimation1);
      testElement.addAnimation(testAnimation2);
      testElement.attributeMap.get('test').animations.should.have.length(2);
    });
    it('should add an animation with the correct parameters', function() {
      var testAnimation = { attribute: 'test', start: 0, duration: 60, destination: 20, ease: testEasingFunction, delay: 30, loop: true };
      testElement.addAnimation(testAnimation);
      testElement.attributeMap.get('test').animations[0].should.eql({currentIteration: -30, startValue: -20, changeInValue: 20, totalIterations: 60, easingFunction: testEasingFunction, loop: true, delay: 30 });
    });
  });
});