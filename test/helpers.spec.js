import * as Helpers from '../src/helpers.js';

describe('Helpers', () => {
  describe('#applyStyle', () => {
    it('should set a transform string', () => {
      const testElement = document.getElementById('target');
      const transformString = 'translateX(20px) scale(1) rotate(30deg)';
      Helpers.applyStyle(testElement, 'transform', transformString);
      assert.equal(testElement.style.transform, transformString);
    });

    it('should set the opacity', () => {
      const testElement = document.getElementById('target');
      const opacityValue = '0';
      Helpers.applyStyle(testElement, 'opacity', opacityValue);
      assert.equal(testElement.style.opacity, opacityValue);
    });

    it('should set the perspective', () => {
      const testElement = document.getElementById('target');
      const perspectiveValue = '30px';
      Helpers.applyStyle(testElement, 'perspective', perspectiveValue);
      assert.equal(testElement.style.perspective, perspectiveValue);
    });

    it('should throw an error if it\'s provided an unknown attribute', () => {
      const testElement = document.getElementById('target');
      assert.throw(() => Helpers.applyStyle(testElement, 'blah', '20px'));
    });
  });
});
