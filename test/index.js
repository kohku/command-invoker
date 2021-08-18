/* eslint-disable no-console */
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

  it('Execute one command', (done) => {
    const receiver = { data: 2 };
    const invoker = CreateInvoker(receiver);
    // Applying a simple command
    invoker.apply((r, state, i) => {
      expect(r).to.equal(receiver);
      expect(state).to.be.an('undefined');
      expect(i).to.equal(invoker);
      receiver.data += 2;
      return receiver.data;
    })
      .then(({ receiver: r, state }) => {
        expect(r.data).to.equal(4);
        expect(state).to.equal(4);
        expect(invoker.canUndo()).to.equal(false);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('Execute and undo one command', (done) => {
    const receiver = { data: 2 };
    const invoker = CreateInvoker(receiver);
    // Applying a simple command
    invoker.apply({
      execute: (r, state, i) => {
        expect(r).to.equal(receiver);
        expect(state).to.be.an('undefined');
        expect(i).to.equal(invoker);
        r.data += 2;
        return receiver.data;
      },
      undo: () => {
        receiver.data -= 2;
        return receiver.data;
      },
    })
      .then(({ receiver: r, state }) => {
        expect(r.data).to.equal(4);
        expect(state).to.equal(4);
        expect(invoker.canUndo()).to.equal(true);
        // Undoing things
        return invoker.undo();
      })
      .then(({ receiver: r, state }) => {
        expect(r.data).to.equal(2);
        expect(state).to.equal(2);
        expect(invoker.canUndo()).to.equal(false);
        return invoker.apply({
          execute: (rv, st, iv) => {
            expect(rv.data).to.equal(2);
            expect(rv).to.equal(receiver);
            expect(st).to.be.an('undefined');
            expect(iv).to.equal(invoker);
            rv.data += 2;
            return rv.data;
          },
        });
      })
      .then(({ receiver: r, state }) => {
        expect(r.data).to.equal(4);
        expect(state).to.equal(4);
        expect(invoker.canUndo()).to.equal(false);
        done();
      })
      // eslint-disable-next-line no-console
      .catch((error) => {
        done(error);
      });
  });

  it('Can resolve an async function', (done) => {
    const resolveAfter2Seconds = () => (
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('2 seconds have passed');
          resolve('resolved');
        }, 2000);
      })
    );

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

  xit('Can resolve more complex scenarios', (done) => {
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

    const asyncAddTwo = async (receiver) => {
      console.log(receiver);
      console.log('Adding 2');
      receiver.data += 2;
      await Promise.resolve();
    };

    const asyncSubstractTwo = async (receiver) => {
      console.log(receiver);
      console.log('Substracting 2');
      receiver.data -= 2;
      await Promise.resolve();
    };

    invoker.enqueueCommand(addSubstractTwo);
    invoker.enqueueCommand(addSubstractTwo);
    invoker.enqueueCommand(addSubstractTwo);
    invoker.enqueueCommand(asyncAddTwo, asyncSubstractTwo);

    invoker.execute()
      .then((receiver) => {
        expect(receiver.data).to.equal(10);
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
