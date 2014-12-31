var should = require('chai').should(),
    EasingFactory = require("../lib/ease");

var factoryProperties = [
  "linear",              
  "quadratic_in",       
  "quadratic_out",      
  "quadratic_in_out",   
  "cubic_in",           
  "cubic_out",          
  "cubic_in_out",       
  "quartic_in",         
  "quartic_out",        
  "quartic_in_out",     
  "quintic_in",         
  "quintic_out",        
  "quintic_in_out",     
  "sinusoidal_in",      
  "sinusoidal_out",     
  "sinusoidal_in_out",  
  "exponential_in",     
  "exponential_out",    
  "exponential_in_out", 
  "circular_in",        
  "circular_out",       
  "circular_in_out",    
];

describe('EasingFactory', function() {
  factoryProperties.forEach(function(element) {
    describe(element, function() {
      it('should return a valid easing function', function() {
        var currentFunction = EasingFactory[element]();
        Math.round(currentFunction(0,0,10,20)).should.equal(0);
        Math.round(currentFunction(20,0,10,20)).should.equal(10);
      });
    });
  });
});