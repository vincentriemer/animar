/// <reference path="../typings/tsd.d.ts"/>
import Attribute from '../src/attribute.js';
import * as Helper from '../src/helpers.js';

var assert = chai.assert;

describe('Attribute', () => {
  describe('#constructor()', () => {
    it('should correctly set the instance properties', () => {
      let testAttribute = new Attribute('translateX', 36);

      assert.equal(testAttribute.model, 36);
      assert.equal(testAttribute.name, 'translateX');
      assert.property(testAttribute, 'animations');
      assert.lengthOf(testAttribute.animations, 0);
    });
  });

  describe('#addAnimation()', () => {
    it('should push an animation to it\'s instance animations property', () => {
      let testAttribute = new Attribute('translateX', 20);
      let mockAnimation = { foo: 'bar' };

      testAttribute.addAnimation(mockAnimation);

      assert.equal(testAttribute.animations[0], mockAnimation);
    });
  });

  describe('#merge()', () => {
    it('should use the target\'s model value for the merged value', () => {
      let sourceAttribute = new Attribute('test', 20);
      let targetAttribute = new Attribute('test2', 36);

      let mergedAttribute = sourceAttribute.merge(targetAttribute);

      assert.equal(mergedAttribute.model, 36);
    });

    it('should concatenate the animations from both attributes', () => {
      let sourceAttribute = new Attribute('test', 20);
      sourceAttribute.addAnimation({ foo: 'bar' });
      let targetAttribute = new Attribute('test2', 36);
      targetAttribute.addAnimation({ foo: 'bar' });
      targetAttribute.addAnimation({ test: 'lol' });

      let mergedAttribute = sourceAttribute.merge(targetAttribute);

      assert.lengthOf(mergedAttribute.animations, 3);
    });
  });

  describe('#forEachAnimation()', () => {
    it('should perform a mutating function on all animations', () => {
      let testAttribute = new Attribute('test', 0);
      testAttribute.animations = [0, 1, 2, 3, 4, 5, 6, 7];

      testAttribute.forEachAnimation((animation) => {
        return animation.toString();
      });

      testAttribute.animations.forEach((animation) => {
        assert.typeOf(animation, 'string');
      });
    });
  });

  describe('#render()', () => {
    let applyStyleStub, calculateStub;

    beforeEach(() => {
      applyStyleStub = sinon.stub(Helper, 'applyStyle');
      calculateStub = sinon.stub(Helper, 'calculateAnimationValue').returns(10);
    })

    afterEach(() => {
      applyStyleStub.restore();
      calculateStub.restore();
    });

    it('should correctly apply an attribute that isn\'t a transform attribute', () => {
      let testAttribute = new Attribute('opacity', 20);
      let transformString = testAttribute.render({}, '');

      assert.isTrue(calculateStub.calledOnce);
      assert.isTrue(applyStyleStub.calledWith({}, 'opacity', '30'));
      assert.equal(transformString, '');
    });

    it('should return a transform string', () => {
      let testAttribute = new Attribute('scaleX', 20);
      let transformString = testAttribute.render({});

      assert.isTrue(calculateStub.calledOnce);
      assert.isFalse(applyStyleStub.called);
      assert.equal(transformString, 'scaleX(30) ');
    });

    it('should correctly apply the deg unit for rotation attributes', () => {
      let testAttribute = new Attribute('rotate', 20);
      let testAttributeX = new Attribute('rotateX', 20);
      let testAttributeY = new Attribute('rotateY', 20);
      let testAttributeZ = new Attribute('rotateZ', 20);

      let transString = testAttribute.render({}, '');
      let transStringX = testAttributeX.render({}, '');
      let transStringY = testAttributeY.render({}, '');
      let transStringZ = testAttributeZ.render({}, '');

      assert.isFalse(applyStyleStub.called);
      assert.equal(calculateStub.callCount, 4);

      assert.equal(transString, 'rotate(30deg) ');
      assert.equal(transStringX, 'rotateX(30deg) ');
      assert.equal(transStringY, 'rotateY(30deg) ');
      assert.equal(transStringZ, 'rotateZ(30deg) ');
    });

    it('should correctly apply the px unit for perspective', () => {
      let testAttribute = new Attribute('perspective', 20);
      let transformString = testAttribute.render({}, '');

      assert.isTrue(calculateStub.calledOnce);
      assert.equal(transformString, '');

      assert.isTrue(applyStyleStub.calledWith({}, 'perspective', '30px'));
    });

    it('should correctly apply the px unit for translate transforms', () => {
      let testAttributeX = new Attribute('translateX', 20);
      let testAttributeY = new Attribute('translateY', 20);
      let testAttributeZ = new Attribute('translateZ', 20);

      let transStringX = testAttributeX.render({}, '');
      let transStringY = testAttributeY.render({}, '');
      let transStringZ = testAttributeZ.render({}, '');

      assert.isFalse(applyStyleStub.called);
      assert.equal(calculateStub.callCount, 3);

      assert.equal(transStringX, 'translateX(30px) ');
      assert.equal(transStringY, 'translateY(30px) ');
      assert.equal(transStringZ, 'translateZ(30px) ');
    });
  });
  describe('#step()', () => {
    it('should remove all pre-existing animations which are null', () => {
      let testAnimation1 = null;
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation1);

      testAttribute.step(1);

      assert.equal(testAttribute.animations.length, 0);
    });

    it('should run the step function on each animation, passing in the timescale parameter', () => {
      let timescale = 1;
      let stepStub = sinon.stub();
      let testAnimation = { step: stepStub };
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation);

      testAttribute.step(timescale);

      assert.isTrue(stepStub.calledOnce);
      assert.isTrue(stepStub.calledWith(timescale));
    });

    it('should remove any animations which step functions return false', () => {
      let timescale = 1;
      let stepStub = sinon.stub().returns(false);
      let testAnimation = { step: stepStub };
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation);

      testAttribute.step(timescale);

      assert.equal(testAttribute.animations.length, 0);
    });

    it('should keep any animations which step functions return true', () => {
      let timescale = 1;
      let stepStub = sinon.stub().returns(true);
      let testAnimation = { step: stepStub };
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation);

      testAttribute.step(timescale);

      assert.equal(testAttribute.animations.length, 1);
    });

    it('should return true if all animation step functions return true', () => {
      let timescale = 1;
      let stepStub = sinon.stub().returns(true);
      let testAnimation = { step: stepStub };
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation);

      let result = testAttribute.step(timescale);

      assert.isTrue(result);
    });

    it('should return true if at least one of the animation step functions returns true', () => {
      let timescale = 1;
      let stepStub1 = sinon.stub().returns(true);
      let testAnimation1 = { step: stepStub1 };
      let stepStub2 = sinon.stub().returns(false);
      let testAnimation2 = { step: stepStub2 };
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation1);
      testAttribute.addAnimation(testAnimation2);

      let result = testAttribute.step(timescale);

      assert.isTrue(result);
    });

    it('should return false if all of the animation step functions return false', () => {
      let timescale = 1;
      let stepStub1 = sinon.stub().returns(false);
      let testAnimation1 = { step: stepStub1 };
      let stepStub2 = sinon.stub().returns(false);
      let testAnimation2 = { step: stepStub2 };
      let testAttribute = new Attribute('test', 20);
      testAttribute.addAnimation(testAnimation1);
      testAttribute.addAnimation(testAnimation2);

      let result = testAttribute.step(timescale);

      assert.isFalse(result);
    });
  });
});
