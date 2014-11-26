jest.dontMock('../animated_element');

describe('animated_element', function() {

  it('initalizes with a new map', function() {
    var AnimatedElement = require('../animated_element'),
        testElement = new AnimatedElement();

    expect(testElement.attributeMap).not.toBeNull();
  });

});