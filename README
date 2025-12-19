# Command Invoker

A flexible javascript library implementing the Command Pattern with undo/redo support, event-driven execution, and extensibility for custom commands.

## Features

- **Command Chain Management:** Enqueue, dequeue, and execute commands in sequence.
- **Undo/Redo Functionality:** Undo an dredo actions with stack management.
- **Event-Driven:** Execution and state changes are triggered via events.
- **Extensible:** Supports function, object, or class-based commands.
- **Error Handling:** Configurable behavior on command failures.

## Installation

```bash
npm install command-invoker
```

Or clone the repository:

```bash
git clone https://github.com/kohku/command-invoker.git
```

## Usage

```javascript
const CreateInvoker = require('command-invoker');
const invoker = CreateInvoker(receiver);

// Enqueue a command
invoker.enqueueCommand(() => {
  // command logic here
});

// Execute all commands
invoker.execute().then((result) => {
  constole.log('All command executed:', result);
});

// Undo last command
invoker.undo().then((result) => {
  console.log('Last command undone:', result);
});

// Redo last unconde command
invoker.redo();
```

See tests for more usage.

## API Overview

### CommandInvoker

- `enqueueComamnd(command, [undoFn]`): Add a command to the chain.
- `dequeueCommand(command)`: Remove a command from the chain.
- `execute([continueOnFailures])`: Execute all commands in the chain.
- `undo():` Undo the last undoable command.
- `undoAll()`: Undo all undoable commands.
- `redo()`: Redo the last undone command.
- `reset()`: Clear all commands and stacks
- `findLastAction(predicate)`: Find the last command matching a predicate.
- `findActions(predicate)`: Find all commands matching a predicate.

### Command Structure

Commands can be:
- Functions
- Objects with `execute` and optionally `undo` methods
- Instances of command classes

### Events

- `nextCommand`
- `commandComplete`
- `commandFailure`
- `complete`
- `undoNext`
- `undoComplete`
- `onUndone`
- `onUndoFailed`

## License

MIT
