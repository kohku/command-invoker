'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = function () {
  function Command() {
    _classCallCheck(this, Command);

    this.receiver = null;
    this.invoker = null;
  }

  _createClass(Command, [{
    key: 'broadcast',
    value: function broadcast(message) {
      if (this.invoker) {
        this.invoker.trigger('event', message);
      }
    }

    // eslint-disable-next-line class-methods-use-this

  }, {
    key: 'execute',
    value: function execute() {}

    // eslint-disable-next-line no-unused-vars, class-methods-use-this

  }, {
    key: 'validate',
    value: function validate(actionsPerformed, actionsToPerform) {}
  }]);

  return Command;
}();

exports.default = Command;

var UndoableCommand = exports.UndoableCommand = function (_Command) {
  _inherits(UndoableCommand, _Command);

  function UndoableCommand() {
    _classCallCheck(this, UndoableCommand);

    return _possibleConstructorReturn(this, (UndoableCommand.__proto__ || Object.getPrototypeOf(UndoableCommand)).apply(this, arguments));
  }

  _createClass(UndoableCommand, [{
    key: 'canUndo',

    // eslint-disable-next-line class-methods-use-this
    value: function canUndo() {
      return true;
    }

    // eslint-disable-next-line class-methods-use-this

  }, {
    key: 'undo',
    value: function undo() {}
  }]);

  return UndoableCommand;
}(Command);

var CommandWrapper = exports.CommandWrapper = function (_UndoableCommand) {
  _inherits(CommandWrapper, _UndoableCommand);

  function CommandWrapper(_ref) {
    var execute = _ref.execute,
        validate = _ref.validate,
        undo = _ref.undo;

    _classCallCheck(this, CommandWrapper);

    var _this2 = _possibleConstructorReturn(this, (CommandWrapper.__proto__ || Object.getPrototypeOf(CommandWrapper)).call(this));

    _this2.executeFn = typeof execute === 'function' ? execute : _get(CommandWrapper.prototype.__proto__ || Object.getPrototypeOf(CommandWrapper.prototype), 'execute', _this2);
    _this2.validateFn = typeof validate === 'function' ? validate : _get(CommandWrapper.prototype.__proto__ || Object.getPrototypeOf(CommandWrapper.prototype), 'validate', _this2);
    _this2.undoFn = typeof undo === 'function' ? undo : _get(CommandWrapper.prototype.__proto__ || Object.getPrototypeOf(CommandWrapper.prototype), 'undo', _this2);
    return _this2;
  }

  _createClass(CommandWrapper, [{
    key: 'validate',
    value: function validate() {
      this.validateFn();
    }
  }, {
    key: 'execute',
    value: function execute() {
      return this.executeFn(this.receiver, this.invoker);
    }
  }, {
    key: 'undo',
    value: function undo() {
      return this.undoFn(this.receiver, this.invoker);
    }
  }, {
    key: 'canUndo',
    value: function canUndo() {
      return typeof this.undoFn !== 'undefined';
    }
  }]);

  return CommandWrapper;
}(UndoableCommand);