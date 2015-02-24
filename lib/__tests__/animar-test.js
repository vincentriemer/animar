'use strict';
jest.dontMock('../animar');

let Animar, animar;

beforeEach( () => {
  Animar = require('../animar');
  animar = new Animar();
});

describe('constructor', () => {

  it('creates an elementMap property as an empty Map', () => {
    expect(animar.elementMap).not.toBeNull();
  });

  it('creates a ticking property that defaults to false', () => {
    expect(animar.ticking).not.toBeNull();
    expect(animar.ticking).toEqual(false);
  });

});

describe('createAttribute()', () => {

  it('should take in an input map and set a new animation object to the given attribute key', () => {
    const exampleStart = 32,
      exampleAttribute = 'translateX',
      exampleAttributeMap = new Map(),
      exampleAnimationObject = { start: exampleStart, attribute: exampleAttribute };

    const output = animar.createAttribute(exampleAttributeMap, exampleAnimationObject);
    expect(output.get(exampleAttribute).model).toEqual(exampleStart);
    expect(output.get(exampleAttribute).animations).toEqual([]);
  });

});

describe('addAnimationToElement()', () => {

  let testDestination, testStart, testAttribute, testDelay, testDuration, testEasingFunction, testLoop, testWait;
  let testArgs, testAttributeMap;
  let checkOutput;

  beforeEach(() => {
    testDestination = 200;
    testDelay = 10;
    testAttribute = 'translateX';
    testDuration = 30;
    testEasingFunction = function() {};
    testLoop = false;
    testWait = 20;
    testStart = 0;

    testArgs = {
      start: testStart,
      attribute: testAttribute,
      destination: testDestination,
      delay: testDelay,
      duration: testDuration,
      ease: testEasingFunction,
      loop: testLoop,
      wait: testWait
    };

    testAttributeMap = new Map();

    checkOutput = output => {
      expect(output.currentIteration).toEqual(0 - testDelay);
      expect(output.startValue).toEqual(testStart - testDestination);
      expect(output.changeInValue).toEqual(0 - (testStart - testDestination));
      expect(output.totalIterations).toEqual(testDuration);
      expect(output.easingFunction).toEqual(testEasingFunction);
      expect(output.loop).toEqual(testLoop);
      expect(output.delay).toEqual(testDelay);
      expect(output.wait).toEqual(testWait);
    };

  });

  it('should add an animation to an existing attribute', () => {
    testAttributeMap.set(testAttribute, { model: 0, animations: [{}]}); // animations array has one 'element' already

    const output = animar.addAnimationToElement(testAttributeMap, testArgs);
    checkOutput(output);
    checkOutput(testAttributeMap.get(testAttribute).animations[1]);
    expect(testAttributeMap.get(testAttribute).model).toEqual(testDestination);
  });

  it('should create a new attribute object if one doesn\'t already exist', () => {
    const output = animar.addAnimationToElement(testAttributeMap, testArgs);
    checkOutput(output);
    checkOutput(testAttributeMap.get(testAttribute).animations[0]);
    expect(testAttributeMap.get(testAttribute).model).toEqual(testDestination);
  });

});

describe('addAnimationToMap()', () => {
  let testElement1, testArgs1;

  beforeEach(() => {
    animar.addAnimationToElement = jest.genMockFunction();

    testElement1 = document.createElement('div');
    testArgs1 = {element: testElement1, otherStuff: 'blah'};
  });

  it('add a new element and add an animation to that element', () => {
    animar.addAnimationToMap(testArgs1);
    expect(animar.elementMap.get(testElement1)).not.toBeNull();
    expect(animar.addAnimationToElement.mock.calls.length).toEqual(1);
  });

  it('should merge in an animation to an element if it already exists', () => {
    animar.addAnimationToMap(testArgs1);
    animar.elementMap.set = jest.genMockFn();
    animar.addAnimationToMap({element: testElement1, other: 'blah blah blah'});
    expect(animar.elementMap.set.mock.calls.length).toEqual(0);
  });
});

