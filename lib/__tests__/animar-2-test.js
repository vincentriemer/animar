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