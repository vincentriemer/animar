var should = require("should"),
    Element = require('../src/scripts/Animator/element');

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
      testElement.createAttribute('test', 0);
      testElement.attributeMap.get('test').model.should.be.exactly(0);
      testElement.attributeMap.get('test').animations.should.have.length(0);
    });
  });

  describe('#addAnimation()', function() {
    it('should create a new attribute if one doesn\'t exist', function() {
      var testAnimation = { attribute: 'test', start: 0, duration: 0, end: 0, easingFunction: function(){} };
      testElement.addAnimation(testAnimation);
      should.exist(testElement.attributeMap.get('test'));
    });
    it('should add a new animation to an attribute if it already exists', function() {
      var testAnimation1 = { attribute: 'test', start: 0, duration: 0, end: 0, easingFunction: function(){} };
      var testAnimation2 = { attribute: 'test', start: 1, duration: 0, end: 0, easingFunction: function(){} };
      testElement.addAnimation(testAnimation1);
      testElement.addAnimation(testAnimation2);
      testElement.attributeMap.get('test').animations.should.have.length(2);
    });
  });
});