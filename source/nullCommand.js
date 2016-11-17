import { Command } from './commands'

export class NullCommand extends Command {
  constructor (options) {
    super(options)
    this.persistable = false
  }
}
