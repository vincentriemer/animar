var should = require('chai').should(),
  sinon = require('sinon'),
  jsdom = require('jsdom'),
  EasingFactory = require('../lib/ease'),
  Animar = require('../lib/animar'),
  Helper = require('../lib/helper');

describe('Animar', function() {

  var animar, testElement;

  document = jsdom.jsdom('<html><body><div id="testLocation"></div></body></html>');
  window = document.parentWindow;

  beforeEach(function() {
    animar = new Animar(); // create a new Animar object

    // setup test element & parameter
    testElement = document.createElement('div');
    document.getElementById('testLocation').appendChild(testElement);
    testParam1 = {
        element: testElement,
        attribute: 'test',
        destination: 10,
        duration: 10,
        ease: function(){}
      };
    testParam2 = {
      element: testElement,
      attribute: 'test',
      destination: 15,
      duration: 10,
      ease: function(){}
    };
  });

  afterEach(function() {
    testElement.parentElement.removeChild(testElement);
  });

  describe('#Animar()', function() {
    it('should initialize with an empty map and a false ticking property', function() {
      animar.should.have.property('elementMap');
      animar.should.have.property('ticking');
      animar.ticking.should.be.false;
    });
  });

  describe('#addAnimation()', function() {
    var addAnimationToMapStub, requestTickStub, easingFactoryMock, startStub;
    beforeEach(function() {
      addAnimationToMapStub = sinon.stub(Animar.prototype, 'addAnimationToMap');
      requestTickStub = sinon.stub(Animar.prototype, 'requestTick');
      easingFactoryMock = sinon.mock(EasingFactory);
      startStub = sinon.stub(Helper, 'getStartValue').returns(69);
    });
    afterEach(function() {
      addAnimationToMapStub.restore();
      requestTickStub.restore();
      easingFactoryMock.restore();
      startStub.restore();
    });
    it('should add an animation given an easing function', function() {
      var testEasingFunction = function() {};
      animar.addAnimation(testElement, 'translateX', 10, { duration: 10, easing: testEasingFunction });
      addAnimationToMapStub.calledWith({
        element: testElement,
        attribute: 'translateX',
        start: 69,
        destination: 10,
        duration: 10,
        ease: testEasingFunction,
        delay: 0,
        loop: false,
        wait: 0
      }).should.be.true;
      requestTickStub.called.should.be.true;
    });
    it('should add an animation given the name of an easing function', function() {
      easingFactoryMock.expects('linear').once();
      animar.addAnimation(testElement, 'translateX', 10, { duration: 10, easing: 'linear' });
      easingFactoryMock.verify();
    });
    it('should add an animation with an explicit `start` value', function() {
      var testEasingFunction = function() {};
      animar.addAnimation(testElement, 'translateX', 10, { duration: 10, start: 0, easing: testEasingFunction });
      addAnimationToMapStub.calledWith({
        element: testElement,
        attribute: 'translateX',
        start: 0,
        destination: 10,
        duration: 10,
        ease: testEasingFunction,
        delay: 0,
        loop: false,
        wait: 0
      }).should.be.true;
    });
    it('should add an animation with a delay option', function() {
      var testEasingFunction = function() {};
      animar.addAnimation(testElement, 'translateX', 10, { duration: 10, start: 0, easing: testEasingFunction, delay: 30 });
      addAnimationToMapStub.calledWith({
        element: testElement,
        attribute: 'translateX',
        start: 0,
        destination: 10,
        duration: 10,
        ease: testEasingFunction,
        delay: 30,
        loop: false,
        wait: 0
      }).should.be.true;
    });
    it('should add an animation with a loop option', function() {
      var testEasingFunction = function() {};
      animar.addAnimation(testElement, 'translateX', 10, { duration: 10, start: 0, easing: testEasingFunction, loop: true});
      addAnimationToMapStub.calledWith({
        element: testElement,
        attribute: 'translateX',
        start: 0,
        destination: 10,
        duration: 10,
        ease: testEasingFunction,
        delay: 0,
        loop: true,
        wait: 0
      }).should.be.true;
    });
    it('should add an animation with a wait parameter', function() {
      var testEasingFunction = function() {};
      animar.addAnimation(testElement, 'translateX', 10, { duration: 10, start: 0, easing: testEasingFunction, wait: 25});
      addAnimationToMapStub.calledWith({
        element: testElement,
        attribute: 'translateX',
        start: 0,
        destination: 10,
        duration: 10,
        ease: testEasingFunction,
        delay: 0,
        loop: false,
        wait: 25
      }).should.be.true;
    });
  });

  describe('#addAnimationToMap()', function() {
    it('should add the element to the map if it doesn\'t already exist', function() {
      var testParam1 = {
        element: testElement,
        attribute: 'test',
        start: 0,
        destination: 10,
        duration: 10,
        ease: function(){},
        delay: 0,
        loop: false,
        wait: 0
      };
      animar.addAnimationToMap(testParam1);
      animar.elementMap.has(testElement).should.be.true;
    });
    it('should not create another entry in the elementMap if the element already exists in the map', function() {
      var testParam1 = {
        element: testElement,
        attribute: 'test',
        start: 0,
        destination: 10,
        duration: 10,
        ease: function(){},
        delay: 0,
        loop: false,
        wait: 0
      };
      var testParam2 = {
        element: testElement,
        attribute: 'test',
        start: 0,
        destination: 15,
        duration: 10,
        ease: function(){},
        delay: 0,
        loop: false,
        wait: 0
      };
      animar.addAnimationToMap(testParam1);
      sinon.spy(animar.elementMap, 'set');
      animar.addAnimationToMap(testParam2);
      animar.elementMap.set.called.should.be.false;
      animar.elementMap.set.restore();
    });
  });
  // TODO: make this more comprehensive
  describe('#calculateAnimationValue()', function() {
    it('should use the given easing function to add to the animation value', function() {
      animar.calculateAnimationValue([{currentIteration: 0, easingFunction: function() {return 5;} }]).should.be.eql(5);
    });
    it('should add multiple animations together', function() {
      var mockEasingFunction = function() {return 5;};
      animar.calculateAnimationValue([{currentIteration: 0, easingFunction: mockEasingFunction},{currentIteration: 0, easingFunction: mockEasingFunction}])
        .should.be.eql(10);
    });
    it('should consider an animation value zero if it\'s current iteration is less than zero', function() {
      animar.calculateAnimationValue([{currentIteration: -5, easingFunction: function() {return 5;} }]).should.be.eql(5);
    });
    it('should return the value of totalIterations if the currentIteration is greater than it', function() {
      var easeSpy = sinon.spy();
      animar.calculateAnimationValue([{currentIteration: 25, totalIterations: 20, changeInValue: 0, startValue: 0, easingFunction: easeSpy}]);
      easeSpy.calledWith(20, 0, 0, 20).should.be.true;
    });
  });

  describe('#applyStyle', function() {
    it('should apply a transformation', function() {
      var helperStub = sinon.stub(Helper, 'setTransform');
      animar.applyStyle(testElement, 'transform', 'translateX(0)');
      helperStub.called.should.be.true;
      helperStub.restore();
    });
    it('should apply an opacity', function() {
      animar.applyStyle(testElement, 'opacity', '0');
      testElement.style.opacity.should.be.eql('0');
    });
  });

  describe('#update()', function() {
    var renderStub, stepStub;
    beforeEach(function() {
      renderStub = sinon.stub(Animar.prototype, 'renderDOM');
      stepStub = sinon.stub(Animar.prototype, 'stepFrame');
    });
    afterEach(function() {
      renderStub.restore();
      stepStub.restore();
    });
    it('should render the animations and step forward a frame', function() {
      renderStub.returns(false)
      animar.update();
      renderStub.called.should.be.true;
      stepStub.called.should.be.true;
      animar.ticking.should.be.false;
    });
    it('should continue updating if there are still animations in progress', function() {
      var requestTickStub = sinon.stub(Animar.prototype, 'requestTick');
      renderStub.returns(true);
      animar.update();
      requestTickStub.called.should.be.true;
      requestTickStub.restore();
    });
  });

  describe('#requestTick()', function() {
    beforeEach(function() {
      window.requestAnimationFrame = sinon.spy();
    });
    it('should do nothing if the animator is currently ticking', function() {
      animar.ticking = true;
      animar.requestTick();
      window.requestAnimationFrame.called.should.be.false;
    });
    it('should update the dom', function() {
      animar.ticking = false;
      animar.requestTick();
      window.requestAnimationFrame.called.should.be.true;
      animar.ticking.should.be.true;
    });
  });

  describe('#stepFrame()', function() {
    it('should add 1 to every current iteration property of every element\'s attribute\'s animation', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', { animations: [
            { delay: 0, currentIteration: 0, totalIterations: 10, loop: false, wait: 0 }
      ]});
      animar.elementMap = new Map();
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.stepFrame();
      animar.elementMap.get(testElement).attributeMap.get('testAttribute1').animations[0].currentIteration.should.be.eql(1);
    });
    it('should remove an animation if it has ended', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', { animations: [
            { delay: 0, currentIteration: 10, totalIterations: 10, loop: false, wait: 0 }
      ]});
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.stepFrame();
      animar.elementMap.get(testElement).attributeMap.get('testAttribute1').animations.length.should.be.eql(0);
    });
    it('should set the currentIteration to zero minus the delay value if the animation has ended and the loop property is true', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', { animations: [
            { delay: 10, currentIteration: 10, totalIterations: 10, loop: true, wait: 0 }
      ]});
      animar.elementMap = new Map();
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.stepFrame();
      animar.elementMap.get(testElement).attributeMap.get('testAttribute1').animations[0].currentIteration.should.be.eql(-10);
    });
    it('should not remove the animation if there is waiting remaining', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', { animations: [
            { delay: 0, currentIteration: 10, totalIterations: 10, loop: false, wait: 1 }
      ]});
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.stepFrame();
      animar.elementMap.get(testElement).attributeMap.get('testAttribute1').animations.length.should.be.eql(1);
    });
  });

  describe('#renderDOM()', function() {
    var calculateStub, styleStub;
    beforeEach(function() {
      calculateStub = sinon.stub(Animar.prototype, 'calculateAnimationValue').returns(-5);
      styleStub = sinon.stub(Animar.prototype, 'applyStyle');
    });

    afterEach(function() {
      calculateStub.restore();
      styleStub.restore();
    });

    it('should calculate the target value and apply the style to the attribute', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', {
        model: 5,
        animations: [{}]
      });
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.renderDOM();
      calculateStub.called.should.be.true;
      styleStub.calledWith(testElement, 'testAttribute1', 0).should.be.true;
    });

    it('should correctly construct a transform string', function() {
      var attributeMap = new Map();
      attributeMap.set('translateX', { model: 5, animations: [{}] });
      attributeMap.set('translateY', { model: 5, animations: [{}] });
      attributeMap.set('scaleX', { model: 5, animations: [{}] });
      attributeMap.set('scaleY', { model: 5, animations: [{}] });
      attributeMap.set('rotate', { model: 5, animations: [{}] });
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.renderDOM();
      styleStub.calledWith(testElement, 'transform', 'translateX(0px) translateY(0px) scaleX(0) scaleY(0) rotate(0deg) translateZ(0)').should.be.true;
    });

    it('should not apply a style when an element has no animations in-progress', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', {
        model: 5,
        animations: []
      });
      animar.elementMap.set(testElement, { attributeMap: attributeMap });
      animar.renderDOM();
      calculateStub.called.should.be.false;
      styleStub.calledWith(testElement, 'testAttribute1', 0).should.be.false;
    });
  });
});