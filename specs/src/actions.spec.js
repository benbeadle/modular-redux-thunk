import { expect } from 'chai';
import sinon from 'sinon';

import combineActions, { pickActions } from './../../src/actions.js';

import consoleErrors from './../../src/consoleErrors.js';
import itWithConsoleErrorsStub from './testHelpers/itWithConsoleErrorsStub.js';

const f = () => {};
const fG = (allActions) => {};
const expectKeysToDeepEqual = (actions, keys) => {
  const actionKeys = Object.keys(actions);
  actionKeys.sort();
  keys.sort();
  expect(actionKeys).to.deep.equal(keys);
};

describe('actions', function() {

  before('stub console.error to suppress warnings', function() {
    sinon.stub(console, 'error');
  });
  after('unstub console.error', function() {
    console.error.restore();
  });

  describe('combineActions', function() {
    it('should return all reducer and global actions as one object', function() {
      const reducers = {
        reducerOne:{actionOne:f,actionTwo:f},
        reducerTwo:{actionThree:f}
      };
      const actions = combineActions(reducers, {globalActionOne:fG});

      expectKeysToDeepEqual(actions, ['actionOne', 'actionTwo', 'actionThree', 'globalActionOne']);
    });

    it('should not require the globalActions paramater', function () {
      const reducers = {
        reducerOne:{actionOne:f},
        reducerTwo:{actionTwo:f}
      };
      const actions = combineActions(reducers);

      expectKeysToDeepEqual(actions, ['actionOne', 'actionTwo']);
    });

    itWithConsoleErrorsStub('should consoleErrors to check for dup actions', function () {
      combineActions({one:{one:f}});
      expect(consoleErrors.duplicateName.callCount).to.equal(1);
    });
    itWithConsoleErrorsStub('should consoleErrors to check for dup global actions', function () {
      combineActions({one:{one:f}}, {globalOne:fG});
      expect(consoleErrors.duplicateName.callCount).to.equal(2);
    });

    itWithConsoleErrorsStub('should consoleErrors to check if the action is a function', function () {
      combineActions({one:{one:f}});
      expect(consoleErrors.notFunction.callCount).to.equal(1);
    });
    itWithConsoleErrorsStub('should consoleErrors to check if the global action is a function', function () {
      combineActions({one:{one:f}}, {globalOne:fG});
      expect(consoleErrors.notFunction.callCount).to.equal(2);
    });

    it('should not add actions that aren\'t functions', function () {
      const actions = combineActions({one:{two:f,three:''}});
      expectKeysToDeepEqual(actions, ['two']);
    });
    it('should not add global actions that aren\'t functions', function () {
      const actions = combineActions({one:{two:f}}, {three:''});
      expectKeysToDeepEqual(actions, ['two']);
    });

    itWithConsoleErrorsStub('should not call consoleErrors.noArgsDefined on reducer actions', function () {
      combineActions({one:{one:f}});
      expect(consoleErrors.noArgsDefined.callCount).to.equal(0);
    });
    itWithConsoleErrorsStub('should call consoleErrors.noArgsDefined for global actions', function () {
      combineActions({one:{one:f}}, {globalOne:fG});
      expect(consoleErrors.noArgsDefined.callCount).to.equal(1);
    });
    it('should still add global action even if no args defined', function () {
      const actions = combineActions({one:{one:f}}, {globalOne:f});
      expectKeysToDeepEqual(actions, ['one', 'globalOne']);
    });

    it('should call the correct action functions', function () {
      const oneSpy = sinon.spy();
      const twoSpy = sinon.spy();
      const threeSpy = sinon.spy();
      const globalOneSpy = sinon.spy();
      const reducerConfig = {
        one: {
          one: oneSpy,
          two: twoSpy,
        },
        two: {
          three: threeSpy
        }
      };

      const actions = combineActions(reducerConfig, {globalOne:globalOneSpy});

      actions.one();
      expect(oneSpy.callCount).to.equal(1);

      actions.two();
      expect(twoSpy.callCount).to.equal(1);

      actions.three();
      expect(threeSpy.callCount).to.equal(1);

      actions.globalOne();
      expect(globalOneSpy.callCount).to.equal(1);
    });
    it('should pass any action arguments to the action function', function () {
      const oneSpy = sinon.spy();
      const actions = combineActions({one:{one:oneSpy}});
      actions.one('arGOne', 'aRgTWO');
      expect(oneSpy.firstCall.args).to.deep.equal(['arGOne', 'aRgTWO']);
    });

    it('should pass the actions object to global action function as first arg', function () {
        const globalOneSpy = sinon.spy();
        const actions = combineActions({one:{one:f,two:f}}, {globalOne:globalOneSpy});
        actions.globalOne();
        expectKeysToDeepEqual(actions, ['one', 'two', 'globalOne']);
    });
    it('should pass global action arguments to the global action after the actions object arg', function () {
      const globalOneSpy = sinon.spy();
      const actions = combineActions({one:{one:f,two:f}}, {globalOne:globalOneSpy});
      actions.globalOne('ARgONE', 'argTWO');
      expect(globalOneSpy.firstCall.args.slice(1)).to.deep.equal(['ARgONE', 'argTWO']);
    });
  });

  describe('pickActions', function() {
    it('should return an object with the actions', function () {
      const actions = pickActions({one:'one', two:'two'}, 'one', 'two');
      expect(actions).to.deep.equal({one:'one', two:'two'});
    });

    it('should not add key for missing actions', function () {
      const actions = pickActions({one:'one', two:'two'}, 'one');
      expectKeysToDeepEqual(actions, ['one']);
    });

    itWithConsoleErrorsStub('should consoleErrors to check for missing actions', function () {
      pickActions({one:f}, 'one');
      expect(consoleErrors.actionMissing.callCount).to.equal(1);
    });

    it('should allow no actionName params and return an empty object', function () {
      const actions = pickActions({one:f});
      expect(Object.keys(actions).length).to.equal(0);
    });

    it('should call correct action handler', function () {
      const oneSpy = sinon.spy();
      const twoSpy = sinon.spy();
      const actions = pickActions({one:oneSpy,two:twoSpy}, 'one', 'two');

      actions.one();
      expect(oneSpy.callCount).to.equal(1);
      actions.two();
      expect(twoSpy.callCount).to.equal(1);
    });

    it('should pass args to action handler', function () {
      const oneSpy = sinon.spy();
      const actions = pickActions({one:oneSpy}, 'one');

      actions.one('ARGone', 'aRgTwO');
      expect(oneSpy.firstCall.args).to.deep.equal(['ARGone', 'aRgTwO']);
    });
  });
});
