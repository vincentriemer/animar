!function t(n,e,r){function a(o,u){if(!e[o]){if(!n[o]){var c="function"==typeof require&&require;if(!u&&c)return c(o,!0);if(i)return i(o,!0);var s=new Error("Cannot find module '"+o+"'");throw s.code="MODULE_NOT_FOUND",s}var f=e[o]={exports:{}};n[o][0].call(f.exports,function(t){var e=n[o][1][t];return a(e?e:t)},f,f.exports,t,n,e,r)}return e[o].exports}for(var i="function"==typeof require&&require,o=0;o<r.length;o++)a(r[o]);return a}({1:[function(t,n){var e=t("./ease"),r=t("./element"),a=t("./helper"),i=t("./constants"),o=function(){this.elementMap=new Map,this.ticking=!1};o.prototype.addAnimationToMap=function(t){this.elementMap.has(t.element)||this.elementMap.set(t.element,new r),this.elementMap.get(t.element).addAnimation(t)},o.prototype.addAnimation=function(t){var n=t.element,r=t.attribute,a=t.destination,i=t.duration,o=t.easingFunction;"string"==typeof o&&(o=e[o]());var u={element:n,attribute:r,destination:a,duration:i,ease:o};this.addAnimationToMap(u),this.requestTick()},o.prototype.calculateAnimationValue=function(t){var n=0;return t.forEach(function(t){n+=t.easingFunction(t.currentIteration,t.startValue,t.changeInValue,t.totalIterations)}),n},o.prototype.applyStyle=function(t,n,e){switch(n){case"transform":a.setTransform(t,e);break;case"opacity":t.style.opacity=e}},o.prototype.renderDOM=function(){var t=this,n=!1;return t.elementMap.forEach(function(e,r){var a=r,o="";e.attributeMap.forEach(function(e,r){n=!0;var u=r,c=e.model+t.calculateAnimationValue(e.animations);if(-1!==i.TRANSFORM_ATTRIBUTES.indexOf(u)){var s="translateX"===u||"translateY"===u?"px":"rotate"===u?"deg":"";o+=u+"("+c+s+") "}else t.applyStyle(a,u,c)}),""!==o&&(console.log(o),t.applyStyle(a,"transform",o))}),n},o.prototype.stepFrame=function(){var t=this.elementMap;t.forEach(function(t){var n=t.attributeMap;n.forEach(function(t){var n=[];t.animations.forEach(function(t){t.currentIteration!==t.totalIterations&&(t.currentIteration+=1,n.push(t))}),t.animations=n}),t.attributeMap=n})},o.prototype.update=function(){var t=this.renderDOM();this.stepFrame(),this.ticking=!1,t&&this.requestTick()},o.prototype.requestTick=function(){this.ticking||(window.requestAnimationFrame(this.update.bind(this)),this.ticking=!0)},n.exports=o},{"./constants":2,"./ease":3,"./element":4,"./helper":5}],2:[function(t,n){var e={TRANSFORM_ATTRIBUTES:["translateX","translateY","scaleX","scaleY","rotate"]};n.exports=e},{}],3:[function(t,n){var e={linear:function(){return function(t,n,e,r){return e*t/r+n}},quadratic_in:function(){return function(t,n,e,r){return t/=r,e*t*t+n}},quadratic_out:function(){return function(t,n,e,r){return t/=r,-e*t*(t-2)+n}},quadratic_in_out:function(){return function(t,n,e,r){return t/=r/2,1>t?e/2*t*t+n:(t--,-e/2*(t*(t-2)-1)+n)}},cubic_in:function(){return function(t,n,e,r){return t/=r,e*t*t*t+n}},cubic_out:function(){return function(t,n,e,r){return t/=r,t--,e*(t*t*t+1)+n}},cubic_in_out:function(){return function(t,n,e,r){return t/=r/2,1>t?e/2*t*t*t+n:(t-=2,e/2*(t*t*t+2)+n)}},quartic_in:function(){return function(t,n,e,r){return t/=r,e*t*t*t*t+n}},quartic_out:function(){return function(t,n,e,r){return t/=r,t--,-e*(t*t*t*t-1)+n}},quartic_in_out:function(){return function(t,n,e,r){return t/=r/2,1>t?e/2*t*t*t*t+n:(t-=2,-e/2*(t*t*t*t-2)+n)}},quintic_in:function(){return function(t,n,e,r){return t/=r,e*t*t*t*t*t+n}},quintic_out:function(){return function(t,n,e,r){return t/=r,t--,e*(t*t*t*t*t+1)+n}},quintic_in_out:function(){return function(t,n,e,r){return t/=r/2,1>t?e/2*t*t*t*t*t+n:(t-=2,e/2*(t*t*t*t*t+2)+n)}},sinusoidal_in:function(){return function(t,n,e,r){return-e*Math.cos(t/r*(Math.PI/2))+e+n}},sinusoidal_out:function(){return function(t,n,e,r){return e*Math.sin(t/r*(Math.PI/2))+n}},sinusoidal_in_out:function(){return function(t,n,e,r){return-e/2*(Math.cos(Math.PI*t/r)-1)+n}},exponential_in:function(){return function(t,n,e,r){return e*Math.pow(2,10*(t/r-1))+n}},exponential_out:function(){return function(t,n,e,r){return e*(-Math.pow(2,-10*t/r)+1)+n}},exponential_in_out:function(){return function(t,n,e,r){return t/=r/2,1>t?e/2*Math.pow(2,10*(t-1))+n:(t--,e/2*(-Math.pow(2,-10*t)+2)+n)}},circular_in:function(){return function(t,n,e,r){return t/=r,-e*(Math.sqrt(1-t*t)-1)+n}},circular_out:function(){return function(t,n,e,r){return t/=r,t--,e*Math.sqrt(1-t*t)+n}},circular_in_out:function(){return function(t,n,e,r){return t/=r/2,1>t?-e/2*(Math.sqrt(1-t*t)-1)+n:(t-=2,e/2*(Math.sqrt(1-t*t)+1)+n)}}};n.exports=e},{}],4:[function(t,n){var e=t("./helper"),r=function(){this.attributeMap=new Map};r.prototype.addAnimation=function(t){this.attributeMap.has(t.attribute)||this.createAttribute(t);var n=this.attributeMap.get(t.attribute),e=n.model-t.destination,r=0-e,a=t.duration,i=t.ease;n.model=t.destination,n.animations.push({currentIteration:0,startValue:e,changeInValue:r,totalIterations:a,easingFunction:i})},r.prototype.getStartValue=function(t){var n;switch(t.attribute){case"opacity":n=e.getOpacity(t.element);break;case"translateX":n=e.getTranslateX(t.element);break;case"translateY":n=e.getTranslateY(t.element);break;case"scaleX":n=e.getScaleX(t.element);break;case"scaleY":n=e.getScaleY(t.element);break;case"rotate":n=e.getRotation(t.element);break;default:n=0}return n},r.prototype.createAttribute=function(t){var n=t.startValue||this.getStartValue(t),e={model:n,animations:[]};this.attributeMap.set(t.attribute,e)},n.exports=r},{"./helper":5}],5:[function(t,n){var e={setTransform:function(t,n){return t.style.webkitTransform=n,t.style.MozTransform=n,t.style.msTransform=n,t.style.OTransform=n,t.style.transform=n,t},getTransformMatrix:function(t){var n=window.getComputedStyle(t,null),e=n.getPropertyValue("-webkit-transform")||n.getPropertyValue("-moz-transform")||n.getPropertyValue("-ms-transform")||n.getPropertyValue("-o-transform")||n.getPropertyValue("transform")||"woops";"none"===e&&(e="matrix(1, 0, 0, 1, 0, 0)");var r=e.split("(")[1].split(")")[0].split(",");return r=r.map(function(t){return parseFloat(t,10)})},getTranslateX:function(t){var n=this.getTransformMatrix(t);return n[4]},getTranslateY:function(t){var n=this.getTransformMatrix(t);return n[5]},getScaleX:function(t){var n=this.getTransformMatrix(t);return Math.sqrt(Math.pow(n[0],2)+Math.pow(n[1],2))},getScaleY:function(t){var n=this.getTransformMatrix(t);return Math.sqrt(Math.pow(n[2],2)+Math.pow(n[3],2))},getRotation:function(t){var n=this.getTransformMatrix(t),e=n[0],r=n[1];return Math.round(Math.atan2(r,e)*(180/Math.PI))},getOpacity:function(t){var n=window.getComputedStyle(t,null);return parseFloat(n.getPropertyValue("opacity"))}};n.exports=e},{}]},{},[1]);