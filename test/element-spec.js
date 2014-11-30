var should = require("should"),
    sinon = require('sinon'),
    Element = require('../lib_js/element'),
    Helper = require('../lib_js/helper');

describe('Element', function() {
  var testElement;

  beforeEach(function() {
    testElement = new Element();
  });

  describe('new Element()', function() {
    it('should initialize with an empty attribute map', function() {
      testElement.should.have.properties('attributeMap');
    });
  });

  describe('#createAttribute()', function() {
    it('should add a new attribute object to the attributeMap', function() {
      testElement.createAttribute({ attribute: 'test', startValue: 0});
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

  describe('#getStartValue()', function() {
    it('should call its respective helper functions', function() {
      var testArgs = { attribute: 'translateX', element: {}};
      var translateXStub = sinon.stub(Helper, 'getTranslateX'),
          translateYStub = sinon.stub(Helper, 'getTranslateY'),
          scaleXStub = sinon.stub(Helper, 'getScaleX'),
          scaleYStub = sinon.stub(Helper, 'getScaleY'),
          rotationStub = sinon.stub(Helper, 'getRotation'),
          opacityStub = sinon.stub(Helper, 'getOpacity');
      testElement.getStartValue(testArgs);
      translateXStub.called.should.be.true;

      testArgs.attribute = 'translateY';
      testElement.getStartValue(testArgs);
      translateYStub.called.should.be.true;

      testArgs.attribute = 'scaleX';
      testElement.getStartValue(testArgs);
      scaleXStub.called.should.be.true;

      testArgs.attribute = 'scaleY';
      testElement.getStartValue(testArgs);
      scaleYStub.called.should.be.true;

      testArgs.attribute = 'rotate';
      testElement.getStartValue(testArgs);
      rotationStub.called.should.be.true;

      testArgs.attribute = 'opacity';
      testElement.getStartValue(testArgs);
      opacityStub.called.should.be.true;

      translateXStub.restore();
      translateYStub.restore();
      scaleXStub.restore();
      scaleYStub.restore();
      rotationStub.restore();
      opacityStub.restore();
    });
  });
});