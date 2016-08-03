import Element, {addAttributeToElement, mergeElements, stepElement, loopElement} from '../src/element';
import Attribute, {addAnimationToAttribute} from '../src/attribute';
import Animation from '../src/animation';

const assert = chai.assert;

describe('Element', () => {
  describe('#Element', () => {
   it('should return a map with an attributes property initialized to a new map', () => {
     const result = Element();
     assert.deepEqual(result, { attributes: {}});
   });
  });

  describe('#addAttributeToElement', () => {
    it('should set the attribute in the attributes map using the given attrName and attribute map', () => {
      const testElement = Element();
      const testAttrName = 'translateX';
      const testAttribute = Attribute(30);

      const result = addAttributeToElement(testAttrName, testAttribute)(testElement);

      assert.equal(result.attributes[testAttrName], testAttribute);
    });
  });

  describe('#mergeElements', () => {
    it('should add all attributes with unique names from target into source', () => {
      const testAttribute1 = Attribute(13);
      const testAttribute2 = Attribute(26);
      const source = addAttributeToElement('translateX', testAttribute1)(Element());
      const target = addAttributeToElement('translateY', testAttribute2)(Element());

      const result = mergeElements(target)(source);

      assert.equal(result.attributes.translateX, testAttribute1);
      assert.equal(result.attributes.translateY, testAttribute2);
    });

    it('should merge all attributes that have the same name', () => {
      const testAnimation = 'foo';
      const testAttribute1 = addAnimationToAttribute(testAnimation)(Attribute(13));
      const testAttribute2 = Attribute(26);

      const source = addAttributeToElement('translateX', testAttribute1)(Element());
      const target = addAttributeToElement('translateX', testAttribute2)(Element());

      const result = mergeElements(target)(source);
      assert.equal(Object.keys(result.attributes).length, 1);
      assert.equal(result.attributes.translateX.model, 26);
      assert.equal(result.attributes.translateX.animations[0], testAnimation);
    });
  });

  describe('#stepElement', () => {
    it('should update all it\'s attributes using the stepAttribute function', () => {
      const testAnimation = Animation(0, -20, 20, 60, () => {}, 0);
      const testAttribute = addAnimationToAttribute(testAnimation)(Attribute(13));
      const testElement = addAttributeToElement('translateX', testAttribute)(Element());
      const timescale = 0.5;

      const result = stepElement(timescale)(testElement);

      assert.equal(result.attributes.translateX.animations[0].currentIteration, timescale);
    });
  });

  describe('#loopElement', () => {
    it('should update all it\'s attributes using the loopAttribute function', () => {
      const testAnimation = Animation(0, -20, 20, 60, () => {}, 0);
      const testAttribute = addAnimationToAttribute(testAnimation)(Attribute(13));
      const testElement = addAttributeToElement('translateX', testAttribute)(Element());
      const chainOptions = { totalDuration: 100 };

      const result = loopElement(chainOptions)(testElement);

      assert.equal(result.attributes.translateX.animations[0].looping, true);
      assert.equal(result.attributes.translateX.animations[0].wait, 40);
    });
  });
});
