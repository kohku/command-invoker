import CommandInvoker from './commandInvoker';
import Command, { UndoableCommand, CommandWrapper } from './command';
import NullCommand from './nullCommand';

const exports = module.exports || {};

exports.CommandInvoker = receiver => new CommandInvoker(receiver);

exports.Command = options => new Command(options);

exports.CommandWrapper = options => new CommandWrapper(options);

exports.UndoableCommand = options => new UndoableCommand(options);

exports.NullCommand = options => new NullCommand(options);
