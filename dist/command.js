"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.CommandWrapper=exports.UndoableCommand=exports.default=void 0;function _typeof(a){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}function _get(a,b,c){return _get="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(a,b,c){var d=_superPropBase(a,b);if(d){var e=Object.getOwnPropertyDescriptor(d,b);return e.get?e.get.call(c):e.value}},_get(a,b,c||a)}function _superPropBase(a,b){for(;!Object.prototype.hasOwnProperty.call(a,b)&&(a=_getPrototypeOf(a),null!==a););return a}function _possibleConstructorReturn(a,b){return b&&("object"===_typeof(b)||"function"==typeof b)?b:_assertThisInitialized(a)}function _assertThisInitialized(a){if(void 0===a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function _getPrototypeOf(a){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},_getPrototypeOf(a)}function _inherits(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),b&&_setPrototypeOf(a,b)}function _setPrototypeOf(a,b){return _setPrototypeOf=Object.setPrototypeOf||function(a,b){return a.__proto__=b,a},_setPrototypeOf(a,b)}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var Command=/*#__PURE__*/function(){function a(){_classCallCheck(this,a),this.receiver=null,this.invoker=null}return _createClass(a,[{key:"broadcast",value:function b(a){this.invoker&&this.invoker.trigger("event",a)}// eslint-disable-next-line class-methods-use-this
},{key:"execute",value:function a(){}// eslint-disable-next-line no-unused-vars, class-methods-use-this
},{key:"validate",value:function a(){}}]),a}();exports.default=Command;var UndoableCommand=/*#__PURE__*/function(a){function b(){return _classCallCheck(this,b),_possibleConstructorReturn(this,_getPrototypeOf(b).apply(this,arguments))}return _inherits(b,a),_createClass(b,[{key:"canUndo",// eslint-disable-next-line class-methods-use-this
value:function a(){return!0}// eslint-disable-next-line class-methods-use-this
},{key:"undo",value:function a(){}}]),b}(Command);exports.UndoableCommand=UndoableCommand;var CommandWrapper=/*#__PURE__*/function(a){function b(a){var c,d=a.execute,e=a.validate,f=a.undo;return _classCallCheck(this,b),c=_possibleConstructorReturn(this,_getPrototypeOf(b).call(this)),c.executeFn="function"==typeof d?d:_get(_getPrototypeOf(b.prototype),"execute",_assertThisInitialized(c)),c.validateFn="function"==typeof e?e:_get(_getPrototypeOf(b.prototype),"validate",_assertThisInitialized(c)),c.undoFn="function"==typeof f?f:_get(_getPrototypeOf(b.prototype),"undo",_assertThisInitialized(c)),c}return _inherits(b,a),_createClass(b,[{key:"validate",value:function a(){this.validateFn()}},{key:"execute",value:function a(){return this.executeFn(this.receiver,this.invoker)}},{key:"undo",value:function a(){return this.undoFn(this.receiver,this.invoker)}},{key:"canUndo",value:function a(){return"undefined"!=typeof this.undoFn}}]),b}(UndoableCommand);exports.CommandWrapper=CommandWrapper;