jest.dontMock('../element');

describe('element', function() {

  it('initalizes with an attributeMap', function() {
    var AnimatedElement = require('../element'),
        testElement = new AnimatedElement();

    expect(testElement.attributeMap).not.toBeNull();
  });

});