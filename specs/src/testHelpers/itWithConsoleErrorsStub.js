import sinon from 'sinon';
import consoleErrors from './../../../src/consoleErrors.js';

// Stub consoleErrors
const itWithConsoleErrorsStub = function(should, fn, only = false) {
  const before = function() {
    sinon.stub(consoleErrors);
  };
  const after = function() {
    sinon.restore(consoleErrors);
  };

  if(typeof fn !== 'function') {
    return (only ? it.only : it)(should);
  }

  (only ? it.only : it)(should, function() {
    before();
    try { return fn(); } finally { after(); }
  });
};
itWithConsoleErrorsStub.only = function(...args) {
  args.push(true);
  itWithConsoleErrorsStub.apply(itWithConsoleErrorsStub, args);
};

export default itWithConsoleErrorsStub;
