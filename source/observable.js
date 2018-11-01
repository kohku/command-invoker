export default class Observable {
  on(event, fn) {
    this.callbacks = this.callbacks || {};
    this.callbacks[event] = this.callbacks[event] || [];
    if (this.callbacks[event].indexOf(fn) < 0) {
      this.callbacks[event].push(fn);
    }
    return this;
  }

  off(event, fn) {
    this.callbacks = this.callbacks || {};

    // all
    if (arguments.length === 0) {
      this.callbacks = {};
      return this;
    }

    // specific event
    const callbacks = this.callbacks[event];
    if (!callbacks) return this;

    // remove all handlers
    if (arguments.length === 1) {
      delete this.callbacks[event];
      return this;
    }

    // remove specific handler
    let cb;
    for (let i = 0; i < callbacks.length; i += 1) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        delete callbacks[i];
        callbacks.splice(i, 1);
        break;
      }
    }

    return this;
  }

  trigger(event, ...args) {
    this.callbacks = this.callbacks || {};
    let callbacks = this.callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  }
}
