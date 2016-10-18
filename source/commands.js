import { Observable } from './Observable'
import { Promise } from 'es6-promise'
 
export class Command {
    constructor(options){
      this.invoker = undefined
      this.options = typeof options !== 'undefined' ? options : {}
      this.async = false
      this.persistable = true
    }
    execute(){
    }
 
    validate(actionsPerformed, actionsToPerform){
    }
}
 
export class UndoableCommand extends Command {
    constructor(options){
        super(options)
    }
    canUndo(){
      return true;
    }
    undo(){
    }
}
 
export class CommandInvoker extends Observable {
 
  constructor(receiver, storage){
    super()
    this.commandChain = []
    this.commandStack = []
    this.redoStack = []
    this.receiver = receiver
    this.storage = storage
  }
 
  // <summary>
  // Returns an array with actions persisted to the storage service
  // </summary>
  restore(availableCommands){
    let macro = []
    if (!Array.isArray(availableCommands) || availableCommands.length === 0)
      return
 
    if (typeof this.storage !== 'undefined' && this.storage !== null ){
      let items = this.storage.getAll()
      items.forEach(commandInfo => {
        let command = null
        for(let cmdIndex = 0; cmdIndex < availableCommands.length; cmdIndex++){
          if (commandInfo.type === availableCommands[cmdIndex].name){
            command = availableCommands[cmdIndex];
            break;
          }
        }
        if (command === null){
          throw Error(`The command ${commandInfo.type} is not defined within the commands parameters`)
        }
        var action = Object.create(command.prototype)
        action.constructor(commandInfo.options)
        macro.push(action)
      })
      this.storage.clear()
    }
    return macro
  }
 
  // <summary>
  // Add a command to the command chain
  // </summary>
  setCommand(command){
    command.receiver = this.receiver
    command.invoker = this;
    this.commandChain.push(command);
    try {
      command.validate(this.commandStack, this.commandChain)
    }
    catch(e){
      this.commandChain.pop()
      throw Error(e)
    }
    return command;
  }
 
  // <summary>
  // Removes a command from the command chain
  // </summary>
  unsetCommand(command){
    let index = this.commandChain.indexOf(command);
 
    if (index >= 0){
      this.commandChain.splice(index, 1);
    }
  }
 
  // <summary>
  // Executes a promise for execute a single command
  // </summary>
  apply(command){
    this.setCommand(command)
    return this.execute()
  }
 
  // <summary>
  // Starts execution of the command chain
  // </summary>
  execute(){
    return new Promise((resolveCallback, rejectCallback) => {
      this.resolveCallback = resolveCallback
      this.rejectCallback = rejectCallback
      this.on('onNextCommand', this.executeNext)
      this.on('onCommandComplete', this.onCommandComplete)
      this.on('onComplete', this.onComplete)
      this.on('onCommandFailure', this.onCommandFailure)
      this.inProgress = true
      this.trigger('onNextCommand')
    })
  }
 
  // <summary>
  // Executes next command from the command chain
  // </summary>
  executeNext(){
    if (this.commandChain.length === 0){
      this.trigger('onComplete');
      return
    }
 
    let action = this.commandChain.shift()
    try {
      action.execute()
      if (!action.async){
        this.trigger('onCommandComplete', action)
        this.trigger('onNextCommand')
      }
    }
    catch(e){
      this.trigger('onCommandFailure', action, e)
    }
  }
 
  onCommandFailure(command, error){
    if (typeof this.rejectCallback !== 'undefined' &&
      typeof this.rejectCallback === 'function'){
      this.rejectCallback(error)
    }
    this.clear()
  }
 
  // <summary>
  // Event triggered when a command is complete.
  // </summary>
  onCommandComplete(command){
    if (typeof command === 'undefined' || command === null)
      return
 
    // a new command was executed or history was changed
    if (this.redoStack.indexOf(command) < 0 || command !== this.redoStack.pop()){
      this.redoStack.splice(0, this.redoStack.length)
    }
 
    // Executed successfully
    if (this.commandStack.indexOf(command) < 0){
      // Push it into the command stack
      this.commandStack.push(command)
      // Avoid to send it to storage service if it's already there.
      if (typeof command.persistable !== 'undefined' && command.persistable &&
        typeof this.storage !== 'undefined' && this.storage !== null){
        var index = this.storage.getAll().length
        this.storage.addItem(index, {
          type: command.constructor.name,
          options: command.options
        })
      }
    }
 
    this.trigger('onNextCommand')
  }
 
