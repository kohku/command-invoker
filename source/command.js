
export default class Command {
  constructor(options) {
    this.invoker = undefined;
    this.options = typeof options !== 'undefined' ? options : {};
    this.fireAndForget = false;
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
    options = {},
    execute,
    validate,
    undo,
  }) {
    super(options);
    this.executeFn = typeof execute === 'function' ? execute : super.execute;
    this.validateFn = typeof validate === 'function' ? validate : super.validate;
    this.undoFn = typeof undo === 'function' ? undo : super.undo;
  }

  validate() {
    this.validateFn();
  }

  execute() {
    this.executeFn(this.options);
  }

  undo() {
    this.undoFn(this.options);
  }

  canUndo() {
    return typeof this.undoFn !== 'undefined';
  }
}
