import { Observable } from './observable'
import { Command, UndoableCommand, CommandWrapper, CommandInvoker } from './commands'
import { NullCommand } from './nullCommand'

const exports = module.exports = {}

exports.CommandInvoker = function(receiver){
    return new CommandInvoker(receiver)
} 

exports.Command = function(options){
    return new Command(options)
}

exports.UndoableCommand = function(options){
    return new UndoableCommand(options)
}

exports.NullCommand = function(options){
    return new NullCommand(options)
}

