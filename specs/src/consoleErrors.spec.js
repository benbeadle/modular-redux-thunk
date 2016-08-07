import { expect } from 'chai';
import sinon from 'sinon';

import consoleErrors from './../../src/consoleErrors.js';

const expectCallCount = () => expect(console.error.callCount);
const expectArg = () => expect(console.error.lastCall.args[0]);

// We need to stub console.error. So this wrapper stubs and restores the method
// so we don't pollute global state.
const itWithConsoleErrorStub = function(should, fn, only = false) {
  const before = function() {
    sinon.stub(console, 'error');
  };
  const after = function() {
    console.error.restore();
  };

  (only ? it.only : it)(should, function() {
    before();
    try { return fn(); } finally { after(); }
  });
};
itWithConsoleErrorStub.only = function(...args) {
  args.push(true);
  itWithConsoleErrorStub.apply(itWithConsoleErrorStub, args);
};

describe('consoleErrors', function() {

  describe('.duplicateName', function() {
    itWithConsoleErrorStub('should not console the warning since prop is not in object', function() {
      consoleErrors.duplicateName('NaME', 'pROPnamE', {});
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should console the warning since prop is in object set as an object', function() {
      consoleErrors.duplicateName('NaME', 'pROPnamE', {pROPnamE:{}});
      expectArg().to.contain('NaME').and.to.contain('pROPnamE');
    });

    itWithConsoleErrorStub('should console the warning since prop is in object even if it\'s set as null', function() {
      consoleErrors.duplicateName('NaME', 'pROPnamE', {pROPnamE:null});
      expectCallCount().to.equal(1);
      expectArg().to.contain('NaME').and.to.contain('pROPnamE');
    });

    itWithConsoleErrorStub('should console the warning since prop is in object even if it\'s set as undefined', function() {
      consoleErrors.duplicateName('NaME', 'pROPnamE', {pROPnamE:undefined});
      expectCallCount().to.equal(1);
      expectArg().to.contain('NaME').and.to.contain('pROPnamE');
    });

    itWithConsoleErrorStub('should console the warning since prop is in object even if it\'s set as false', function() {
      consoleErrors.duplicateName('NaME', 'pROPnamE', {pROPnamE:false});
      expectCallCount().to.equal(1);
      expectArg().to.contain('NaME').and.to.contain('pROPnamE');
    });

    itWithConsoleErrorStub('should return false when not found', function() {
      const exists = consoleErrors.duplicateName('NaME', 'pROPnamE', {});
      expect(exists).to.equal(false);
    });

    itWithConsoleErrorStub('should return true when found', function() {
      const exists = consoleErrors.duplicateName('NaME', 'pROPnamE', {pROPnamE:false});
      expect(exists).to.equal(true);
    });
  });

  describe('.actionMissing', function() {
    itWithConsoleErrorStub('should console the warning since prop is not in object', function() {
      consoleErrors.actionMissing('pROPnamE', {});
      expectCallCount().to.equal(1);
      expectArg().to.contain('pROPnamE');
    });

    itWithConsoleErrorStub('should not console the warning since prop is in object set as an object', function() {
      consoleErrors.actionMissing('pROPnamE', {pROPnamE:{}});
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should not console the warning since prop is in object even if it\'s set as null', function() {
      consoleErrors.actionMissing('pROPnamE', {pROPnamE:null});
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should not console the warning since prop is in object even if it\'s set as undefined', function() {
      consoleErrors.actionMissing('pROPnamE', {pROPnamE:undefined});
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should console the warning since prop is in object even if it\'s set as false', function() {
      consoleErrors.actionMissing('pROPnamE', {pROPnamE:false});
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should return true when missing', function() {
      const missing = consoleErrors.actionMissing('pROPnamE', {});
      expect(missing).to.equal(true);
    });

    itWithConsoleErrorStub('should return false when found', function() {
      const missing = consoleErrors.actionMissing('pROPnamE', {pROPnamE:false});
      expect(missing).to.equal(false);
    });
  });

  describe('notFunction', function() {
    itWithConsoleErrorStub('should not console the warning since a function', function() {
      consoleErrors.notFunction('NaME', 'FUncnamE', () => {});
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should console the warning since not a function', function() {
      consoleErrors.notFunction('NaME', 'FUncnamE', {});
      expectCallCount().to.equal(1);
    });

    itWithConsoleErrorStub('should print arguments and type in console message', function() {
      consoleErrors.notFunction('NaME', 'FUncnamE', 'NotAFunction');
      expectCallCount().to.equal(1);
      expectArg().to.contain('NaME').and.contain('FUncnamE').and.contain('not string');
    });

    itWithConsoleErrorStub('should console the warning since undefined', function() {
      consoleErrors.notFunction('NaME', 'FUncnamE');
      expectCallCount().to.equal(1);
    });

    itWithConsoleErrorStub('should return true since not a function', function() {
      const notFunction = consoleErrors.notFunction('NaME', 'FUncnamE');
      expect(notFunction).to.equal(true);
    });

    itWithConsoleErrorStub('should return false since a function', function() {
      const notFunction = consoleErrors.notFunction('NaME', 'FUncnamE', () => {});
      expect(notFunction).to.equal(false);
    });
  });

  describe('noArgsDefined', function() {
    const noArgs = () => {};
    const oneArg = (argOne) => {};
    const twoArgs = (argOne, argTwo) => {};

    itWithConsoleErrorStub('should console the warning with a function that has no arguemnts', function() {
      consoleErrors.noArgsDefined('NaME', 'FUncnamE', noArgs, 'aRGdEsc');
      expectCallCount().to.equal(1);
    });
    itWithConsoleErrorStub('should not console the warning with a function that has 1 arguemnt', function() {
      consoleErrors.noArgsDefined('NaME', 'FUncnamE', oneArg, 'aRGdEsc');
      expectCallCount().to.equal(0);
    });
    itWithConsoleErrorStub('should not console the warning with a function that has more than 1 arguemnt', function() {
      consoleErrors.noArgsDefined('NaME', 'FUncnamE', twoArgs, 'aRGdEsc');
      expectCallCount().to.equal(0);
    });

    itWithConsoleErrorStub('should include name, funcName, and argDesc in error message', function() {
      consoleErrors.noArgsDefined('NaME', 'FUncnamE', noArgs, 'aRGdEsc');
      expectArg().to.contain('NaME').and.contain('FUncnamE').and.contain('aRGdEsc');
    });

    itWithConsoleErrorStub('should return true with a function that has no arguemnts', function() {
      const noArgsDefined = consoleErrors.noArgsDefined('NaME', 'FUncnamE', noArgs, 'aRGdEsc');
      expect(noArgsDefined).to.equal(true);
    });
    itWithConsoleErrorStub('should return false with a function that has 1 argument', function() {
      const noArgsDefined = consoleErrors.noArgsDefined('NaME', 'FUncnamE', oneArg, 'aRGdEsc');
      expect(noArgsDefined).to.equal(false);
    });
    itWithConsoleErrorStub('should return false with a function that has more than 1 argument', function() {
      const noArgsDefined = consoleErrors.noArgsDefined('NaME', 'FUncnamE', twoArgs, 'aRGdEsc');
      expect(noArgsDefined).to.equal(false);
    });
  });

  describe('invalidReducerConfig', function() {
    const reducerConfigKeys = ['reducers', 'actions', 'selectors'];
    const validConfig = {reducers:{},actions:{},selectors:{}};
    const validConfigCopy = () => Object.assign({}, validConfig);

    itWithConsoleErrorStub('should not console the warning with valid config', function() {
      consoleErrors.invalidReducerConfig('reDUCerNAMe', validConfig);
      expectCallCount().to.equal(0);
    });
    itWithConsoleErrorStub('should return false with valid config', function() {
      const invalidReducerConfig = consoleErrors.invalidReducerConfig('reDUCerNAMe', validConfig);
      expect(invalidReducerConfig).to.equal(false);
    });

    reducerConfigKeys.forEach(configKey => {
      itWithConsoleErrorStub(`should console the warning when missing the ${configKey} key`, function() {
        const testConfig = validConfigCopy();
        delete testConfig[configKey];
        consoleErrors.invalidReducerConfig('reDUCerNAMe', testConfig);
        expectCallCount().to.equal(1);
      });
      itWithConsoleErrorStub(`should contain the reducerName, key, and message about not being defined when missing the ${configKey} key`, function() {
        const testConfig = validConfigCopy();
        delete testConfig[configKey];
        consoleErrors.invalidReducerConfig('reDUCerNAMe', testConfig);
        expectArg().to.contain('reDUCerNAMe').and.contain(configKey).and.contain('defined');
      });
      itWithConsoleErrorStub(`should return true when missing the ${configKey} key`, function() {
        const testConfig = validConfigCopy();
        delete testConfig[configKey];
        const invalidReducerConfig = consoleErrors.invalidReducerConfig('reDUCerNAMe', testConfig);
        expect(invalidReducerConfig).to.equal(true);
      });

      itWithConsoleErrorStub(`should console the warning when the ${configKey} key is not an object`, function() {
        const testConfig = validConfigCopy();
        testConfig[configKey] = 'I should be a function, but instead am a silly string.';
        consoleErrors.invalidReducerConfig('reDUCerNAMe', testConfig);
        expectCallCount().to.equal(1);
      });
      itWithConsoleErrorStub(`should contain the reducerName, key, and type of object the value is when the ${configKey} key is not an object`, function() {
        const testConfig = validConfigCopy();
        testConfig[configKey] = 'I should be a function, but instead am a silly string.';
        consoleErrors.invalidReducerConfig('reDUCerNAMe', testConfig);
        expectArg().to.contain('reDUCerNAMe').and.contain(configKey).and.contain('not string');
      });
      itWithConsoleErrorStub(`should return true when the ${configKey} key is not an object`, function() {
        const testConfig = validConfigCopy();
        testConfig[configKey] = 'I should be a function, but instead am a silly string.';
        const invalidReducerConfig = consoleErrors.invalidReducerConfig('reDUCerNAMe', testConfig);
        expect(invalidReducerConfig).to.equal(true);
      });
    });
  });
});
