"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _observable=_interopRequireDefault(require("./observable")),_command=_interopRequireDefault(require("./command")),_undoableCommand=_interopRequireDefault(require("./undoableCommand")),_commandWrapper=_interopRequireDefault(require("./commandWrapper"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _typeof(a){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,_toPropertyKey(c.key),c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),Object.defineProperty(a,"prototype",{writable:!1}),a}function _toPropertyKey(a){var b=_toPrimitive(a,"string");return"symbol"===_typeof(b)?b:b+""}function _toPrimitive(a,b){if("object"!==_typeof(a)||null===a)return a;var c=a[Symbol.toPrimitive];if(c!==void 0){var d=c.call(a,b||"default");if("object"!==_typeof(d))return d;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===b?String:Number)(a)}function _inherits(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),Object.defineProperty(a,"prototype",{writable:!1}),b&&_setPrototypeOf(a,b)}function _setPrototypeOf(a,b){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(a,b){return a.__proto__=b,a},_setPrototypeOf(a,b)}function _createSuper(a){var b=_isNativeReflectConstruct();return function(){var c,d=_getPrototypeOf(a);if(b){var e=_getPrototypeOf(this).constructor;c=Reflect.construct(d,arguments,e)}else c=d.apply(this,arguments);return _possibleConstructorReturn(this,c)}}function _possibleConstructorReturn(a,b){if(b&&("object"===_typeof(b)||"function"==typeof b))return b;if(void 0!==b)throw new TypeError("Derived constructors may only return object or undefined");return _assertThisInitialized(a)}function _assertThisInitialized(a){if(void 0===a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(a){return!1}}function _getPrototypeOf(a){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(a){return a.__proto__||Object.getPrototypeOf(a)},_getPrototypeOf(a)}var CommandInvoker=/*#__PURE__*/function(a){function b(a){var d;return _classCallCheck(this,b),d=c.call(this),d.commandChain=[],d.commandStack=[],d.redoStack=[],d.receiver=a,d.continueOnFailures=!1,d}// <summary>
// Add a command to the command chain
// </summary>
_inherits(b,a);var c=_createSuper(b);return _createClass(b,[{key:"enqueueCommand",value:function enqueueCommand(a,b){if("undefined"==typeof a||"null"===a)throw Error("Null argument exception.");var c=null;if(a instanceof _command["default"])c=a;else if("function"==typeof a)c="function"==typeof b?new _commandWrapper["default"]({execute:a,undo:b}):new _commandWrapper["default"]({execute:a});else if("object"===_typeof(a))c=new _commandWrapper["default"](a);else throw new Error("Invalid argument command");c.receiver=this.receiver,c.invoker=this,this.commandChain.push(c);try{c.validate(this.commandStack,this.commandChain)}catch(a){throw this.commandChain.pop(),Error(a)}return c}// <summary>
// Removes a command from the command chain
// </summary>
},{key:"dequeueCommand",value:function dequeueCommand(a){var b=this.commandChain.lastIndexOf(a);0<=b&&this.commandChain.splice(b,1)}// <summary>
// Executes a promise for execute a single command
// </summary>
},{key:"apply",value:function apply(a){return this.enqueueCommand(a),this.execute()}// <summary>
// Starts execution of the command chain
// </summary>
},{key:"execute",value:function execute(){var a=this,b=!!(0<arguments.length&&void 0!==arguments[0])&&arguments[0];return this.continueOnFailures=b,this.inProgress=!0,new Promise(function(b,c){a.on("nextCommand",a.executeNext),a.on("commandComplete",a.onCommandComplete),a.on("complete",a.onComplete.bind(a,b)),a.on("commandFailure",a.onCommandFailure.bind(a,c)),a.trigger("start",a.commandChain.length),a.trigger("nextCommand")})}// <summary>
// Executes next command from the command chain
// </summary>
},{key:"executeNext",value:function executeNext(a){var b=this;if(0===this.commandChain.length)return void this.trigger("complete",a);var c=this.commandChain.shift();try{var d=Promise.resolve(c.execute(this.receiver,a,this));d.then(function(a){b.trigger("commandComplete",c,a)})["catch"](function(a){b.trigger("commandFailure",c,a)})}catch(a){this.trigger("commandFailure",c,a),Promise.reject(a)}}// <summary>
// Event triggered when a command is complete.
// </summary>
},{key:"onCommandComplete",value:function onCommandComplete(a,b){"undefined"!=typeof a&&null!==a&&this.commandStack.push(a),this.trigger("nextCommand",b)}// <summary>
// Event triggered when a command failed to execute.
// </summary>
},{key:"onCommandFailure",value:function onCommandFailure(a,b,c){return this.continueOnFailures?void this.onCommandComplete(b):void(this.clear(),"undefined"!=typeof a&&"function"==typeof a&&a(c))}// <summary>
// Event triggered when there are not more commands to execute in the command chain
// </summary>
},{key:"onComplete",value:function onComplete(a,b){this.clear(),"undefined"!=typeof a&&"function"==typeof a&&a({receiver:this.receiver,state:b})}// <summary>
// Clear the command chain
// </summary>
},{key:"clear",value:function clear(){this.off("undoNext"),this.off("undoCompleted"),this.off("onUndone"),this.off("onUndoFailed"),this.off("nextCommand"),this.off("commandComplete"),this.off("complete"),this.off("commandFailure"),this.inProgress=!1,this.continueOnFailures=!1}// <summary>
// Returns true if an undoable action is available to undo.
// </summary>
},{key:"canUndo",value:function canUndo(){return!this.inProgress&&this.internalCanUndo()}},{key:"internalCanUndo",value:function internalCanUndo(){return!this.continueOnFailures&&0<this.commandStack.length&&this.commandStack[this.commandStack.length-1]instanceof _undoableCommand["default"]&&this.commandStack[this.commandStack.length-1].canUndo()}// <summary>
// Undo the last action, if undoable
// </summary>
},{key:"undo",value:function undo(){var a=this;return this.inProgress=!0,new Promise(function(b,c){if(!a.internalCanUndo())return c(new Error("Nothing to undo"));a.on("onUndone",a.onUndone.bind(a,b)),a.on("onUndoFailed",a.onUndoFailed.bind(a,c));var d=a.commandStack.pop();return Promise.resolve(d.undo(a.receiver,a)).then(function(b){a.trigger("onUndone",d,b)})["catch"](function(b){a.trigger("onUndoFailed",d,b)})["finally"](function(){a.inProgress=!1})})}// <summary>
// Undo the last action, if undoable
// </summary>
},{key:"undoAll",value:function undoAll(){var a=this;return this.inProgress=!0,new Promise(function(b,c){a.on("undoNext",a.undoNext),a.on("undoCompleted",a.onUndoCompleted),a.on("onUndone",a.onUndone.bind(a,b)),a.on("onUndoFailed",a.onUndoFailed.bind(a,c)),a.trigger("start",a.commandStack.length),a.trigger("undoNext")})}// <summary>
// Undo the next undoable action, if undoable
// </summary>
},{key:"undoNext",value:function undoNext(a){var b=this;if(!this.internalCanUndo())return void this.trigger("onUndone",a);var c=this.commandStack.pop();try{var d=Promise.resolve(c.undo());d.then(function(a){b.trigger("undoCompleted",c,a)})["catch"](function(a){b.trigger("onUndoFailed",c,a)})}catch(a){this.trigger("onUndoFailed",c,a),Promise.reject(a)}}// <summary>
// Event triggered when a command is undone.
// </summary>
},{key:"onUndoCompleted",value:function onUndoCompleted(a,b){"undefined"!=typeof a&&null!==a&&this.redoStack.push(a),this.trigger("undoNext",b)}// <summary>
// Event triggered when a command failed to undo.
// </summary>
},{key:"onUndoFailed",value:function onUndoFailed(a,b,c){this.clear(),"undefined"!=typeof a&&"function"==typeof a&&a(c)}// <summary>
// Event triggered when an action was undone
// </summary>
},{key:"onUndone",value:function onUndone(a,b,c){this.clear(),"undefined"!=typeof a&&"function"==typeof a&&a({receiver:this.receiver,state:c})}},{key:"canRedo",value:function canRedo(){return!this.inProgress&&0<this.redoStack.length}// <summary>
// Undo the last action, if posible
// </summary>
},{key:"redo",value:function redo(){if(0===this.redoStack.length)throw Error("Cannot redo");return this.apply(this.redoStack[this.redoStack.length-1])}// <summary>
// Clear all actions peformed and to be performed. Clear the storage service
// </summary>
},{key:"reset",value:function reset(){this.redoStack.splice(0,this.redoStack.length),this.commandChain.splice(0,this.commandChain.length),this.commandStack.splice(0,this.commandStack.length),this.clear()}// <summary>
// Find the latest action performed that meets the criteria(callback)
// </summary>
},{key:"findLastAction",value:function findLastAction(a){return this.commandStack.slice().reverse().find(a)}// <summary>
// Find all actions performed that meets the criteria(callback)
// </summary>
},{key:"findActions",value:function findActions(a){return this.commandStack.filter(a)}}]),b}(_observable["default"]);exports["default"]=CommandInvoker;