'use strict';

var _commandInvoker = require('./commandInvoker');

var _commandInvoker2 = _interopRequireDefault(_commandInvoker);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

var _nullCommand = require('./nullCommand');

var _nullCommand2 = _interopRequireDefault(_nullCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _exports = module.exports || {};

_exports.CommandInvoker = function (receiver) {
  return new _commandInvoker2.default(receiver);
};

_exports.Command = function (options) {
  return new _command2.default(options);
};

_exports.CommandWrapper = function (options) {
  return new _command.CommandWrapper(options);
};

_exports.UndoableCommand = function (options) {
  return new _command.UndoableCommand(options);
};

_exports.NullCommand = function (options) {
  return new _nullCommand2.default(options);
};