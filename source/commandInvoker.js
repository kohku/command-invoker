import Observable from './observable';
import Command, { UndoableCommand, CommandWrapper } from './command';

export default class CommandInvoker extends Observable {
  constructor(receiver) {
    super();
    this.commandChain = [];
    this.commandStack = [];
    this.redoStack = [];
    this.receiver = receiver;
  }

  // <summary>
  // Add a command to the command chain
  // </summary>
  enqueueCommand(command) {
    if (typeof command === 'undefined' || command === 'null') {
      throw Error('Null argument exception.');
    }

    let cmd = null;
    if (command instanceof Command) {
      cmd = command;
    } else if (typeof command === 'function') {
      cmd = new CommandWrapper({ execute: command });
    } else {
      cmd = new CommandWrapper(command);
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
    const index = this.commandChain.indexOf(command);

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
  execute() {
    return new Promise((resolve, reject) => {
      this.inProgress = true;
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
  executeNext() {
    if (this.commandChain.length === 0) {
      this.trigger('complete');
      return;
    }

    const action = this.commandChain.shift();

    try {
      const promise = Promise.resolve(action.execute());

      promise.then(() => {
        this.trigger('commandComplete', action);
      }).catch((e) => {
        this.trigger('commandFailure', action, e);
      });
    } catch (e) {
      this.trigger('commandFailure', action, e);
    }
  }

  // <summary>
  // Event triggered when a command failed to execute.
  // </summary>
  onCommandFailure(reject, command, error) {
    this.clear();

    if (typeof reject !== 'undefined' && typeof reject === 'function') {
      reject(error);
    }
  }

  // <summary>
  // Event triggered when a command is complete.
  // </summary>
  onCommandComplete(command) {
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
  onComplete(resolve) {
    this.clear();

    if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
      resolve();
    }
  }

  // <summary>
  // Clear the command chain
  // </summary>
  clear() {
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
  canUndo() {
    return !this.inProgress
      && this.commandStack.length > 0
      && this.commandStack[this.commandStack.length - 1] instanceof UndoableCommand
      && this.commandStack[this.commandStack.length - 1].canUndo();
  }

  // <summary>
  // Undo the last action, if undoable
  // </summary>
  undo() {
    return new Promise((resolve, reject) => {
      this.inProgress = true;
      this.on('onUndone', this.onUndone.bind(this, resolve));
      this.on('onUndoFailed', this.onUndoFailed.bind(this, reject));
      this.undoNext();
    });
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
  // Undo the next undoable action, if undoable
  // </summary>
  undoNext() {
    if (!this.canUndo()) {
      return;
    }

    const action = this.commandStack.pop();
    try {
      const value = action.undo();

      const promise = Promise.resolve(value);

      promise.then(() => {
        this.trigger('onUndone', action);
      }).catch((e) => {
        this.trigger('onUndoFailed', action, e);
      });
    } catch (e) {
      this.commandStack.push(action);
      this.trigger('onUndoFailed', action, e);
    }
  }

  // <summary>
  // Event triggered when an action was undone
  // </summary>
  onUndone(resolve, command) {
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

  onUndoFailed(reject, command, error) {
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
  reset() {
    this.redoStack.splice(0, this.redoStack.length);
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
