"use strict";function _typeof(a){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}require("es6-promise/auto");var _commandInvoker=_interopRequireDefault(require("./commandInvoker")),_command=_interopRequireWildcard(require("./command")),_nullCommand=_interopRequireDefault(require("./nullCommand"));function _getRequireWildcardCache(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(_getRequireWildcardCache=function(a){return a?c:b})(a)}function _interopRequireWildcard(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!==_typeof(a)&&"function"!=typeof a)return{default:a};var c=_getRequireWildcardCache(b);if(c&&c.has(a))return c.get(a);var d={},e=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var f in a)if("default"!=f&&Object.prototype.hasOwnProperty.call(a,f)){var g=e?Object.getOwnPropertyDescriptor(a,f):null;g&&(g.get||g.set)?Object.defineProperty(d,f,g):d[f]=a[f]}return d["default"]=a,c&&c.set(a,d),d}function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var _exports=module.exports||{};_exports.CreateInvoker=function(a){return new _commandInvoker["default"](a)},_exports.CreateCommand=function(a){return new _command["default"](a)},_exports.CreateCommandWrapper=function(a){return new _command.CommandWrapper(a)},_exports.CreateUndoableCommand=function(a){return new _command.UndoableCommand(a)},_exports.CreateNullCommand=function(a){return new _nullCommand["default"](a)};