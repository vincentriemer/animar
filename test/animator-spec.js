var should = require('should');

describe('Animator', function() {

  var Animator;

  beforeEach(function() {
    Animator = require('../lib/animator'); // create a new Animator object
  });

  describe('#Animator()', function() {
    it('should initialize with an empty map and a false ticking property', function() {
      Animator.should.have.properties('elementMap','ticking');
      Animator.ticking.should.be.false;
    });
  });
});