declare module 'command-invoker' {
  type callback = () => void;

  export interface Observable {
    /*
    * Adds a listener for an event
    * @param {string} event - the event name
    * @param {function} listener - the listener function
    */
    on(event: string, listener: CallableFunction): void;
    /*
    * Removes a listener for an event
    * @param {string} event - the event name
    * @param {function} listener - the listener function
    */
    off(event: string, listener: CallableFunction): void;
    /*
    * Triggers an event
    * @param {string} event - the event name
    * @param {any} args - the arguments to pass to the listener functions
    */
    trigger(event: string, ...args: any[]): void;
  }

  export interface Subordinate extends Observable {
    /*
    * Adds a command to the command chain
    * @param {Command} command - the command to be executed
    * @param {Command} undo - the undo command, if any
    */
    enqueueCommand<T = unknown>(command: Command<T>, undo?: Command<T>): void;
    /*
    * Removes a command from the command chain
    * @param {Command} command - the command to be removed
    */
    dequeueCommand<T = unknown>(command: Command<T>): void;
    /*
    * Starts execution of the command chain
    * @param {boolean} continueOnFailures - if true, the invoker will continue executing the next command even if the previous one failed
    * @return {Promise} - resolves when all commands have been executed
    */
    execute<T = unknown>(continueOnFailures?: boolean): Promise<{ state: T }>;
    /** 
     * Executes a promise for execute a single command
     * @param {Command} command - the command to be executed
     * @return {Promise} - resolves when the command has been executed
     */
    apply<T = unknown>(command: Command<T>): Promise<void>;
    /*
    * Returns true if an undoable action is available to undo.
    */
    canUndo(): boolean;
    /*
    * Undo the last action, if undoable
    * @return {Promise} - resolves when the undo command has been executed
    */
    undo(): Promise<void>;
    /*
    * Undo the last action, if undoable
    * @return {Promise} - resolves when the undo command has been executed
    */
    undoAll(): Promise<void>;
    /*
    * Clear all actions peformed and to be performed. Clear the storage service
    */
    reset(): void;
    /*
     * Find the latest action performed that meets the criteria(callback)
     */
    findLastAction: (command: Command<unknown>) => Command<unknown> | undefined;
    /*
     * Find all actions performed that meets the criteria(callback)
     */
    findActions: (command: Command<unknown>) => Command<unknown>[];
    /*
    * returns true if an redoable action is available to redo.
    */
    canRedo(): boolean;
    /*
    * Redo the last action, if redoable
    * @return {Promise} - resolves when the redo command has been executed
    */
    redo(): Promise<void>;
  }

  export type Command<S, R = unknown, I = unknown> = (
    initiator: I,
    state: S,
    subordinate?: Subordinate
  ) => Promise<R> | R;

  export function CreateInvoker<I = void>(initiator?: I): Subordinate;
}