'use strict'

var expect = require('expect')
var promise = require('es6-promise')
var commands = require('./../distribution/commands')

var receiver = {}

var invoker = new commands.CommandInvoker(receiver)

expect(invoker).toExist()
expect(invoker).toBeA(commands.CommandInvoker)
expect(invoker.canUndo()).toBe(false)
expect(invoker.canRedo()).toBe(false)

receiver.data = 2

// Applying a simple command
invoker.apply({
  options: { step: 2 },
  validate: function (actionsPerformed, actionsToPerform) {
  },
  execute: function () {
    receiver.data += this.options.step
  },
  undo: function () {
    receiver.data -= this.options.step
  }
})
.then(() => {
  expect(receiver.data).toBe(4)
  expect(invoker.canUndo()).toBe(true)

  // Undoing things
  invoker.undo()
  .then(() => {
    expect(receiver.data).toBe(2)
    expect(invoker.canUndo()).toBe(false)

    invoker.apply({
      options: { step: 2 },
      execute: function () {
        receiver.data += this.options.step
      }
    })
    .then(() => {
      expect(invoker.canUndo()).toBe(false)
    })
    .catch(error => {
      throw error
    })
  })
  .catch(error => {
    throw error
  })
})
.catch(error => {
  console.log(error)
})
