"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _observable=_interopRequireDefault(require("./observable")),_command=_interopRequireWildcard(require("./command"));function _getRequireWildcardCache(){if("function"!=typeof WeakMap)return null;var a=new WeakMap;return _getRequireWildcardCache=function(){return a},a}function _interopRequireWildcard(a){if(a&&a.__esModule)return a;var b=_getRequireWildcardCache();if(b&&b.has(a))return b.get(a);var c={};if(null!=a){var d=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var e in a)if(Object.prototype.hasOwnProperty.call(a,e)){var f=d?Object.getOwnPropertyDescriptor(a,e):null;f&&(f.get||f.set)?Object.defineProperty(c,e,f):c[e]=a[e]}}return c["default"]=a,b&&b.set(a,c),c}function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _typeof(a){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}function _possibleConstructorReturn(a,b){return b&&("object"===_typeof(b)||"function"==typeof b)?b:_assertThisInitialized(a)}function _assertThisInitialized(a){if(void 0===a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function _getPrototypeOf(a){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},_getPrototypeOf(a)}function _inherits(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),b&&_setPrototypeOf(a,b)}function _setPrototypeOf(a,b){return _setPrototypeOf=Object.setPrototypeOf||function(a,b){return a.__proto__=b,a},_setPrototypeOf(a,b)}var CommandInvoker=/*#__PURE__*/function(a){function b(a){var c;return _classCallCheck(this,b),c=_possibleConstructorReturn(this,_getPrototypeOf(b).call(this)),c.commandChain=[],c.commandStack=[],c.redoStack=[],c.receiver=a,c.continueOnFailures=!1,c}// <summary>
// Add a command to the command chain
// </summary>
return _inherits(b,a),_createClass(b,[{key:"enqueueCommand",value:function enqueueCommand(a){if("undefined"==typeof a||"null"===a)throw Error("Null argument exception.");var b=null;b=a instanceof _command["default"]?a:"function"==typeof a?new _command.CommandWrapper({execute:a}):new _command.CommandWrapper(a),b.receiver=this.receiver,b.invoker=this,this.commandChain.push(b);try{b.validate(this.commandStack,this.commandChain)}catch(a){throw this.commandChain.pop(),Error(a)}return b}// <summary>
// Removes a command from the command chain
// </summary>
},{key:"dequeueCommand",value:function dequeueCommand(a){var b=this.commandChain.indexOf(a);0<=b&&this.commandChain.splice(b,1)}// <summary>
// Executes a promise for execute a single command
// </summary>
},{key:"apply",value:function apply(a){return this.enqueueCommand(a),this.execute()}// <summary>
// Starts execution of the command chain
// </summary>
},{key:"execute",value:function execute(){var a=this,b=!!(0<arguments.length&&void 0!==arguments[0])&&arguments[0];return this.continueOnFailures=b,new Promise(function(b,c){a.inProgress=!0,a.on("nextCommand",a.executeNext),a.on("commandComplete",a.onCommandComplete),a.on("complete",a.onComplete.bind(a,b)),a.on("commandFailure",a.onCommandFailure.bind(a,c)),a.trigger("start",a.commandChain.length),a.trigger("nextCommand")})}// <summary>
// Executes next command from the command chain
// </summary>
},{key:"executeNext",value:function executeNext(){var a=this;if(0===this.commandChain.length)return void this.trigger("complete");var b=this.commandChain.shift();try{var c=Promise.resolve(b.execute());c.then(function(c){a.trigger("commandComplete",b,c)})["catch"](function(c){a.trigger("commandFailure",b,c)})}catch(a){this.trigger("commandFailure",b,a)}}// <summary>
// Event triggered when a command failed to execute.
// </summary>
},{key:"onCommandFailure",value:function onCommandFailure(a,b,c){return this.continueOnFailures?void this.onCommandComplete(b):void(this.clear(),"undefined"!=typeof a&&"function"==typeof a&&a(c))}// <summary>
// Event triggered when a command is complete.
// </summary>
},{key:"onCommandComplete",value:function onCommandComplete(a){"undefined"==typeof a||null===a||((0>this.redoStack.indexOf(a)||a!==this.redoStack.pop())&&this.redoStack.splice(0,this.redoStack.length),0>this.commandStack.indexOf(a)&&this.commandStack.push(a),this.trigger("nextCommand"))}// <summary>
// Event triggered when there are not more commands to execute in the command chain
// </summary>
},{key:"onComplete",value:function onComplete(a){this.clear(),"undefined"!=typeof a&&"function"==typeof a&&a()}// <summary>
// Clear the command chain
// </summary>
},{key:"clear",value:function clear(){this.off("nextCommand",this.executeNext),this.off("commandComplete",this.onCommandComplete),this.off("complete",this.onComplete),this.off("commandFailure",this.onCommandFailure),this.commandChain.splice(0,this.commandChain.length),this.inProgress=!1}// <summary>
// Returns true if an undoable action is available to undo.
// </summary>
},{key:"canUndo",value:function canUndo(){return!this.inProgress&&0<this.commandStack.length&&this.commandStack[this.commandStack.length-1]instanceof _command.UndoableCommand&&this.commandStack[this.commandStack.length-1].canUndo()}// <summary>
// Undo the last action, if undoable
// </summary>
},{key:"undo",value:function undo(){var a=this;return new Promise(function(b,c){a.inProgress=!0,a.on("onUndone",a.onUndone.bind(a,b)),a.on("onUndoFailed",a.onUndoFailed.bind(a,c)),a.undoNext()})}},{key:"canRedo",value:function canRedo(){return!this.inProgress&&0<this.redoStack.length}// <summary>
// Undo the last action, if posible
// </summary>
},{key:"redo",value:function redo(){if(0===this.redoStack.length)throw Error("Cannot redo");return this.apply(this.redoStack[this.redoStack.length-1])}// <summary>
// Undo the next undoable action, if undoable
// </summary>
},{key:"undoNext",value:function undoNext(){var a=this;if(this.canUndo()){var b=this.commandStack.pop();try{var c=b.undo(),d=Promise.resolve(c);d.then(function(){a.trigger("onUndone",b)})["catch"](function(c){a.trigger("onUndoFailed",b,c)})}catch(a){this.commandStack.push(b),this.trigger("onUndoFailed",b,a)}}}// <summary>
// Event triggered when an action was undone
// </summary>
},{key:"onUndone",value:function onUndone(a,b){this.off("onUndone",this.onUndone),this.off("onUndoFailed",this.onUndoFailed),"undefined"!=typeof b&&null!==b&&this.redoStack.push(b),this.inProgress=!1,"undefined"!=typeof a&&"function"==typeof a&&a()}},{key:"onUndoFailed",value:function onUndoFailed(a,b,c){this.off("onUndone",this.onUndone),this.off("onUndoFailed",this.onUndoFailed),this.inProgress=!1,"undefined"!=typeof a&&"function"==typeof a&&a(c)}// <summary>
// Clear all actions peformed and to be performed. Clear the storage service
// </summary>
},{key:"reset",value:function reset(){this.redoStack.splice(0,this.redoStack.length),this.commandStack.splice(0,this.commandStack.length),this.clear()}// <summary>
// Find the latest action performed that meets the criteria(callback)
// </summary>
},{key:"findLastAction",value:function findLastAction(a){return this.commandStack.slice().reverse().find(a)}// <summary>
// Find all actions performed that meets the criteria(callback)
// </summary>
},{key:"findActions",value:function findActions(a){return this.commandStack.filter(a)}}]),b}(_observable["default"]);exports["default"]=CommandInvoker;