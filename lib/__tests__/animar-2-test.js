jest.dontMock('../animar');
jest.dontMock('../constants');

var Animar, animar, testElement;

beforeEach( function() {
  Animar = require('../animar');
  animar = new Animar();
  testElement = document.createElement('div');
});

describe('_stepFrame()', function() {

  it('should add 1 to every current iteration property of every element\'s attribute\'s animation', function() {
    var attributeMap = new Map();
    attributeMap.set('testAttribute1', { animations: [
      { delay: 0, currentIteration: 0, totalIterations: 10, loop: false, wait: 0 }
    ]});
    animar.elementMap = new Map();
    animar.elementMap.set(testElement, attributeMap);
    animar._stepFrame();
    expect(animar.elementMap.get(testElement).get('testAttribute1').
      animations[0].currentIteration).toEqual(1);
  });

  it('should remove an animation if it has ended', function() {
    var attributeMap = new Map();
    attributeMap.set('testAttribute1', { animations: [
      { delay: 0, currentIteration: 10, totalIterations: 10, loop: false, wait: 0 }
    ]});
    animar.elementMap.set(testElement, attributeMap);
    animar._stepFrame();
    expect(animar.elementMap.get(testElement).get('testAttribute1').animations.length).toEqual(0);
  });

  it('should set the currentIteration to zero minus the delay value if the animation has ended and the loop ' +
      'property is true', function() {
    var attributeMap = new Map();
    attributeMap.set('testAttribute1', { animations: [
      { delay: 10, currentIteration: 10, totalIterations: 10, loop: true, wait: 0 }
    ]});
    animar.elementMap = new Map();
    animar.elementMap.set(testElement, attributeMap);
    animar._stepFrame();
    expect(animar.elementMap.get(testElement).get('testAttribute1').animations[0].currentIteration).
      toEqual(-10);
  });

  it('should not remove the animation if there is waiting remaining', function() {
    var attributeMap = new Map();
    attributeMap.set('testAttribute1', { animations: [
      { delay: 0, currentIteration: 10, totalIterations: 10, loop: false, wait: 1 }
    ]});
    animar.elementMap.set(testElement, attributeMap);
    animar._stepFrame();
    expect(animar.elementMap.get(testElement).get('testAttribute1').animations.length).toEqual(1);
  });
});

describe('update()', function() {

  beforeEach(function() {
    animar._renderDOM = jest.genMockFn();
    animar._stepFrame = jest.genMockFn();
    animar._requestTick = jest.genMockFn();
  });

  it('should render the animations and step forward a frame', function() {
    animar._renderDOM.mockReturnValue(false);
    animar._update();
    expect(animar._renderDOM).toBeCalled();
    expect(animar._stepFrame).toBeCalled();
    expect(animar.ticking).toEqual(false);
    expect(animar._requestTick).not.toBeCalled();
  });

  it('should continue rendering if there are animations that haven\'t finished yet', function() {
    animar._renderDOM.mockReturnValue(true);
    animar._update();
    expect(animar._requestTick).toBeCalled();
  });

});

describe('_requestTick()', function() {
  var ram;

  beforeEach(function() {
    ram = window.requestAnimationFrame;
    window.requestAnimationFrame = jest.genMockFn();
  });

  afterEach(function() {
    window.requestAnimationFrame = ram;
  });

  it('should do nothing if animar is already ticking', function() {
    animar.ticking = true;
    animar._requestTick();
    expect(window.requestAnimationFrame).not.toBeCalled();
  });

  it('should make a requestAnimationFrame call to the _update function and set ticking to true', function() {
    animar.ticking = false;
    animar._requestTick();
    expect(window.requestAnimationFrame).toBeCalled();
    expect(animar.ticking).toEqual(true);
  });

});

describe('_calculateAnimationValue()', function() {

  it('should use the given easing function to add to the animation value', function() {
    expect(animar._calculateAnimationValue([{currentIteration: 0, easingFunction: function() {return 5;} }])).
      toEqual(5);
  });

  it('should add multiple animations together', function() {
    var mockEasingFunction = function() {return 5;};
    expect(animar._calculateAnimationValue([{currentIteration: 0, easingFunction: mockEasingFunction},
      {currentIteration: 0, easingFunction: mockEasingFunction}])).toEqual(10);
  });

  it('should consider an animation value zero if it\'s current iteration is less than zero', function() {
    expect(animar._calculateAnimationValue([{currentIteration: -5, easingFunction: function() {return 5;} }])).
      toEqual(5);
  });

  it('should return the value of totalIterations if the currentIteration is greater than it', function() {
    var easeSpy = jest.genMockFn();
    animar._calculateAnimationValue([{currentIteration: 25, totalIterations: 20, changeInValue: 0, startValue: 0, easingFunction: easeSpy}]);
    expect(easeSpy).toBeCalledWith(20,0,0,20);
  });

});

