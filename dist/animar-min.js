!function t(n,r,e){function a(o,u){if(!r[o]){if(!n[o]){var s="function"==typeof require&&require;if(!u&&s)return s(o,!0);if(i)return i(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var f=r[o]={exports:{}};n[o][0].call(f.exports,function(t){var r=n[o][1][t];return a(r?r:t)},f,f.exports,t,n,r,e)}return r[o].exports}for(var i="function"==typeof require&&require,o=0;o<e.length;o++)a(e[o]);return a}({1:[function(t,n){var r=t("./ease"),e=t("./element"),a=t("./helper"),i=t("./constants"),o=function(){this.elementMap=new Map,this.ticking=!1};o.prototype.addAnimationToMap=function(t){this.elementMap.has(t.element)||this.elementMap.set(t.element,new e),this.elementMap.get(t.element).addAnimation(t)},o.prototype.add=function(t,n,e,i){var o={element:t,attribute:n,start:void 0===i.start?a.getStartValue([t,n]):i.start,destination:e,duration:i.duration,ease:"string"==typeof i.easing?r[i.easing]():i.easing,delay:i.delay||0};this.addAnimationToMap(o),this.requestTick()},o.prototype.calculateAnimationValue=function(t){var n=0;return t.forEach(function(t){var r=t.currentIteration;t.currentIteration>=0&&(r=0),n+=t.easingFunction(r,t.startValue,t.changeInValue,t.totalIterations)}),n},o.prototype.applyStyle=function(t,n,r){switch(n){case"transform":a.setTransform(t,r);break;case"opacity":t.style.opacity=r}},o.prototype.renderDOM=function(){var t=this,n=!1;return t.elementMap.forEach(function(r,e){var a=e,o="";r.attributeMap.forEach(function(r,e){var u=e;if(0!==r.animations.length){n=!0;var s=r.model+t.calculateAnimationValue(r.animations);if(-1!==i.TRANSFORM_ATTRIBUTES.indexOf(u)){var c="translateX"===u||"translateY"===u?"px":"rotate"===u?"deg":"";o+=u+"("+s+c+") "}else t.applyStyle(a,u,s)}}),""!==o&&(o+="translateZ(0)",t.applyStyle(a,"transform",o))}),n},o.prototype.stepFrame=function(){var t=this.elementMap;t.forEach(function(t){var n=t.attributeMap;n.forEach(function(t){var n=[];t.animations.forEach(function(t){t.currentIteration!==t.totalIterations&&(t.currentIteration+=1,n.push(t))}),t.animations=n}),t.attributeMap=n})},o.prototype.update=function(){var t=this.renderDOM();this.stepFrame(),this.ticking=!1,t&&this.requestTick()},o.prototype.requestTick=function(){this.ticking||(window.requestAnimationFrame(this.update.bind(this)),this.ticking=!0)},n.exports=o},{"./constants":2,"./ease":3,"./element":4,"./helper":5}],2:[function(t,n){var r={TRANSFORM_ATTRIBUTES:["translateX","translateY","scaleX","scaleY","rotate"]};n.exports=r},{}],3:[function(t,n){var r={linear:function(){return function(t,n,r,e){return r*t/e+n}},quadratic_in:function(){return function(t,n,r,e){return t/=e,r*t*t+n}},quadratic_out:function(){return function(t,n,r,e){return t/=e,-r*t*(t-2)+n}},quadratic_in_out:function(){return function(t,n,r,e){return t/=e/2,1>t?r/2*t*t+n:(t--,-r/2*(t*(t-2)-1)+n)}},cubic_in:function(){return function(t,n,r,e){return t/=e,r*t*t*t+n}},cubic_out:function(){return function(t,n,r,e){return t/=e,t--,r*(t*t*t+1)+n}},cubic_in_out:function(){return function(t,n,r,e){return t/=e/2,1>t?r/2*t*t*t+n:(t-=2,r/2*(t*t*t+2)+n)}},quartic_in:function(){return function(t,n,r,e){return t/=e,r*t*t*t*t+n}},quartic_out:function(){return function(t,n,r,e){return t/=e,t--,-r*(t*t*t*t-1)+n}},quartic_in_out:function(){return function(t,n,r,e){return t/=e/2,1>t?r/2*t*t*t*t+n:(t-=2,-r/2*(t*t*t*t-2)+n)}},quintic_in:function(){return function(t,n,r,e){return t/=e,r*t*t*t*t*t+n}},quintic_out:function(){return function(t,n,r,e){return t/=e,t--,r*(t*t*t*t*t+1)+n}},quintic_in_out:function(){return function(t,n,r,e){return t/=e/2,1>t?r/2*t*t*t*t*t+n:(t-=2,r/2*(t*t*t*t*t+2)+n)}},sinusoidal_in:function(){return function(t,n,r,e){return-r*Math.cos(t/e*(Math.PI/2))+r+n}},sinusoidal_out:function(){return function(t,n,r,e){return r*Math.sin(t/e*(Math.PI/2))+n}},sinusoidal_in_out:function(){return function(t,n,r,e){return-r/2*(Math.cos(Math.PI*t/e)-1)+n}},exponential_in:function(){return function(t,n,r,e){return r*Math.pow(2,10*(t/e-1))+n}},exponential_out:function(){return function(t,n,r,e){return r*(-Math.pow(2,-10*t/e)+1)+n}},exponential_in_out:function(){return function(t,n,r,e){return t/=e/2,1>t?r/2*Math.pow(2,10*(t-1))+n:(t--,r/2*(-Math.pow(2,-10*t)+2)+n)}},circular_in:function(){return function(t,n,r,e){return t/=e,-r*(Math.sqrt(1-t*t)-1)+n}},circular_out:function(){return function(t,n,r,e){return t/=e,t--,r*Math.sqrt(1-t*t)+n}},circular_in_out:function(){return function(t,n,r,e){return t/=e/2,1>t?-r/2*(Math.sqrt(1-t*t)-1)+n:(t-=2,r/2*(Math.sqrt(1-t*t)+1)+n)}}};n.exports=r},{}],4:[function(t,n){var r=(t("./helper"),function(){this.attributeMap=new Map});r.prototype.addAnimation=function(t){this.attributeMap.has(t.attribute)||this.createAttribute(t);var n=this.attributeMap.get(t.attribute),r=n.model-t.destination,e=t.duration,a=t.ease,i=0-r;n.model=t.destination,n.animations.push({currentIteration:0-t.delay,startValue:r,changeInValue:i,totalIterations:e,easingFunction:a})},r.prototype.createAttribute=function(t){var n={model:t.start,animations:[]};this.attributeMap.set(t.attribute,n)},n.exports=r},{"./helper":5}],5:[function(t,n){var r={setTransform:function(t,n){return t.style.webkitTransform=n,t.style.MozTransform=n,t.style.msTransform=n,t.style.OTransform=n,t.style.transform=n,t},getTransformMatrix:function(t){var n=window.getComputedStyle(t,null),r=n.getPropertyValue("-webkit-transform")||n.getPropertyValue("-moz-transform")||n.getPropertyValue("-ms-transform")||n.getPropertyValue("-o-transform")||n.getPropertyValue("transform")||"woops";"none"===r&&(r="matrix(1, 0, 0, 1, 0, 0)");var e=r.split("(")[1].split(")")[0].split(",");return e=e.map(function(t){return parseFloat(t,10)})},getTranslateX:function(t){var n=this.getTransformMatrix(t);return n[4]},getTranslateY:function(t){var n=this.getTransformMatrix(t);return n[5]},getScaleX:function(t){var n=this.getTransformMatrix(t);return Math.sqrt(Math.pow(n[0],2)+Math.pow(n[1],2))},getScaleY:function(t){var n=this.getTransformMatrix(t);return Math.sqrt(Math.pow(n[2],2)+Math.pow(n[3],2))},getRotation:function(t){var n=this.getTransformMatrix(t);return Math.round(Math.atan2(n[1],n[0])*(180/Math.PI))},getOpacity:function(t){var n=window.getComputedStyle(t,null);return parseFloat(n.getPropertyValue("opacity"))},getStartValue:function(t){var n;switch(t[1]){case"opacity":n=this.getOpacity(t[0]);break;case"translateX":n=this.getTranslateX(t[0]);break;case"translateY":n=this.getTranslateY(t[0]);break;case"scaleX":n=this.getScaleX(t[0]);break;case"scaleY":n=this.getScaleY(t[0]);break;case"rotate":n=this.getRotation(t[0]);break;default:n=0}return n}};n.exports=r},{}]},{},[1]);