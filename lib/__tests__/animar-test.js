jest.dontMock('../animar');
jest.dontMock('../constants');

var Animar, Constants, animar;

beforeEach( function() {
  Animar = require('../animar');
  Constants = require('../constants');
  animar = new Animar();
});

describe('constructor', function() {

  it('creates an elementMap property as an empty Map', function() {
    expect(animar.elementMap).not.toBeNull();
  });

  it('creates a ticking property that defaults to false', function() {
    expect(animar.ticking).not.toBeNull();
    expect(animar.ticking).toEqual(false);
  });

});

describe('createAttribute()', function() {

  it('should take in an input map and set a new animation object to the given attribute key', function() {
    var exampleStart = 32,
      exampleAttribute = 'translateX',
      exampleAttributeMap = new Map(),
      exampleAnimationObject = { start: exampleStart, attribute: exampleAttribute };

    var output = animar.createAttribute(exampleAttributeMap, exampleAnimationObject);
    expect(output.get(exampleAttribute).model).toEqual(exampleStart);
    expect(output.get(exampleAttribute).animations).toEqual([]);
  });

});

describe('addAnimationToElement()', function() {

  var testDestination, testStart, testAttribute, testDelay, testDuration, testEasingFunction, testLoop, testWait;
  var testArgs, testAttributeMap;
  var checkOutput;

  beforeEach(function() {
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

    checkOutput = function(output) {
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

  it('should add an animation to an existing attribute', function() {
    testAttributeMap.set(testAttribute, { model: 0, animations: [{}]}); // animations array has one 'element' already

    var output = animar.addAnimationToElement(testAttributeMap, testArgs);
    checkOutput(output);
    checkOutput(testAttributeMap.get(testAttribute).animations[1]);
    expect(testAttributeMap.get(testAttribute).model).toEqual(testDestination);
  });

  it('should create a new attribute object if one doesn\'t already exist', function() {
    var output = animar.addAnimationToElement(testAttributeMap, testArgs);
    checkOutput(output);
    checkOutput(testAttributeMap.get(testAttribute).animations[0]);
    expect(testAttributeMap.get(testAttribute).model).toEqual(testDestination);
  });

});

describe('addAnimationToMap()', function() {
  var testElement1, testArgs1;

  beforeEach(function() {
    animar.addAnimationToElement = jest.genMockFunction();

    testElement1 = document.createElement('div');
    testArgs1 = {element: testElement1, otherStuff: 'blah'};
  });

  it('add a new element and add an animation to that element', function() {
    animar.addAnimationToMap(testArgs1);
    expect(animar.elementMap.get(testElement1)).not.toBeNull();
    expect(animar.addAnimationToElement.mock.calls.length).toEqual(1);
  });

  it('should merge in an animation to an element if it already exists', function() {
    animar.addAnimationToMap(testArgs1);
    animar.elementMap.set = jest.genMockFn();
    animar.addAnimationToMap({element: testElement1, other: 'blah blah blah'});
    expect(animar.elementMap.set.mock.calls.length).toEqual(0);
  });
});

describe('addAnimation()', function() {

  var testElement, defaultOptions, linearEasingFunction, helperStartValue;

  beforeEach(function() {
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

  it('should request a tick when finished', function() {
    animar.addAnimation(testElement, 'translateX', 10, defaultOptions);
    expect(animar.requestTick.mock.calls.length).toEqual(1);
  });

  it('should add an animation given an easing function', function() {
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

  it('should add an animation given the string name of an easing function', function() {
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

  it('should correctly set default values to missing options object', function() {
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

describe('add()', function() {

  var initialChainOptions;

  beforeEach(function() {
    animar._add = jest.genMockFn().mockReturnValue(13);
    initialChainOptions = {delay: 0, currentDuration: 0, totalDuration: 0, animationList: []};
  });

  it('should call the private add function with it\'s parameters plus the initial chain options', function() {
    var testElement = document.createElement('div'),
      testAttributes = ['translateX'],
      testOptions = {};

    var output = animar.add(testElement, testAttributes, testOptions);

    expect(output).toEqual(13);
    expect(animar._add.mock.calls.length).toEqual(1);
    expect(animar._add.mock.calls[0][0]).toEqual(testElement);
    expect(animar._add.mock.calls[0][1]).toEqual(testAttributes);
    expect(animar._add.mock.calls[0][2]).toEqual(testOptions);
    expect(animar._add.mock.calls[0][3]).toEqual(initialChainOptions);
  });

});

describe('_add()', function() {

  beforeEach(function() {
    animar.addAnimation = jest.genMockFn();
  });

});

describe('applyStyle()', function() {
  var testElement;

  beforeEach(function() {
    testElement = document.createElement('div');
  });

  it('should apply a transform style', function() {
    animar.applyStyle(testElement, 'transform', 'translateX(0)');
    expect(require('../helper').setTransform).toBeCalled();
  });

  it('should apply an opacity', function() {
    animar.applyStyle(testElement, 'opacity', '0.5');
    expect(testElement.style.opacity).toEqual('0.5');
  });

  it('should apply a perspective', function() {
    animar.applyStyle(testElement, 'perspective', '0');
    expect(testElement.style.perspective).toEqual('0');
    expect(testElement.style.webkitPerspective).toEqual('0');
  });
});

describe('renderDOM()', function() {

  var attributeMap, testElement;

  beforeEach(function() {
    animar.calculateAnimationValue = jest.genMockFn().mockReturnValue(-5);
    animar.applyStyle = jest.genMockFn();

    attributeMap = new Map();
    testElement = document.createElement('div');
  });

  it('should calculate the target value and apply the style to the attribute', function() {
    attributeMap.set('testAttribute1', {
      model: 5,
      animations: [{}]
    });
    animar.elementMap.set(testElement, attributeMap);
    animar.renderDOM();

    expect(animar.calculateAnimationValue).toBeCalled();
    expect(animar.applyStyle).toBeCalledWith(testElement, 'testAttribute1', 0);
  });

  it('should correctly construct a transform string', function() {
    attributeMap.set('translateX', { model: 5, animations: [{}] });
    attributeMap.set('translateY', { model: 5, animations: [{}] });
    attributeMap.set('scaleX', { model: 5, animations: [{}] });
    attributeMap.set('scaleY', { model: 5, animations: [{}] });
    attributeMap.set('rotate', { model: 5, animations: [{}] });
    animar.elementMap.set(testElement, attributeMap);
    animar.renderDOM();
    expect(animar.applyStyle).toBeCalledWith(testElement, 'transform', 'translateX(0px) translateY(0px) scaleX(0) ' +
      'scaleY(0) rotate(0deg) translateZ(0)');
  });

  it('should not apply a style when an element has no animations in progress', function() {
    attributeMap.set('testAttribute1', {
      model: 5,
      animations: []
    });
    animar.elementMap.set(testElement, attributeMap);
    animar.renderDOM();
    expect(animar.calculateAnimationValue).not.toBeCalled();
    expect(animar.applyStyle).not.toBeCalled();
  });

});