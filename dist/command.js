"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var Command=/*#__PURE__*/function(){function a(){var b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,c=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;_classCallCheck(this,a),this.receiver=b,this.invoker=c}return _createClass(a,[{key:"broadcast",value:function broadcast(a){this.invoker&&this.invoker.trigger("event",a)}// eslint-disable-next-line  no-unused-vars, class-methods-use-this
},{key:"execute",value:function execute(){}// eslint-disable-next-line no-unused-vars, class-methods-use-this
},{key:"validate",value:function validate(){}}]),a}();exports["default"]=Command;