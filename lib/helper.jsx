/* @flow */

var Helper = {
    isElement: function(o: any): boolean{
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    },

    setTransform: function(element : HTMLElement, transformString : string) {
      element.style.webkitTransform = transformString;
      element.style.MozTransform = transformString;
      element.style.msTransform = transformString;
      element.style.OTransform = transformString;
      element.style.transform = transformString;
    },

    getTransformMatrix: function(element : HTMLElement) : Array<number> {
      var computedStyle = window.getComputedStyle(element, null);
      var transformString = computedStyle.getPropertyValue("-webkit-transform") ||
                            computedStyle.getPropertyValue("-moz-transform") ||
                            computedStyle.getPropertyValue("-ms-transform") ||
                            computedStyle.getPropertyValue("-o-transform") ||
                            computedStyle.getPropertyValue("transform") ||
                            'woops'; // TODO: throw error
      if (transformString === 'none') { transformString = "matrix(1, 0, 0, 1, 0, 0)"; }
      var values = transformString.split('(')[1].split(')')[0].split(',');
      values = values.map(function(x) { return parseInt(x, 10); } );
      return values;
    },

    getTranslateX: function(element : HTMLElement) : number {
      var values = this.getTransformMatrix(element);
      return values[4];
    },

    getTranslateY: function(element : HTMLElement) : number {
      var values = this.getTransformMatrix(element);
      return values[5];
    },

    getScaleX: function(element : HTMLElement) : number {
      var values = this.getTransformMatrix(element);
      return values[0];
    },

    getScaleY: function(element : HTMLElement) : number {
      var values = this.getTransformMatrix(element);
      return values[3];
    },

    getRotation: function(element : HTMLElement) : number {
      var values = this.getTransformMatrix(element);
      var a = values[0],
          b = values[1];

      return Math.round(Math.atan2(b, a) * (180/Math.PI));
    },

    getOpacity: function(element : HTMLElement) : number {
      var computedStyle = window.getComputedStyle(element, null);
      return parseFloat(computedStyle.getPropertyValue("opacity"));
    }
};

module.exports = Helper;