'use strict';

var _commandInvoker = require('./commandInvoker');

var _commandInvoker2 = _interopRequireDefault(_commandInvoker);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

var _nullCommand = require('./nullCommand');

var _nullCommand2 = _interopRequireDefault(_nullCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _exports = module.exports || {};

_exports.CreateInvoker = function (receiver) {
  return new _commandInvoker2.default(receiver);
};

_exports.CreateCommand = function (options) {
  return new _command2.default(options);
};

_exports.CreateCommandWrapper = function (options) {
  return new _command.CommandWrapper(options);
};

_exports.CreateUndoableCommand = function (options) {
  return new _command.UndoableCommand(options);
};

_exports.CreateNullCommand = function (options) {
  return new _nullCommand2.default(options);
};