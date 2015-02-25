'use strict';
jest.dontMock('../helper');

// EXPECTED TRANSFORM RESULT = translateX(10px) translateY(10px) scaleX(5) scaleY(5) rotate(45deg)

var Helper, mockElement;

beforeEach(function() {
  Helper = require('../helper');

  window.getComputedStyle = jest.genMockFn().mockReturnValue({getPropertyValue: function(arg) {
    if (arg === 'transform') {
      return 'matrix(3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10)'
    } else if (arg === 'opacity') {
      return '0.5';
    }
  }});

  mockElement = { style: { wekbkitTransform: "", MozTransform: "", msTransform: "", OTransform: "", transform: "" } };
});

describe('setTransform()', function() {

  it('should set all the proper attributes on the element\'s style', function() {
    var transformString = "test";
    mockElement = Helper.setTransform(mockElement, transformString);
    expect(mockElement.style.webkitTransform).toEqual(transformString);
    expect(mockElement.style.MozTransform).toEqual(transformString);
    expect(mockElement.style.msTransform).toEqual(transformString);
    expect(mockElement.style.OTransform).toEqual(transformString);
    expect(mockElement.style.transform).toEqual(transformString);
  });

});

describe('getTransformMatrix', function() {

  it('should correctly parse a given matrix string', function() {
    var result = Helper.getTransformMatrix(mockElement);
    expect(window.getComputedStyle).toBeCalled();
    expect(result).toEqual([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
  });

  it('should return a normalized matrix if the object has no transforms applied to it', function() {
    window.getComputedStyle = jest.genMockFn().mockReturnValue({ getPropertyValue: function(arg) {
      if (arg === 'transform') { return 'none'; }
    }});

    var result = Helper.getTransformMatrix(mockElement);
    expect(result).toEqual([1, 0, 0, 1, 0, 0]);
  });

});

describe('getTranslateX', function() {
  it('should get the transform matrix and return the correct value', function() {
    Helper.getTransformMatrix = jest.genMockFn().
      mockReturnValue([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);

    var result = Helper.getTranslateX(mockElement);
    expect(Helper.getTransformMatrix).toBeCalled();
    expect(result).toEqual(10);
  });
});

describe('getTranslateY', function() {
  it('should get the transform matrix and return the correct value', function() {
    Helper.getTransformMatrix = jest.genMockFn().
      mockReturnValue([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    var result = Helper.getTranslateY(mockElement);
    expect(Helper.getTransformMatrix).toBeCalled();
    expect(result).toEqual(10);
  });
});

describe('getScaleX', function() {
  it('should get the transform matrix and return the correct value', function() {
    Helper.getTransformMatrix = jest.genMockFn().
      mockReturnValue([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    var result = Helper.getScaleX(mockElement);
    expect(Helper.getTransformMatrix).toBeCalled();
    expect(result).toEqual(5);
  });
});

describe('getScaleY', function() {
  it('should get the transform matrix and return the correct value', function() {
    Helper.getTransformMatrix = jest.genMockFn().
      mockReturnValue([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    var result = Helper.getScaleY(mockElement);
    expect(Helper.getTransformMatrix).toBeCalled();
    expect(result).toEqual(5);
  });
});

describe('getRotation', function() {
  it('should get the transform matrix and return the correct value', function() {
    Helper.getTransformMatrix = jest.genMockFn().
      mockReturnValue([3.5355339059327378, 3.5355339059327373, -3.5355339059327373, 3.5355339059327378, 10, 10]);
    var result = Helper.getRotation(mockElement);
    expect(Helper.getTransformMatrix).toBeCalled();
    expect(result).toEqual(45);
  });
});

describe('getOpacity', function() {
  it('should get the opacity value from the element\'s style', function() {
    var result = Helper.getOpacity(mockElement);
    expect(result).toEqual(0.5);
  });
});

describe('#getStartValue()', function() {
  it('should call its respective helper functions', function() {
    var testArgs = [{}, 'translateX'];
    Helper.getTranslateX = jest.genMockFn();
    Helper.getTranslateY = jest.genMockFn();
    Helper.getScaleX = jest.genMockFn();
    Helper.getScaleY = jest.genMockFn();
    Helper.getRotation = jest.genMockFn();
    Helper.getOpacity = jest.genMockFn();

    Helper.getStartValue(testArgs);
    expect(Helper.getTranslateX).toBeCalled();

    testArgs[1] = 'translateY';
    Helper.getStartValue(testArgs);
    expect(Helper.getTranslateY).toBeCalled();

    testArgs[1] = 'scaleX';
    Helper.getStartValue(testArgs);
    expect(Helper.getScaleX).toBeCalled();

    testArgs[1] = 'scaleY';
    Helper.getStartValue(testArgs);
    expect(Helper.getScaleY).toBeCalled();

    testArgs[1] = 'rotate';
    Helper.getStartValue(testArgs);
    expect(Helper.getRotation).toBeCalled();

    testArgs[1] = 'opacity';
    Helper.getStartValue(testArgs);
    expect(Helper.getOpacity).toBeCalled();
  });
});