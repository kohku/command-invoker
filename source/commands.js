import { Observable } from './Observable'
import { Promise } from 'es6-promise'

export class Command {
  constructor (options) {
    this.invoker = undefined
    this.options = typeof options !== 'undefined' ? options : {}
    this.async = false
  }
  execute () {
  }

  validate (actionsPerformed, actionsToPerform) {
  }
}

export class UndoableCommand extends Command {
  canUndo () {
    return true
  }
  undo () {
  }
}

export class CommandWrapper extends UndoableCommand {
  constructor (params) {
    super(params.options || {})
    this.executeFn = typeof params.execute !== 'function' ? params.execute : () => {}
    this.undoFn = typeof params.undo !== 'function' ? params.undo : undefined
  }

  execute () {
    this.executeFn()
  }

  undo () {
    this.undoFn()
  }

  canUndo () {
    return typeof this.undoFn !== 'undefined'
  }
}

export class CommandInvoker extends Observable {
  constructor (receiver) {
    super()
    this.commandChain = []
    this.commandStack = []
    this.redoStack = []
    this.receiver = receiver
  }

  // <summary>
  // Add a command to the command chain
  // </summary>
  setCommand (command) {
    if (typeof command === 'undefined' || command === 'null') {
      throw Error('Null argument exception.')
    }
    const cmd = command instanceof Command ? command : new CommandWrapper(command)
    cmd.receiver = this.receiver
    cmd.invoker = this
    this.commandChain.push(cmd)
    try {
      command.validate(this.commandStack, this.commandChain)
    } catch (e) {
      this.commandChain.pop()
      throw Error(e)
    }
    return cmd
  }

  // <summary>
  // Removes a command from the command chain
  // </summary>
  unsetCommand (command) {
    const index = this.commandChain.indexOf(command)

    if (index >= 0) {
      this.commandChain.splice(index, 1)
    }
  }

  // <summary>
  // Executes a promise for execute a single command
  // </summary>
  apply (command) {
    this.setCommand(command)
    return this.execute()
  }

  // <summary>
  // Starts execution of the command chain
  // </summary>
  execute () {
    return new Promise((resolve, reject) => {
      this.inProgress = true
      this.on('onNextCommand', this.executeNext)
      this.on('onCommandComplete', this.onCommandComplete)
      this.on('onComplete', this.onComplete.bind(this, resolve))
      this.on('onCommandFailure', this.onCommandFailure.bind(this, reject))
      this.trigger('onNextCommand')
    })
  }

  // <summary>
  // Executes next command from the command chain
  // </summary>
  executeNext () {
    if (this.commandChain.length === 0) {
      this.trigger('onComplete')
      return
    }

    const action = this.commandChain.shift()
    try {
      action.execute()
      if (!action.async) {
        this.trigger('onCommandComplete', action)
        this.trigger('onNextCommand')
      }
    } catch (e) {
      this.trigger('onCommandFailure', action, e)
    }
  }

  onCommandFailure (reject, command, error) {
    this.clear()

    if (typeof reject !== 'undefined' && typeof reject === 'function') {
      reject(error)
    }
  }

  // <summary>
  // Event triggered when a command is complete.
  // </summary>
  onCommandComplete (command) {
    if (typeof command === 'undefined' || command === null) {
      return
    }

    // a new command was executed or history was changed
    if (this.redoStack.indexOf(command) < 0 || command !== this.redoStack.pop()) {
      this.redoStack.splice(0, this.redoStack.length)
    }

    // Executed successfully
    if (this.commandStack.indexOf(command) < 0) {
      // Push it into the command stack
      this.commandStack.push(command)
    }

    this.trigger('onNextCommand')
  }

  // <summary>
  // Event triggered when there are not more commands to execute in the command chain
  // </summary>
  onComplete (resolve) {
    this.clear()

    if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
      resolve()
    }
  }

  // <summary>
  // Clear the command chain
  // </summary>
  clear () {
    this.off('onNextCommand', this.executeNext)
    this.off('onCommandComplete', this.onCommandComplete)
    this.off('onComplete', this.onComplete)
    this.off('onCommandFailure', this.onCommandFailure)
    this.commandChain.splice(0, this.commandChain.length)
    this.inProgress = false
  }

  // <summary>
  // Returns true if an undoable action is available to undo.
  // </summary>
  canUndo () {
    return !this.inProgress &&
      this.commandStack.length > 0 &&
      this.commandStack[this.commandStack.length - 1] instanceof UndoableCommand &&
      this.commandStack[this.commandStack.length - 1].canUndo()
  }

  // <summary>
  // Undo the last action, if undoable
  // </summary>
  undo () {
    return new Promise((resolve, reject) => {
      this.inProgress = true
      this.on('onUndone', this.onUndone.bind(this, resolve))
      this.on('onUndoFailed', this.onUndoFailed.bind(this, reject))
      this.undoNext()
    })
  }

  canRedo () {
    return !this.inProgress && this.redoStack.length > 0
  }

  // <summary>
  // Undo the last action, if posible
  // </summary>
  redo () {
    if (this.redoStack.length === 0) {
      throw Error('Cannot redo')
    }
    return this.apply(this.redoStack[this.redoStack.length - 1])
  }

  // <summary>
  // Undo the next undoable action, if undoable
  // </summary>
  undoNext () {
    if (!this.canUndo()) {
      return
    }

    const action = this.commandStack.pop()
    try {
      action.undo()
      if (!action.async) {
        this.trigger('onUndone', action)
      }
    } catch (e) {
      this.commandStack.push(action)
      this.trigger('onUndoFailed', action, e)
    }
  }

  // <summary>
  // Event triggered when an action was undone
  // </summary>
  onUndone (resolve, command) {
    this.off('onUndone', this.onUndone)
    this.off('onUndoFailed', this.onUndoFailed)

    if (typeof command !== 'undefined' && command !== null) {
      this.redoStack.push(command)
    }

    this.inProgress = false

    if (typeof resolve !== 'undefined' && typeof resolve === 'function') {
      resolve()
    }
  }

  onUndoFailed (reject, command, error) {
    this.off('onUndone', this.onUndone)
    this.off('onUndoFailed', this.onUndoFailed)

    this.inProgress = false

    if (typeof reject !== 'undefined' && typeof reject === 'function') {
      reject(error)
    }
  }

  // <summary>
  // Clear all actions peformed and to be performed. Clear the storage service
  // </summary>
  reset () {
    this.redoStack.splice(0, this.redoStack.length)
    this.commandStack.splice(0, this.commandStack.length)
    this.clear()
  }

  // <summary>
  // Find the latest action performed that meets the criteria (callback)
  // </summary>
  findLastAction (callback) {
    return this.commandStack.slice().reverse().find(callback)
  }

  // <summary>
  // Find all actions performed that meets the criteria (callback)
  // </summary>
  findActions (callback) {
    return this.commandStack.filter(callback)
  }
}
