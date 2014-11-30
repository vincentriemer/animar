/* @flow */

var Helper = {
    isElement: function(o     )         {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    },

    setTransform: function(element              , transformString         ) {
      element.style.webkitTransform = transformString;
      element.style.MozTransform = transformString;
      element.style.msTransform = transformString;
      element.style.OTransform = transformString;
      element.style.transform = transformString;
    },

    getTransformMatrix: function(element              )                 {
      var computedStyle = window.getComputedStyle(element, null);
      var transformString = computedStyle.getPropertyValue("-webkit-transform") ||
                            computedStyle.getPropertyValue("-moz-transform") ||
                            computedStyle.getPropertyValue("-ms-transform") ||
                            computedStyle.getPropertyValue("-o-transform") ||
                            computedStyle.getPropertyValue("transform") ||
                            'woops'; // TODO: throw error
      if (transformString === 'none') { transformString = "matrix(1, 0, 0, 1, 0, 0)"; }
      var values = transformString.split('(')[1].split(')')[0].split(',');
      values = values.map(function(x){return parseInt(x)});
      return values;
    },

    getTranslateX: function(element              )          {
      var values = this.getTransformMatrix(element);
      return values[4];
    },

    getTranslateY: function(element              )          {
      var values = this.getTransformMatrix(element);
      return values[5];
    },

    getScaleX: function(element              )          {
      var values = this.getTransformMatrix(element);
      return values[0];
    },

    getScaleY: function(element              )          {
      var values = this.getTransformMatrix(element);
      return values[3];
    },

    getRotation: function(element              )          {
      var values = this.getTransformMatrix(element);
      var a = values[0],
          b = values[1],
          c = values[2],
          d = values[3];

      return Math.round(Math.atan2(b, a) * (180/Math.PI));
    },

    getOpacity: function(element              )          {
      var computedStyle = window.getComputedStyle(element, null);
      return parseFloat(computedStyle.getPropertyValue("opacity"));
    }
};

module.exports = Helper;