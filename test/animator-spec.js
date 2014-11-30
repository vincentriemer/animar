var should = require('should'),
  sinon = require('sinon'),
  jsdom = require('jsdom'),
  EasingFactory = require('../lib_js/ease'),
  Animator = require('../lib_js/animator');

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
});