
export default class Command {
  constructor() {
    this.receiver = null;
    this.invoker = null;
  }

  broadcast(message) {
    if (this.invoker) {
      this.invoker.trigger('event', message);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  execute() {}

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  validate(actionsPerformed, actionsToPerform) {}
}

export class UndoableCommand extends Command {
  // eslint-disable-next-line class-methods-use-this
  canUndo() {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  undo() {}
}

export class CommandWrapper extends UndoableCommand {
  constructor({
    execute,
    validate,
    undo,
  }) {
    super();
    this.executeFn = typeof execute === 'function' ? execute : super.execute;
    this.validateFn = typeof validate === 'function' ? validate : super.validate;
    this.undoFn = typeof undo === 'function' ? undo : super.undo;
  }

  validate() {
    this.validateFn();
  }

  execute() {
    return this.executeFn(this.receiver, this.invoker);
  }

  undo() {
    return this.undoFn(this.receiver, this.invoker);
  }

  canUndo() {
    return typeof this.undoFn !== 'undefined';
  }
}
