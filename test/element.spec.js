import Immutable from 'immutable';

import Element, {addAttribute, mergeElements, stepElement, loopElement} from '../src/element';
import Attribute, {addAnimationToAttribute} from '../src/attribute';
import Animation from '../src/animation';

describe('Element', () => {
  describe('#Element', () => {
   it('should return a map with an attributes property initialized to a new map', () => {
     const result = Element();
     assert.isTrue(result.equals(Immutable.Map({ attributes: Immutable.Map() })));
   });
  });

  describe('#addAttribute', () => {
    it('should set the attribute in the attributes map using the given attrName and attribute map', () => {
      const testElement = Element();
      const testAttrName = 'translateX';
      const testAttribute = Attribute(30);

      const result = addAttribute(testAttrName, testAttribute)(testElement);

      assert.equal(result.getIn(['attributes', testAttrName]), testAttribute);
    });
  });

  describe('#mergeElements', () => {
    it('should add all attributes with unique names from target into source', () => {
      const testAttribute1 = Attribute(13);
      const testAttribute2 = Attribute(26);
      const source = addAttribute('translateX', testAttribute1)(Element());
      const target = addAttribute('translateY', testAttribute2)(Element());

      const result = mergeElements(target)(source);

      assert.equal(result.getIn(['attributes', 'translateX']), testAttribute1);
      assert.equal(result.getIn(['attributes', 'translateY']), testAttribute2);
    });

    it('should merge all attributes that have the same name', () => {
      const testAnimation = 'foo';
      const testAttribute1 = addAnimationToAttribute(testAnimation)(Attribute(13));
      const testAttribute2 = Attribute(26);

      const source = addAttribute('translateX', testAttribute1)(Element());
      const target = addAttribute('translateX', testAttribute2)(Element());

      const result = mergeElements(target)(source);
      assert.equal(result.get('attributes').size, 1);
      assert.equal(result.getIn(['attributes', 'translateX', 'model']), 26);
      assert.equal(result.getIn(['attributes', 'translateX', 'animations', 0]), testAnimation);
    });
  });

  describe('#stepElement', () => {
    it('should update all it\'s attributes using the stepAttribute function', () => {
      const testAnimation = Animation(0, -20, 20, 60, () => {}, 0);
      const testAttribute = addAnimationToAttribute(testAnimation)(Attribute(13));
      const testElement = addAttribute('translateX', testAttribute)(Element());
      const timescale = 0.5;

      const result = stepElement(timescale)(testElement);

      assert.equal(result.getIn(['attributes', 'translateX', 'animations', 0, 'currentIteration']), timescale);
    });
  });

  describe('#loopElement', () => {
    it('should update all it\'s attributes using the loopAttribute function', () => {
      const testAnimation = Animation(0, -20, 20, 60, () => {}, 0);
      const testAttribute = addAnimationToAttribute(testAnimation)(Attribute(13));
      const testElement = addAttribute('translateX', testAttribute)(Element());
      const chainOptions = { totalDuration: 100 };

      const result = loopElement(chainOptions)(testElement);

      assert.equal(result.getIn(['attributes', 'translateX', 'animations', 0, 'looping']), true);
      assert.equal(result.getIn(['attributes', 'translateX', 'animations', 0, 'wait']), 40);
    });
  });
});
