import UndoableCommand from './undoableCommand';

export default class CommandWrapper extends UndoableCommand {
  constructor({
    execute,
    validate,
    undo,
  }) {
    super();
    this.executeFn = typeof execute === 'function' ? execute : super.execute;
    this.validateFn = typeof validate === 'function' ? validate : super.validate;
    this.undoFn = typeof undo === 'function' ? undo : undefined;
  }

  validate() {
    this.validateFn();
  }

  execute(receiver, prevState, invoker) {
    return this.executeFn(receiver, prevState, invoker);
  }

  undo(receiver, state, invoker) {
    return this.undoFn(receiver, state, invoker);
  }

  canUndo() {
    return typeof this.undoFn === 'function';
  }
}
