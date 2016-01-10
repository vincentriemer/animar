import Attribute, {
  addAnimationToAttribute,
  mergeAttributes,
  stepAttribute,
  render,
  loopAttribute
} from '../src/attribute';

import Animation from '../src/animation';

describe('Attribute', () => {
  describe('#Attribute', () => {
    it('should return an object with correct properties set from arguments', () => {
      const testAttribute = Attribute('translateX', 36);

      assert.equal(testAttribute.model, 36);
      assert.equal(testAttribute.name, 'translateX');
      assert.deepEqual(testAttribute.animations, []);
    });
  });

  describe('#addAnimationToAttribute', () => {
    it('should return an Attribute object with the given animation appended to the Animations property', () => {
      const testAttribute = Attribute('translateX', 36);
      const mockAnimation = 'animation';

      const result = addAnimationToAttribute(mockAnimation)(testAttribute);

      assert.equal(result.animations[0], mockAnimation);
    });
  });

  describe('#mergeAttributes', () => {
    it('should return an Attribute with the target\'s model', () => {
      const sourceAttribute = Attribute('attributeName', 20);
      const targetAttribute = Attribute('attributeName', 30);

      const result = mergeAttributes(targetAttribute)(sourceAttribute);

      assert.equal(result.model, 30);
    });

    it('should concatinate the animations from both attributes', () => {
      const sourceAttribute = addAnimationToAttribute('sourceAnimation')(Attribute('attributeName', 20));
      const targetAttribute = addAnimationToAttribute('targetAnimation')(Attribute('attributeName', 30));

      const result = mergeAttributes(targetAttribute)(sourceAttribute);

      assert.equal(result.animations[0], 'sourceAnimation');
      assert.equal(result.animations[1], 'targetAnimation');
    });
  });

  describe('#renderAttribute', () => {
    // TODO: Need plugin system implemented to test
  });

  describe('#stepAttribute', () => {
    it('should return an Attribute object from mapping stepAnimation onto the animations property', () => {
      const testAttribute = addAnimationToAttribute(
        Animation(0, -20, 20, 60, () => {}, 0)
      )(Attribute('attrName', 20));
      const timescale = 1;

      const result = stepAttribute(1)(testAttribute);

      assert.equal(result.animations[0].currentIteration, 1);
    });

    // TODO: add further tests from previous version
  });

  describe('#loopAttribute', () => {
    it('should return an Attribute object with the loopAnimation function mapped to the animation list', () => {
      const testAnimation1 = Animation(0, -20, 20, 30, () => {}, false, 0, 0);
      const testAnimation2 = Animation(0, -20, 20, 30, () => {}, false, 0, 0);

      const testAttribute =
        addAnimationToAttribute(testAnimation2)(addAnimationToAttribute(testAnimation1)(Attribute('attrName', 0)));

      const result = loopAttribute({ totalDuration: 100 })(testAttribute);

      result.animations.forEach(animation => {
        assert.equal(animation.looping, true);
        assert.equal(animation.wait, 70);
      });
    });
  });

});
