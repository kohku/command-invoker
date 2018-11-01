import Command from './command';

export default class NullCommand extends Command {
  constructor(options) {
    super(options);
    this.persistable = false;
  }
}