describe('addAnimation()', () => {

  let testElement, defaultOptions, linearEasingFunction, helperStartValue;

  beforeEach(() => {
    animar.addAnimationToMap = jest.genMockFn();
    animar.requestTick = jest.genMockFn();

    // BE SURE TO TEST ONLY USING LINEAR EASING FUNCTION
    linearEasingFunction = function() { return 69; };
    helperStartValue = 32;

    require('../ease').linear.mockReturnValue(linearEasingFunction);
    require('../helper').getStartValue.mockReturnValue(helperStartValue);

    testElement = document.createElement('div');

    defaultOptions = { start: 0, duration: 60, easing: 'linear', delay: 0, wait: 0, loop: false }
  });

  it('should request a tick when finished', () => {
    animar.addAnimation(testElement, 'translateX', 10, defaultOptions);
    expect(animar.requestTick.mock.calls.length).toEqual(1);
  });

  it('should add an animation given an easing function', () => {
    defaultOptions.easing = function () {
      return 0;
    };

    animar.addAnimation(testElement, 'translateX', 10, defaultOptions);

    expect(animar.addAnimationToMap.mock.calls[0][0]).toEqual({
      element: testElement,
      attribute: 'translateX',
      start: defaultOptions.start,
      destination: 10,
      duration: 60,
      ease: defaultOptions.easing,
      delay: 0,
      loop: false,
      wait: 0
    });
  });

  it('should add an animation given the string name of an easing function', () => {
    animar.addAnimation(testElement, 'translateX', 10, defaultOptions);
    // default options gets uses the 'linear' name so confirm the mocked function is correctly returned
    expect(animar.addAnimationToMap.mock.calls[0][0]).toEqual({
      element: testElement,
      attribute: 'translateX',
      start: defaultOptions.start,
      destination: 10,
      duration: defaultOptions.duration,
      ease: linearEasingFunction,
      delay: defaultOptions.delay,
      loop: defaultOptions.loop,
      wait: defaultOptions.wait
    });
  });

  it('should correctly set default values to missing options object', () => {
    animar.addAnimation(testElement, 'translateX', 10);
    expect(animar.addAnimationToMap.mock.calls[0][0]).toEqual({
      element: testElement,
      attribute: 'translateX',
      start: helperStartValue,
      destination: 10,
      duration: 60,
      ease: linearEasingFunction,
      delay: 0,
      loop: false,
      wait: 0
    });
  });

});

describe('add()', () => {

  let initialChainOptions;

  beforeEach(() => {
    animar._add = jest.genMockFn().mockReturnValue(13);
    initialChainOptions = {delay: 0, currentDuration: 0, totalDuration: 0, animationList: []};
  });

  it('should call the private add function with it\'s parameters plus the initial chain options', () => {
    const testElement = document.createElement('div'),
      testAttributes = ['translateX'],
      testOptions = {};

    const output = animar.add(testElement, testAttributes, testOptions);

    expect(output).toEqual(13);
    expect(animar._add.mock.calls.length).toEqual(1);
    expect(animar._add.mock.calls[0][0]).toEqual(testElement);
    expect(animar._add.mock.calls[0][1]).toEqual(testAttributes);
    expect(animar._add.mock.calls[0][2]).toEqual(testOptions);
    expect(animar._add.mock.calls[0][3]).toEqual(initialChainOptions);
  });

});

describe('_add()', () => {

  beforeEach(() => {
    animar.addAnimation = jest.genMockFn();
  });

});

describe('calculateAnimationValue()', () => {

  beforeEach(() => {
    
  });

});

describe('applyStyle()', () => {

  let testElement;

  beforeEach(() => {
    testElement = document.createElement('div');
  });

  it('should apply a transform style', () => {
    animar.applyStyle(testElement, 'transform', 'translateX(0)');
    expect(require('../helper').setTransform).toBeCalled();
  });

  it('should apply an opacity', () => {
    animar.applyStyle(testElement, 'opacity', '0.5');
    expect(testElement.style.opacity).toEqual('0.5');
  });

  it('should apply a perspective', () => {
    animar.applyStyle(testElement, 'perspective', '0');
    expect(testElement.style.perspective).toEqual('0');
    expect(testElement.style.webkitPerspective).toEqual('0');
  });
});

describe('renderDOM()', () => {

  beforeEach(() => {
    animar.calculateAnimationValue = jest.genMockFn();
    animar.applyStyle = jest.genMockFn();
  });

});

describe('stepFrame()', () => {

  beforeEach(() => {

  });

});

describe('update()', () => {

  beforeEach(() => {
    animar.renderDOM = jest.genMockFn();
    animar.stepFrame = jest.genMockFn();
    animar.requestTick = jest.genMockFn();
  });

  it('should render the animations and step forward a frame', () => {
    animar.renderDOM.mockReturnValue(false);
    animar.update();
    expect(animar.renderDOM).toBeCalled();
    expect(animar.stepFrame).toBeCalled();
    expect(animar.ticking).toEqual(false);
    expect(animar.requestTick).not.toBeCalled();
  });

  it('should continue rendering if there are animations that haven\'t finished yet', () => {
    animar.renderDOM.mockReturnValue(true);
    animar.update();
    expect(animar.requestTick).toBeCalled();
  });

});

describe('requestTick()', () => {

  let ram;

  beforeEach(() => {
    ram = window.requestAnimationFrame;
    window.requestAnimationFrame = jest.genMockFn();
  });

  afterEach(() => {
    window.requestAnimationFrame = ram;
  });

  it('should do nothing if animar is already ticking', () => {
    animar.ticking = true;
    animar.requestTick();
    expect(window.requestAnimationFrame).not.toBeCalled();
  });

  it('should make a requestAnimationFrame call to the update function and set ticking to true', () => {
    animar.ticking = false;
    animar.requestTick();
    expect(window.requestAnimationFrame).toBeCalled();
    expect(animar.ticking).toEqual(true);
  });

});