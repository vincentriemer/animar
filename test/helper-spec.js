var should = require('chai').should(),
    sinon = require('sinon'),
    Helper = require('../lib/helper');

// EXPECTED RESULT = translateX(10px) translateY(10px) scaleX(5) scaleY(5) rotate(45deg)

describe('Helper', function() {
  var windowStub, elementMock;
  beforeEach(function() {
    windowStub = sinon.stub(window, 'getComputedStyle').returns({ getPropertyValue: function(arg) { 
        if (arg === 'transform') {
          return 'matrix(3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10)'
        } else if (arg === 'opacity') {
          return '0.5';
        }
    }});
    elementMock = { style: { wekbkitTransform: "", MozTransform: "", msTransform: "", OTransform: "", transform: "" } }
  });

  afterEach(function() {
    windowStub.restore();
  })

  describe('#setTransform()', function() {
    it('should set all the proper attributes on the element\'s style', function() {
      var transformString = "test";
      elementMock = Helper.setTransform(elementMock, transformString);
      elementMock.style.webkitTransform.should.be.eql(transformString);
      elementMock.style.MozTransform.should.be.eql(transformString);
      elementMock.style.msTransform.should.be.eql(transformString);
      elementMock.style.OTransform.should.be.eql(transformString);
      elementMock.style.transform.should.be.eql(transformString);
    });
  });

  describe('#getTransformMatrix', function() {
    it('should correctly parse a given matrix string', function() {
      var result = Helper.getTransformMatrix(elementMock);
      windowStub.called.should.be.true;
      result.should.eql([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    });
    it('should return a normalized matrix if the object has no transforms applied to it', function() {
      windowStub.restore();
      windowStub = sinon.stub(window, 'getComputedStyle').returns({ getPropertyValue: function(arg) { 
        if (arg === 'transform') { return 'none'; }
      }});
      var result = Helper.getTransformMatrix(elementMock);
      result.should.eql([1, 0, 0, 1, 0, 0]);
    });
  });

  describe('#getTranslateX', function() {
    it('should get the transform matrix and return the correct value', function() {
      var transformStub = sinon.stub(Helper, 'getTransformMatrix').returns([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
      var result = Helper.getTranslateX(elementMock);
      transformStub.called.should.be.true;
      result.should.eql(10);
      transformStub.restore();
    });
  });

  describe('#getTranslateY', function() {
    it('should get the transform matrix and return the correct value', function() {
      var transformStub = sinon.stub(Helper, 'getTransformMatrix').returns([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
      var result = Helper.getTranslateY(elementMock);
      transformStub.called.should.be.true;
      result.should.eql(10);
      transformStub.restore();
    });
  });

  describe('#scaleX', function() {
    it('should get the transform matrix and return the correct value', function() {
      var transformStub = sinon.stub(Helper, 'getTransformMatrix').returns([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
      var result = Helper.getScaleX(elementMock);
      transformStub.called.should.be.true;
      result.should.eql(5);
      transformStub.restore();
    });
  });

  describe('#scaleY', function() {
    it('should get the transform matrix and return the correct value', function() {
      var transformStub = sinon.stub(Helper, 'getTransformMatrix').returns([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
      var result = Helper.getScaleY(elementMock);
      transformStub.called.should.be.true;
      result.should.eql(5);
      transformStub.restore();
    });
  });

  describe('#getRotation', function() {
    it('should get the transform matrix and return the correct value', function() {
      var transformStub = sinon.stub(Helper, 'getTransformMatrix').returns([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
      var result = Helper.getRotation(elementMock);
      transformStub.called.should.be.true;
      result.should.eql(45);
      transformStub.restore();
    });
  });

  describe('#getOpacity', function() {
    it('should get the opacity value from the element\'s style', function() {
      var result = Helper.getOpacity(elementMock);
      result.should.eql(0.5);
    });
  });

  describe('#getStartValue()', function() {
    it('should call its respective helper functions', function() {
      var testArgs = [{}, 'translateX'];
      var translateXStub = sinon.stub(Helper, 'getTranslateX'),
          translateYStub = sinon.stub(Helper, 'getTranslateY'),
          scaleXStub = sinon.stub(Helper, 'getScaleX'),
          scaleYStub = sinon.stub(Helper, 'getScaleY'),
          rotationStub = sinon.stub(Helper, 'getRotation'),
          opacityStub = sinon.stub(Helper, 'getOpacity');
      Helper.getStartValue(testArgs);
      translateXStub.called.should.be.true;

      testArgs[1] = 'translateY';
      Helper.getStartValue(testArgs);
      translateYStub.called.should.be.true;

      testArgs[1] = 'scaleX';
      Helper.getStartValue(testArgs);
      scaleXStub.called.should.be.true;

      testArgs[1] = 'scaleY';
      Helper.getStartValue(testArgs);
      scaleYStub.called.should.be.true;

      testArgs[1] = 'rotate';
      Helper.getStartValue(testArgs);
      rotationStub.called.should.be.true;

      testArgs[1] = 'opacity';
      Helper.getStartValue(testArgs);
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