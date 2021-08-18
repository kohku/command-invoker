import Command from './command';

export default class UndoableCommand extends Command {
  // eslint-disable-next-line class-methods-use-this
  canUndo() {
    return true;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  undo(receiver, currentStatus, invoker) {}
}
