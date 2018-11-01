const { expect } = require('chai');
const { CreateInvoker } = require('../dist');

// eslint-disable-next-line no-undef
describe('CommandInvoker', () => {
  // eslint-disable-next-line no-undef
  it('Can be created', () => {
    const receiver = {};

    const invoker = CreateInvoker(receiver);

    expect(invoker).to.be.a('object');
    // eslint-disable-next-line no-unused-expressions
    expect(invoker.canUndo()).to.be.false;
    // eslint-disable-next-line no-unused-expressions
    expect(invoker.canRedo()).to.be.false;

    receiver.data = 2;

    // Applying a simple command
    invoker.apply({
      options: { step: 2 },
      execute: (options) => {
        receiver.data += options.step;
      },
      undo: (options) => {
        receiver.data -= options.step;
      },
    })
      .then(() => {
        expect(receiver.data).to.equal(4);
        expect(invoker.canUndo()).to.equal(true);

        // Undoing things
        invoker.undo()
          .then(() => {
            expect(receiver.data).toBe(2);
            expect(invoker.canUndo()).toBe(false);

            invoker.apply({
              options: { step: 2 },
              execute: (options) => {
                receiver.data += options.step;
              },
            })
              .then(() => {
                expect(invoker.canUndo()).toBe(false);
              });
          });
      })
      // eslint-disable-next-line no-console
      .catch(error => console.error(error));
  });
});
