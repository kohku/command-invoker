import CommandInvoker from './commandInvoker';
import Command, { UndoableCommand, CommandWrapper } from './command';
import NullCommand from './nullCommand';

const exports = module.exports || {};

exports.CreateInvoker = receiver => new CommandInvoker(receiver);

exports.CreateCommand = options => new Command(options);

exports.CreateCommandWrapper = options => new CommandWrapper(options);

exports.CreateUndoableCommand = options => new UndoableCommand(options);

exports.CreateNullCommand = options => new NullCommand(options);
