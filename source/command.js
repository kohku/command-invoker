export default class Command {
  constructor(receiver = null, invoker = null) {
    this.receiver = receiver;
    this.invoker = invoker;
  }

  broadcast(message) {
    if (this.invoker) {
      this.invoker.trigger('event', message);
    }
  }

  // eslint-disable-next-line  no-unused-vars, class-methods-use-this
  execute(receiver, prevState, invoker) {}

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  validate(actionsPerformed, actionsToPerform) {}
}
