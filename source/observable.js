export class Observable {

  on (event, fn) {
    this._callbacks = this._callbacks || {}
    this._callbacks[event] = this._callbacks[event] || []
    if (this._callbacks[event].indexOf(fn) < 0) {
      this._callbacks[event].push(fn)
    }
    return this
  }

  off (event, fn) {
    this._callbacks = this._callbacks || {}

    // all
    if (arguments.length === 0) {
      this._callbacks = {}
      return this
    }

    // specific event
    let callbacks = this._callbacks[event]
    if (!callbacks) return this

    // remove all handlers
    if (arguments.length === 1) {
      delete this._callbacks[event]
      return this
    }

    // remove specific handler
    let cb
    for (let i = 0; i < callbacks.length; i++) {
      cb = callbacks[i]
      if (cb === fn || cb.fn === fn) {
        delete callbacks[i] // TODO: monitor this
        callbacks.splice(i, 1)
        break
      }
    }
    return this
  }

  trigger (event) {
    this._callbacks = this._callbacks || {}
    let args = [].slice.call(arguments, 1)
    let callbacks = this._callbacks[event]

    if (callbacks) {
      callbacks = callbacks.slice(0)
      for (let i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args)
      }
    }

    return this
  }
}
