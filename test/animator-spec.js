var should = require('should'),
  sinon = require('sinon'),
  jsdom = require('jsdom'),
  EasingFactory = require('../lib/ease'),
  Animator = require('../lib/animar'),
  Helper = require('../lib/helper');

describe('Animator', function() {

  var animator, testElement;

  document = jsdom.jsdom('<html><body><div id="testLocation"></div></body></html>');
  window = document.parentWindow;

  beforeEach(function() {
    animator = new Animator(); // create a new Animator object

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

  describe('#Animator()', function() {
    it('should initialize with an empty map and a false ticking property', function() {
      animator.should.have.properties('elementMap','ticking');
      animator.ticking.should.be.false;
    });
  });

  describe('#addAnimationToMap()', function() {
    it('should add the element to the map if it doesn\'t already exist', function() {
      var testParam1 = {
        element: testElement,
        attribute: 'test',
        destination: 10,
        duration: 10,
        ease: function(){}
      };
      animator.addAnimationToMap(testParam1);
      animator.elementMap.has(testElement).should.be.true;
    });
    it('should call the addAnimation function with the given parameter', function() {
      var testParam1 = {
        element: testElement,
        attribute: 'test',
        destination: 10,
        duration: 10,
        ease: function(){}
      };
      var mockElement = { addAnimation: sinon.spy() };
      animator.elementMap.set(testElement, mockElement);
      animator.addAnimationToMap(testParam1);
      mockElement.addAnimation.calledOnce.should.be.true;
      mockElement.addAnimation.calledWith(testParam1).should.be.true;
    });
    it('should not create another entry in the elementMap if the element already exists in the map', function() {
      var testParam1 = {
        element: testElement,
        attribute: 'test',
        destination: 10,
        duration: 10,
        ease: function(){}
      };
      var testParam2 = {
        element: testElement,
        attribute: 'test',
        destination: 15,
        duration: 10,
        ease: function(){}
      };
      animator.addAnimationToMap(testParam1);
      sinon.spy(animator.elementMap, 'set');
      animator.addAnimationToMap(testParam2);
      animator.elementMap.set.called.should.be.false;
      animator.elementMap.set.restore();
    });
  });

  describe('#addAnimation()', function() {
    var addAnimationToMapStub, requestTickStub, easingFactoryMock;
    beforeEach(function() {
      addAnimationToMapStub = sinon.stub(Animator.prototype, 'addAnimationToMap');
      requestTickStub = sinon.stub(Animator.prototype, 'requestTick');
      easingFactoryMock = sinon.mock(EasingFactory);
    });
    afterEach(function() {
      addAnimationToMapStub.restore();
      requestTickStub.restore();
      easingFactoryMock.restore();
    });
    it('should add an animation given an easing function', function() {
      var testEasingFunction = function() {};
      animator.addAnimation({target: testElement, attribute: 'translateX', destination: 10, duration: 10, easingFunction: testEasingFunction});
      addAnimationToMapStub.called.should.be.true;
      requestTickStub.called.should.be.true;
    });
    it('should add an animation given the name of an easing function', function() {
      easingFactoryMock.expects('linear').once();
      animator.addAnimation({target: testElement, attribute: 'translateX', destination: 10, duration: 10, easingFunction: 'linear'});
      easingFactoryMock.verify();
    });
  });
  
  describe('#calculateAnimationValue()', function() {
    it('should use the given easing function to add to the animation value', function() {
      animator.calculateAnimationValue([{easingFunction: function() {return 5;}}]).should.be.exactly(5);
    });
    it('should add multiple animations together', function() {
      var mockEasingFunction = function() {return 5;};
      animator.calculateAnimationValue([{easingFunction: mockEasingFunction},{easingFunction: mockEasingFunction}])
        .should.be.exactly(10);
    });
  });

  describe('#applyStyle', function() {
    it('should apply a transformation', function() {
      var helperStub = sinon.stub(Helper, 'setTransform');
      animator.applyStyle(testElement, 'transform', 'translateX(0)');
      helperStub.called.should.be.true;
      helperStub.restore();
    });
    it('should apply an opacity', function() {
      animator.applyStyle(testElement, 'opacity', '0');
      testElement.style.opacity.should.be.exactly('0');
    });
  });

  describe('#update()', function() {
    var renderStub, stepStub;
    beforeEach(function() {
      renderStub = sinon.stub(Animator.prototype, 'renderDOM');
      stepStub = sinon.stub(Animator.prototype, 'stepFrame');
    });
    afterEach(function() {
      renderStub.restore();
      stepStub.restore();
    });
    it('should render the animations and step forward a frame', function() {
      renderStub.returns(false)
      animator.update();
      renderStub.called.should.be.true;
      stepStub.called.should.be.true;
      animator.ticking.should.be.false;
    });
    it('should continue updating if there are still animations in progress', function() {
      var requestTickStub = sinon.stub(Animator.prototype, 'requestTick');
      renderStub.returns(true);
      animator.update();
      requestTickStub.called.should.be.true;
      requestTickStub.restore();
    });
  });

  describe('#requestTick()', function() {
    beforeEach(function() {
      window.requestAnimationFrame = sinon.spy();
    });
    it('should do nothing if the animator is currently ticking', function() {
      animator.ticking = true;
      animator.requestTick();
      window.requestAnimationFrame.called.should.be.false;
    });
    it('should update the dom', function() {
      animator.ticking = false;
      animator.requestTick();
      window.requestAnimationFrame.called.should.be.true;
      animator.ticking.should.be.true;
    });
  });

  describe('#stepFrame()', function() {
    it('should add 1 to every current iteration property of every element\'s attribute\'s animation', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', { animations: [
            { currentIteration: 0, totalIterations: 10 }
      ]});
      animator.elementMap = new Map();
      animator.elementMap.set(testElement, { attributeMap: attributeMap });
      animator.stepFrame();
      animator.elementMap.get(testElement).attributeMap.get('testAttribute1').animations[0].currentIteration.should.be.exactly(1);
    });
    it('should remove an animation if it has ended', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', { animations: [
            { currentIteration: 10, totalIterations: 10 }
      ]});
      animator.elementMap.set(testElement, { attributeMap: attributeMap });
      animator.stepFrame();
      animator.elementMap.get(testElement).attributeMap.get('testAttribute1').animations.length.should.be.exactly(0);
    })
  });

  describe('#renderDOM()', function() {
    var calculateStub, styleStub;
    beforeEach(function() {
      calculateStub = sinon.stub(Animator.prototype, 'calculateAnimationValue').returns(-5);
      styleStub = sinon.stub(Animator.prototype, 'applyStyle');
    });

    afterEach(function() {
      calculateStub.restore();
      styleStub.restore();
    });

    it('should calculate the target value and apply the style to the attribute', function() {
      var attributeMap = new Map();
      attributeMap.set('testAttribute1', {
        model: 5,
        animations: []
      });
      animator.elementMap.set(testElement, { attributeMap: attributeMap });
      animator.renderDOM();
      calculateStub.called.should.be.true;
      styleStub.calledWith(testElement, 'testAttribute1', 0).should.be.true;
    });

    it('should correctly construct a transform string', function() {
      var attributeMap = new Map();
      attributeMap.set('translateX', { model: 5, animations: [] });
      attributeMap.set('translateY', { model: 5, animations: [] });
      attributeMap.set('scaleX', { model: 5, animations: [] });
      attributeMap.set('scaleY', { model: 5, animations: [] });
      attributeMap.set('rotate', { model: 5, animations: [] });
      animator.elementMap.set(testElement, { attributeMap: attributeMap });
      animator.renderDOM();
      styleStub.calledWith(testElement, 'transform', 'translateX(0px) translateY(0px) scaleX(0) scaleY(0) rotate(0deg) ').should.be.true;
    });
  });
});