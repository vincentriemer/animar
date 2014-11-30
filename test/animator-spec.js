var should = require('should'),
  sinon = require('sinon'),
  jsdom = require('jsdom');

describe('Animator', function() {

  var Animator, testElement, testParam1, testParam2;

  var doc = jsdom.jsdom('<html><body><div id="testLocation"></div></body></html>');

  beforeEach(function() {
    Animator = require('../lib_js/animator'); // create a new Animator object

    // setup test element & parameter
    testElement = doc.createElement('div');
    doc.getElementById('testLocation').appendChild(testElement);
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
      Animator.should.have.properties('elementMap','ticking');
      Animator.ticking.should.be.false;
    });
  });

  describe('#addAnimationToMap()', function() {
    it('should add the element to the map if it doesn\'t already exist', function() {
      Animator.addAnimationToMap(testParam1);
      Animator.elementMap.has(testElement).should.be.true;
    });
    it('should call the addAnimation function with the given parameter', function() {
      var mockElement = { addAnimation: sinon.spy() };
      Animator.elementMap.set(testElement, mockElement);
      Animator.addAnimationToMap(testParam1);
      mockElement.addAnimation.calledOnce.should.be.true;
      mockElement.addAnimation.calledWith(testParam1).should.be.true;
    });
    it('should not create another entry in the elementMap if the element already exists in the map', function() {
      Animator.addAnimationToMap(testParam1);
      sinon.spy(Animator.elementMap, 'set');
      Animator.addAnimationToMap(testParam2);
      Animator.elementMap.set.called.should.be.false;
      Animator.elementMap.set.restore();
    });
  });
});