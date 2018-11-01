"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observable = function () {
  function Observable() {
    _classCallCheck(this, Observable);
  }

  _createClass(Observable, [{
    key: "on",
    value: function on(event, fn) {
      this.callbacks = this.callbacks || {};
      this.callbacks[event] = this.callbacks[event] || [];
      if (this.callbacks[event].indexOf(fn) < 0) {
        this.callbacks[event].push(fn);
      }
      return this;
    }
  }, {
    key: "off",
    value: function off(event, fn) {
      this.callbacks = this.callbacks || {};

      // all
      if (arguments.length === 0) {
        this.callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this.callbacks[event];
      if (!callbacks) return this;

      // remove all handlers
      if (arguments.length === 1) {
        delete this.callbacks[event];
        return this;
      }

      // remove specific handler
      var cb = void 0;
      for (var i = 0; i < callbacks.length; i += 1) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          delete callbacks[i];
          callbacks.splice(i, 1);
          break;
        }
      }

      return this;
    }
  }, {
    key: "trigger",
    value: function trigger(event) {
      this.callbacks = this.callbacks || {};
      var callbacks = this.callbacks[event];

      if (callbacks) {
        callbacks = callbacks.slice(0);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        for (var i = 0, len = callbacks.length; i < len; i += 1) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    }
  }]);

  return Observable;
}();

exports.default = Observable;