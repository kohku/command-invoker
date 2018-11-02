'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observable = require('./observable');

var _observable2 = _interopRequireDefault(_observable);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommandInvoker = function (_Observable) {
  _inherits(CommandInvoker, _Observable);

  function CommandInvoker(receiver) {
    _classCallCheck(this, CommandInvoker);

    var _this = _possibleConstructorReturn(this, (CommandInvoker.__proto__ || Object.getPrototypeOf(CommandInvoker)).call(this));

    _this.commandChain = [];
    _this.commandStack = [];
    _this.redoStack = [];
    _this.receiver = receiver;
    return _this;
  }

  // <summary>
  // Add a command to the command chain
  // </summary>


  _createClass(CommandInvoker, [{
    key: 'enqueueCommand',
    value: function enqueueCommand(command) {
      if (typeof command === 'undefined' || command === 'null') {
        throw Error('Null argument exception.');
      }

      var cmd = null;
      if (command instanceof _command2.default) {
        cmd = command;
      } else if (typeof command === 'function') {
        cmd = new _command.CommandWrapper({ execute: command });
      } else {
        cmd = new _command.CommandWrapper(command);
      }

      cmd.receiver = this.receiver;
      cmd.invoker = this;

      this.commandChain.push(cmd);

      try {
        cmd.validate(this.commandStack, this.commandChain);
      } catch (e) {
        this.commandChain.pop();
        throw Error(e);
      }
      return cmd;
    }

    // <summary>
    // Removes a command from the command chain
    // </summary>

  }, {
    key: 'dequeueCommand',
    value: function dequeueCommand(command) {
      var index = this.commandChain.indexOf(command);

      if (index >= 0) {
        this.commandChain.splice(index, 1);
      }
    }

    // <summary>
    // Executes a promise for execute a single command
    // </summary>

  }, {
    key: 'apply',
    value: function apply(command) {
      this.enqueueCommand(command);
      return this.execute();
    }

    // <summary>
    // Starts execution of the command chain
    // </summary>

  }, {
    key: 'execute',
    value: function execute() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.inProgress = true;
        _this2.on('nextCommand', _this2.executeNext);
        _this2.on('commandComplete', _this2.onCommandComplete);
        _this2.on('complete', _this2.onComplete.bind(_this2, resolve));
        _this2.on('commandFailure', _this2.onCommandFailure.bind(_this2, reject));
        _this2.trigger('start', _this2.commandChain.length);
        _this2.trigger('nextCommand');
      });
    }

    // <summary>
    // Executes next command from the command chain
    // </summary>

  }, {
    key: 'executeNext',
    value: function executeNext() {
      var _this3 = this;

      if (this.commandChain.length === 0) {
        this.trigger('complete');
        return;
      }

      var action = this.commandChain.shift();

      try {
        var promise = Promise.resolve(action.execute());

        promise.then(function (args) {
          var _ref = args || {},
              fireAndForget = _ref.fireAndForget;

          if (!fireAndForget) {
            _this3.trigger('commandComplete', action, args);
          }
        }).catch(function (e) {
          _this3.trigger('commandFailure', action, e);
        });
      } catch (e) {
        this.trigger('commandFailure', action, e);
      }
    }

    // <summary>
    // Event triggered when a command failed to execute.
    // </summary>

  }, {
    key: 'onCommandFailure',
    value: function onCommandFailure(reject, command, error) {
      this.clear();

      if (typeof reject !== 'undefined' && typeof reject === 'function') {
        reject(error);
      }
    }

    // <summary>
    // Event triggered when a command is complete.
    // </summary>
    // eslint-disable-next-line no-unused-vars

  }, {
    key: 'onCommandComplete',
    value: function onCommandComplete(command, response) {
      if (typeof command === 'undefined' || command === null) {
        return;
      }

      // a new command was executed or history was changed
      if (this.redoStack.indexOf(command) < 0 || command !== this.redoStack.pop()) {
        this.redoStack.splice(0, this.redoStack.length);
      }

      // Executed successfully
      if (this.commandStack.indexOf(command) < 0) {
        // Push it into the command stack
        this.commandStack.push(command);
      }

      this.trigger('nextCommand');
    }

    // <summary>
    // Event triggered when there are not more commands to execute in the command chain
    // </summary>

  }, {
    key: 'onComplete',
    value: function onComplete(resolve) {
      this.clear();

      if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
        resolve();
      }
    }

    // <summary>
    // Clear the command chain
    // </summary>

  }, {
    key: 'clear',
    value: function clear() {
      this.off('nextCommand', this.executeNext);
      this.off('commandComplete', this.onCommandComplete);
      this.off('complete', this.onComplete);
      this.off('commandFailure', this.onCommandFailure);
      this.commandChain.splice(0, this.commandChain.length);
      this.inProgress = false;
    }

    // <summary>
    // Returns true if an undoable action is available to undo.
    // </summary>

  }, {
    key: 'canUndo',
    value: function canUndo() {
      return !this.inProgress && this.commandStack.length > 0 && this.commandStack[this.commandStack.length - 1] instanceof _command.UndoableCommand && this.commandStack[this.commandStack.length - 1].canUndo();
    }

    // <summary>
    // Undo the last action, if undoable
    // </summary>

  }, {
    key: 'undo',
    value: function undo() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.inProgress = true;
        _this4.on('onUndone', _this4.onUndone.bind(_this4, resolve));
        _this4.on('onUndoFailed', _this4.onUndoFailed.bind(_this4, reject));
        _this4.undoNext();
      });
    }
  }, {
    key: 'canRedo',
    value: function canRedo() {
      return !this.inProgress && this.redoStack.length > 0;
    }

    // <summary>
    // Undo the last action, if posible
    // </summary>

  }, {
    key: 'redo',
    value: function redo() {
      if (this.redoStack.length === 0) {
        throw Error('Cannot redo');
      }
      return this.apply(this.redoStack[this.redoStack.length - 1]);
    }

    // <summary>
    // Undo the next undoable action, if undoable
    // </summary>

  }, {
    key: 'undoNext',
    value: function undoNext() {
      var _this5 = this;

      if (!this.canUndo()) {
        return;
      }

      var action = this.commandStack.pop();
      try {
        var value = action.undo();

        var promise = Promise.resolve(value);

        promise.then(function () {
          _this5.trigger('onUndone', action);
        }).catch(function (e) {
          _this5.trigger('onUndoFailed', action, e);
        });
      } catch (e) {
        this.commandStack.push(action);
        this.trigger('onUndoFailed', action, e);
      }
    }

    // <summary>
    // Event triggered when an action was undone
    // </summary>

  }, {
    key: 'onUndone',
    value: function onUndone(resolve, command) {
      this.off('onUndone', this.onUndone);
      this.off('onUndoFailed', this.onUndoFailed);

      if (typeof command !== 'undefined' && command !== null) {
        this.redoStack.push(command);
      }

      this.inProgress = false;

      if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
        resolve();
      }
    }
  }, {
    key: 'onUndoFailed',
    value: function onUndoFailed(reject, command, error) {
      this.off('onUndone', this.onUndone);
      this.off('onUndoFailed', this.onUndoFailed);

      this.inProgress = false;

      if (typeof reject !== 'undefined' && typeof reject === 'function') {
        reject(error);
      }
    }

    // <summary>
    // Clear all actions peformed and to be performed. Clear the storage service
    // </summary>

  }, {
    key: 'reset',
    value: function reset() {
      this.redoStack.splice(0, this.redoStack.length);
      this.commandStack.splice(0, this.commandStack.length);
      this.clear();
    }

    // <summary>
    // Find the latest action performed that meets the criteria(callback)
    // </summary>

  }, {
    key: 'findLastAction',
    value: function findLastAction(callback) {
      return this.commandStack.slice().reverse().find(callback);
    }

    // <summary>
    // Find all actions performed that meets the criteria(callback)
    // </summary>

  }, {
    key: 'findActions',
    value: function findActions(callback) {
      return this.commandStack.filter(callback);
    }
  }]);

  return CommandInvoker;
}(_observable2.default);

exports.default = CommandInvoker;