  // <summary>
  // Event triggered when there are not more commands to execute in the command chain
  // </summary>
  onComplete(){
    if (typeof this.resolveCallback !== 'undefined' &&
      typeof this.resolveCallback === 'function'){
      this.resolveCallback()
    }
    this.clear()
  }
 
  // <summary>
  // Clear the command chain
  // </summary>
  clear(){
    this.off('onNextCommand', this.executeNext)
    this.off('onCommandComplete', this.onCommandComplete)
    this.off('onComplete', this.onComplete)
    this.off('onCommandFailure', this.onCommandFailure)
    this.commandChain.splice(0, this.commandChain.length)
    this.resolveCallback = null
    this.rejectCallback = null
    this.inProgress = false
  }
 
  // <summary>
  // Returns true if an undoable action is available to undo.
  // </summary>
  canUndo(){
    return this.commandStack.length > 0 &&
      this.commandStack[this.commandStack.length-1] instanceof UndoableCommand &&
      !this.inProgress &&
      this.commandStack[this.commandStack.length-1].canUndo();
  }
 
  // <summary>
  // Undo the last action, if undoable
  // </summary>
  undo(){
    return new Promise((resolveCallback, rejectCallback) => {
      this.resolveCallback = resolveCallback
      this.rejectCallback = rejectCallback
      if (!this.inProgress){
        this.on('onUndone', this.onUndone)
        this.on('onUndoFailed', this.onUndoFailed)
        this.undoNext()
      }
    })
  }
 
  canRedo(){
    return this.redoStack.length > 0 && !this.inProgress
  }
 
  // <summary>
  // Undo the last action, if posible
  // </summary>
  redo(){
    if (this.redoStack.length === 0){
      throw Error('Cannot redo')
    }
    return this.apply(this.redoStack[this.redoStack.length - 1])
  }
 
  // <summary>
  // Undo the next undoable action, if undoable
  // </summary>
  undoNext(){
    if(!this.canUndo()){
      return
    }
 
    let action = this.commandStack.pop()
    try {
      this.inProgress = true
      action.undo()
      if (!action.async){
        this.trigger('onUndone', action)
      }
    }
    catch(e) {
      this.commandStack.push(action)
      this.trigger('onUndoFailed', action, e)
    }
    if (typeof action.persistable !== 'undefined' && action.persistable &&
      typeof this.storage !== 'undefined' && this.storage !== null ){
      this.storage.removeItem(this.commandStack.length)
    }
  }
 
  // <summary>
  // Event triggered when an action was undone
  // </summary>
  onUndone(command){
    this.inProgress = false
    this.off('onUndone', this.onUndone)
    this.off('onUndoFailed', this.onUndoFailed)
 
    if (typeof command !== 'undefined' && command !== null){
      this.redoStack.push(command)
    }
 
    if (typeof this.resolveCallback !== 'undefined' &&
      typeof this.resolveCallback === 'function'){
      this.resolveCallback()
    }
  }
 
  onUndoFailed(command, error){
    this.off('onUndone', this.onUndone)
    this.off('onUndoFailed', this.onUndoFailed)
 
    try {
      if (typeof this.rejectCallback !== 'undefined' &&
        typeof this.rejectCallback === 'function'){
        this.rejectCallback(error)
      }
    }
    finally {
      this.resolveCallback = null
      this.rejectCallback = null
    }
  }
 
  // <summary>
  // Clear all actions peformed and to be performed. Clear the storage service
  // </summary>
  reset(){
    this.redoStack.splice(0, this.redoStack.length)
    this.commandStack.splice(0, this.commandStack.length)
    this.clear()
 
    if (typeof this.storage !== 'undefined' && this.storage !== null ){
      this.storage.clear()
    }
  }
 
  // <summary>
  // Find the latest action performed that meets the criteria (callback)
  // </summary>
  findLastAction(callback){
    return this.commandStack.slice().reverse().find(callback)
  }
 
  // <summary>
  // Find all actions performed that meets the criteria (callback)
  // </summary>
  findActions(callback){
    return this.commandStack.filter(callback)
  }
}