describe('_add()', function() {

  var andMockReturn = 1,
    thenMockReturn = 2,
    loopMockReturn = 3;

  var defaultChainOptions;

  beforeEach(function() {
    animar._addAnimation = jest.genMockFn().mockReturnValue('animation result');
    animar._andChainFunction = jest.genMockFn().mockReturnValue(andMockReturn);
    animar._thenChainFunction = jest.genMockFn().mockReturnValue(thenMockReturn);
    animar._loopChainFunction = jest.genMockFn().mockReturnValue(loopMockReturn);

    defaultChainOptions = { delay: 0, currentDuration: 0, totalDuration: 0, animationList: [] };
  });

  it('should correctly handle being given multiple attributes', function() {
    animar._add(testElement, {
      translateX: 10,
      translateY: 50
    }, {}, defaultChainOptions);

    expect(animar._addAnimation.mock.calls.length).toEqual(2);
  });

  it('should handle an attributeValue being a number', function() {
    animar._add(testElement, {
      translateX: 15
    }, {}, defaultChainOptions);

    expect(animar._addAnimation.mock.calls[0][0]).toEqual(testElement);
    expect(animar._addAnimation.mock.calls[0][1]).toEqual('translateX');
    expect(animar._addAnimation.mock.calls[0][2]).toEqual(15);
    expect(animar._addAnimation.mock.calls[0][3].start).toBeUndefined();
  });

  it('should handle an attributeValue being an array of length 2', function() {
    animar._add(testElement, {
      translateX: [12, 24]
    }, {}, defaultChainOptions);

    expect(animar._addAnimation.mock.calls[0][0]).toEqual(testElement);
    expect(animar._addAnimation.mock.calls[0][1]).toEqual('translateX');
    expect(animar._addAnimation.mock.calls[0][2]).toEqual(24);
    expect(animar._addAnimation.mock.calls[0][3].start).toEqual(12);
  });

  it('should properly pass through options', function() {
    var testEasingFunction = function() { return 42; };

    animar._add(testElement, {
      translateX: [12, 24]
    }, {
      duration: 60,
      easing: testEasingFunction,
      delay: 25,
      loop: true
    }, defaultChainOptions);

    expect(animar._addAnimation.mock.calls[0][0]).toEqual(testElement);
    expect(animar._addAnimation.mock.calls[0][1]).toEqual('translateX');
    expect(animar._addAnimation.mock.calls[0][2]).toEqual(24);
    expect(animar._addAnimation.mock.calls[0][3]).toEqual({
      start: 12,
      duration: 60,
      easing: testEasingFunction,
      delay: 25,
      loop: true
    });
  });

  it('should correctly push the result of _addAnimation to the chainOptions object', function() {
    animar._add(testElement, {
      translateX: 23
    }, {}, defaultChainOptions);
    expect(animar._andChainFunction.mock.calls[0][0].animationList[0]).toEqual('animation result');
  });

  it('should correctly update the currentDuration of the chainOptions object', function() {
    animar._add(testElement, {
      translateX: 23
    }, {
      duration: 60,
      delay: 20
    }, defaultChainOptions);
    expect(animar._andChainFunction.mock.calls[0][0].currentDuration).toEqual(80);
  });

  it('should return an object with all the relevant chain functions', function() {
    var result = animar._add(testElement, {
      translateX: 23
    }, {}, defaultChainOptions);
    expect(result).toEqual({
      and: andMockReturn,
      then: thenMockReturn,
      loop: loopMockReturn
    });
  });

  it('should work fine when given an undefined options parameter', function() {
    animar._add(testElement, {
      translateX: [12, 24]
    }, undefined, defaultChainOptions);

    expect(animar._addAnimation.mock.calls[0][0]).toEqual(testElement);
    expect(animar._addAnimation.mock.calls[0][1]).toEqual('translateX');
    expect(animar._addAnimation.mock.calls[0][2]).toEqual(24);
    expect(animar._addAnimation.mock.calls[0][3].start).toEqual(12);
  });

});