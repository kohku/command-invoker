const { expect } = require('chai');
const { CreateInvoker } = require('../dist');

// eslint-disable-next-line no-undef
describe('CommandInvoker', () => {
  // eslint-disable-next-line no-undef
  it('Can be created', () => {
    const invoker = CreateInvoker({});
    expect(invoker).to.be.a('object');
    // eslint-disable-next-line no-unused-expressions
    expect(invoker.canUndo()).to.be.false;
    // eslint-disable-next-line no-unused-expressions
    expect(invoker.canRedo()).to.be.false;
  });

  it ('Execute one command', (done) => {
    const receiver = { data: 2 };
    const invoker = CreateInvoker(receiver);
    // Applying a simple command
    invoker.apply(() => {
      receiver.data += 2;
    })
      .then(() => {
        expect(receiver.data).to.equal(4);
        expect(invoker.canUndo()).to.equal(false);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it ('Execute and undo one command', (done) => {
    const invoker = CreateInvoker({ data: 2 });
    // Applying a simple command
    invoker.apply({
      execute: (receiver) => {
        receiver.data += 2;
      },
      undo: (receiver) => {
        receiver.data -= 2;
      },
    })
      .then((receiver) => {
        expect(receiver.data).to.equal(4);
        expect(invoker.canUndo()).to.equal(true);
        // Undoing things
        return invoker.undo();
      })
      .then((receiver) => {
        expect(receiver.data).to.equal(2);
        expect(invoker.canUndo()).to.equal(false);
        return invoker.apply({
          execute: (receiver) => {
            receiver.data += 2;
          },
        });
      })
      .then((receiver) => {
        expect(receiver.data).to.equal(4);
        expect(invoker.canUndo()).to.equal(false);
        done();
      })
      // eslint-disable-next-line no-console
      .catch((error) => {
        done(error);
      });
  });

  it('Can resolve an async function', (done) => {
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
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  }).timeout(7000);

  it ('Can resolve more complex scenarios', (done) => {
    const invoker = CreateInvoker({ data: 2 });

    const addSubstractTwo = {
      execute: (receiver) => {
        console.log(receiver);
        console.log('Adding 2');
        receiver.data += 2;
      },
      undo: (receiver) => {
        console.log(receiver);
        console.log('Substracting 2');
        receiver.data -= 2;
      },
    };
    
    invoker.enqueueCommand(addSubstractTwo)
    invoker.enqueueCommand(addSubstractTwo)
    invoker.enqueueCommand(addSubstractTwo)

    invoker.execute()
      .then((receiver) => {
        expect(receiver.data).to.equal(8);
        expect(invoker.canUndo()).to.equal(true);
        // Undoing things
        return invoker.undoAll();
      })
      .then((receiver) => {
        expect(receiver.data).to.equal(2);
        expect(invoker.canUndo()).to.equal(false);
        done();
      })
      // eslint-disable-next-line no-console
      .catch((error) => {
        done(error);
      });
  });
});
