var should = require("should")
    EasingFactory = require("../lib_js/ease");

describe('EasingFactory', function() {
  for (var property in EasingFactory) {
    if (EasingFactory.hasOwnProperty(property)) {
      describe(property, function() {
        it('should return a valid easing function', function() {
          var currentFunction = EasingFactory[property]();
          currentFunction(0,0,10,20).should.equal(0);
          currentFunction(20,0,10,20).should.equal(10);
        });
      });
    }
  }
});