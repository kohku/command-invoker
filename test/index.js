'use strict'

var expect = require('expect')
var invoker = require('./../distribution/commands')

console.log(JSON.stringify(invoker.CommandInvoker))

// import { CommandInvoker, Command, UndoableCommand } from './../source/commands'

// const data = { value: 2 }

// const invoker = new CommandInvoker(data)

// invoker.setCommand({
//   options: {
//     step: 2
//   },
//   execute: () => {
//     this.receiver.value += this.step
//   },
//   undo: () => {
//     this.receiver.value -= this.step
//   }
// })

// invoker.execute()
expect(1).toBe(1)
