import Observable from './observable';
import Command from './command';
import UndoableCommand from './undoableCommand';
import CommandWrapper from './commandWrapper';

export default class CommandInvoker extends Observable {
  constructor(receiver) {
    super();
    // commands to be executed
    this.commandChain = [];
    // commands that were executed
    this.commandStack = [];
    this.redoStack = [];
    this.receiver = receiver;
    this.continueOnFailures = false;
  }

  // <summary>
  // Add a command to the command chain
  // </summary>
  enqueueCommand(command, undoCommand) {
    if (typeof command === 'undefined' || command === 'null') {
      throw Error('Null argument exception.');
    }

    let cmd = null;
    if (command instanceof Command) {
      cmd = command;
    } else if (typeof command === 'function') {
      if (typeof undoCommand === 'function') {
        cmd = new CommandWrapper({ execute: command, undo: undoCommand });
      } else {
        cmd = new CommandWrapper({ execute: command });
      }
    } else if (typeof command === 'object') {
      cmd = new CommandWrapper(command);
    } else {
      throw new Error('Invalid argument command');
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
  dequeueCommand(command) {
    const index = this.commandChain.lastIndexOf(command);

    if (index >= 0) {
      this.commandChain.splice(index, 1);
    }
  }

  // <summary>
  // Executes a promise for execute a single command
  // </summary>
  apply(command) {
    this.enqueueCommand(command);
    return this.execute();
  }

  // <summary>
  // Starts execution of the command chain
  // </summary>
  execute(continueOnFailures = false) {
    this.continueOnFailures = continueOnFailures;
    this.inProgress = true;
    return new Promise((resolve, reject) => {
      this.on('nextCommand', this.executeNext);
      this.on('commandComplete', this.onCommandComplete);
      this.on('complete', this.onComplete.bind(this, resolve));
      this.on('commandFailure', this.onCommandFailure.bind(this, reject));
      this.trigger('start', this.commandChain.length);
      this.trigger('nextCommand');
    });
  }

  // <summary>
  // Executes next command from the command chain
  // </summary>
  executeNext(state) {
    if (this.commandChain.length === 0) {
      this.trigger('complete', state);
      return;
    }

    const action = this.commandChain.shift();

    try {
      const promise = Promise.resolve(
        action.execute(this.receiver, state, this),
      );

      promise.then((nextState) => {
        this.trigger('commandComplete', action, nextState);
      }).catch((e) => {
        this.trigger('commandFailure', action, e);
      });
    } catch (e) {
      this.trigger('commandFailure', action, e);
      Promise.reject(e);
    }
  }

  // <summary>
  // Event triggered when a command is complete.
  // </summary>
  onCommandComplete(command, state) {
    if (typeof command !== 'undefined' && command !== null) {
      // Executed successfully, push it into command stack
      this.commandStack.push(command);
    }

    this.trigger('nextCommand', state);
  }

  // <summary>
  // Event triggered when a command failed to execute.
  // </summary>
  onCommandFailure(reject, command, error) {
    if (this.continueOnFailures) {
      this.onCommandComplete(command);
      return;
    }

    this.clear();

    if (typeof reject !== 'undefined' && typeof reject === 'function') {
      reject(error);
    }
  }

  // <summary>
  // Event triggered when there are not more commands to execute in the command chain
  // </summary>
  onComplete(resolve, state) {
    this.clear();

    if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
      resolve({ receiver: this.receiver, state });
    }
  }

  // <summary>
  // Clear the command chain
  // </summary>
  clear() {
    this.off('undoNext');
    this.off('undoCompleted');
    this.off('onUndone');
    this.off('onUndoFailed');
    this.off('nextCommand');
    this.off('commandComplete');
    this.off('complete');
    this.off('commandFailure');
    this.inProgress = false;
    this.continueOnFailures = false;
  }

  // <summary>
  // Returns true if an undoable action is available to undo.
  // </summary>
  canUndo() {
    return !this.inProgress
      && this.internalCanUndo();
  }

  internalCanUndo() {
    return !this.continueOnFailures
      && this.commandStack.length > 0
      && this.commandStack[this.commandStack.length - 1] instanceof UndoableCommand
      && this.commandStack[this.commandStack.length - 1].canUndo();
  }

  // <summary>
  // Undo the last action, if undoable
  // </summary>
  undo() {
    this.inProgress = true;
    return new Promise((resolve, reject) => {
      if (!this.internalCanUndo()) {
        return reject(new Error('Nothing to undo'));
      }

      this.on('onUndone', this.onUndone.bind(this, resolve));
      this.on('onUndoFailed', this.onUndoFailed.bind(this, reject));

      const action = this.commandStack.pop();

      return Promise.resolve(action.undo(this.receiver, this))
        .then((response) => {
          this.trigger('onUndone', action, response);
        }).catch((e) => {
          this.trigger('onUndoFailed', action, e);
        }).finally(() => {
          this.inProgress = false;
        });
    });
  }

  // <summary>
  // Undo the last action, if undoable
  // </summary>
  undoAll() {
    this.inProgress = true;
    return new Promise((resolve, reject) => {
      this.on('undoNext', this.undoNext);
      this.on('undoCompleted', this.onUndoCompleted);
      this.on('onUndone', this.onUndone.bind(this, resolve));
      this.on('onUndoFailed', this.onUndoFailed.bind(this, reject));
      this.trigger('start', this.commandStack.length);
      this.trigger('undoNext', this.receiver);
    });
  }

  // <summary>
  // Undo the next undoable action, if undoable
  // </summary>
  undoNext(state) {
    if (!this.internalCanUndo()) {
      this.trigger('onUndone', state);
      return;
    }

    const action = this.commandStack.pop();

    try {
      const promise = Promise.resolve(action.undo(this.receiver, state, this));

      promise.then((nextState) => {
        this.trigger('undoCompleted', action, nextState);
      }).catch((e) => {
        this.trigger('onUndoFailed', action, e);
      });
    } catch (e) {
      this.trigger('onUndoFailed', action, e);
      Promise.reject(e);
    }
  }

  // <summary>
  // Event triggered when a command is undone.
  // </summary>
  onUndoCompleted(command, state) {
    if (typeof command !== 'undefined' && command !== null) {
      // Executed successfully, push it into redo stack
      this.redoStack.push(command);
    }

    this.trigger('undoNext', state);
  }

  // <summary>
  // Event triggered when a command failed to undo.
  // </summary>
  onUndoFailed(reject, command, error) {
    if (this.continueOnFailures) {
      this.onUndoCompleted(command);
      return;
    }

    this.clear();

    if (typeof reject !== 'undefined' && typeof reject === 'function') {
      reject(error);
    }
  }

  // <summary>
  // Event triggered when an action was undone
  // </summary>
  onUndone(resolve, command, state) {
    this.clear();

    if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
      resolve({ receiver: this.receiver, state });
    }
  }

  canRedo() {
    return !this.inProgress && this.redoStack.length > 0;
  }

  // <summary>
  // Undo the last action, if posible
  // </summary>
  redo() {
    if (this.redoStack.length === 0) {
      throw Error('Cannot redo');
    }
    return this.apply(this.redoStack[this.redoStack.length - 1]);
  }

  // <summary>
  // Clear all actions peformed and to be performed. Clear the storage service
  // </summary>
  reset() {
    this.redoStack.splice(0, this.redoStack.length);
    this.commandChain.splice(0, this.commandChain.length);
    this.commandStack.splice(0, this.commandStack.length);
    this.clear();
  }

  // <summary>
  // Find the latest action performed that meets the criteria(callback)
  // </summary>
  findLastAction(callback) {
    return this.commandStack.slice().reverse().find(callback);
  }

  // <summary>
  // Find all actions performed that meets the criteria(callback)
  // </summary>
  findActions(callback) {
    return this.commandStack.filter(callback);
  }
}
