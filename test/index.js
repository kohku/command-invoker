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
      execute: () => {
        receiver.data += 2;
      },
      undo: () => {
        receiver.data -= 2;
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
              execute: () => {
                receiver.data += 2;
              },
            })
              .then(() => {
                expect(receiver.data).to.equal(4);
                expect(invoker.canUndo()).toBe(false);
              });
          });
      })
      // eslint-disable-next-line no-console
      .catch(error => console.error(error));
  });

  it('Can resolve an async function', () => {
    const resolveAfter2Seconds = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('2 seconds have passed');
          resolve('resolved');
        }, 2000);
      });
    };

    async function asyncCall() {
      console.log('calling');
      const result = await resolveAfter2Seconds();
      return result;
    }

    async function asyncCall2() {
      return resolveAfter2Seconds();
    }

    function asyncCall3() {
      setTimeout(() => {
        console.log('4 seconds have passed');
      }, 4000);
    }

    const receiver = {};

    const invoker = CreateInvoker(receiver);
    invoker.on('nextCommand', () => console.log('nextCommand'));
    invoker.on('commandComplete', () => console.log('commandComplete'));
    invoker.on('complete', () => console.log('complete'));
    invoker.on('commandFailure', () => console.log('commandFailure'));
    invoker.on('start', () => console.log('start'));
    invoker.enqueueCommand(asyncCall);
    invoker.enqueueCommand(resolveAfter2Seconds);
    invoker.enqueueCommand(asyncCall2);
    invoker.enqueueCommand(asyncCall3);

    const processor = invoker.execute();

    expect(processor).to.be.a('promise');

    processor
      .then(() => console.log('Done'))
      .catch(() => console.log('Doh!'));
  });
});
