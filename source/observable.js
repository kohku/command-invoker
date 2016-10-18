export class Observable {
  constructor(){
  }
 
  on(event, fn){
    this._callbacks = this._callbacks || {};
    (this._callbacks[event] = this._callbacks[event] || [])
      .push(fn);
    return this;
  }
 
  off(event, fn){
    this._callbacks = this._callbacks || {};
 
    // all
    if (0 === arguments.length) {
      this._callbacks = {};
      return this;
    }
 
    // specific event
    var callbacks = this._callbacks[event];
    if (!callbacks) return this;
 
    // remove all handlers
    if (1 == arguments.length) {
      delete this._callbacks[event];
      return this;
    }
 
    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        delete callbacks[i]; // TODO: monitor this
        callbacks.splice(i, 1);
        break;
      }
    }
    return this;
  }

  trigger(event){
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1)
      , callbacks = this._callbacks[event];
 
    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }
 
    return this;
  }
}