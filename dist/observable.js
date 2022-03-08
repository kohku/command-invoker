"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),Object.defineProperty(a,"prototype",{writable:!1}),a}var Observable=/*#__PURE__*/function(){function a(){_classCallCheck(this,a)}return _createClass(a,[{key:"on",value:function on(a,b){return this.callbacks=this.callbacks||{},this.callbacks[a]=this.callbacks[a]||[],0>this.callbacks[a].indexOf(b)&&this.callbacks[a].push(b),this}},{key:"off",value:function off(a,b){// all
if(this.callbacks=this.callbacks||{},0===arguments.length)return this.callbacks={},this;// specific event
var c=this.callbacks[a];if(!c)return this;// remove all handlers
if(1===arguments.length)return delete this.callbacks[a],this;// remove specific handler
for(var d,e=0;e<c.length;e+=1)if(d=c[e],d===b||d.fn===b){delete c[e],c.splice(e,1);break}return this}},{key:"trigger",value:function trigger(a){this.callbacks=this.callbacks||{};var b=this.callbacks[a];if(b){b=b.slice(0);for(var c=arguments.length,d=Array(1<c?c-1:0),e=1;e<c;e++)d[e-1]=arguments[e];for(var f=0,g=b.length;f<g;f+=1)b[f].apply(this,d)}return this}}]),a}();exports["default"]=Observable;