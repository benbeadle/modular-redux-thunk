import { expect } from 'chai';
import sinon from 'sinon';

import combineSelectors, { addGlobalSelectors } from './../../src/selectors.js';

import consoleErrors from './../../src/consoleErrors.js';
import itWithConsoleErrorsStub from './testHelpers/itWithConsoleErrorsStub.js';

const f = (reducerState) => {};
const fG = (allSelectors) => {};
const expectKeysToDeepEqual = (selectors, keys) => {
  const selectorKeys = Object.keys(selectors);
  selectorKeys.sort();
  keys.sort();
  expect(selectorKeys).to.deep.equal(keys);
};

describe('selectors', function () {
  describe('combineSelectors', function() {

    before('stub console.error to suppress warnings', function() {
      sinon.stub(console, 'error');
    });
    after('unstub console.error', function() {
      console.error.restore();
    });

    itWithConsoleErrorsStub('should consoleErrors to check for dup selectors', function () {
      combineSelectors({one:{one:f}});
      expect(consoleErrors.duplicateName.callCount).to.equal(1);
    });

    itWithConsoleErrorsStub('should consoleErrors to check if the selector is a function', function () {
      combineSelectors({one:{one:f}});
      expect(consoleErrors.notFunction.callCount).to.equal(1);
    });

    it('should not add selectors that aren\'t functions', function () {
      const selectors = combineSelectors({one:{two:f,three:''}});
      expectKeysToDeepEqual(selectors, ['two']);
    });
    it('should not add global selectors that aren\'t functions', function () {
      const selectors = combineSelectors({one:{two:f}}, {three:''});
      expectKeysToDeepEqual(selectors, ['two']);
    });

    itWithConsoleErrorsStub('should consoleErrors to check if selector has no args', function () {
      combineSelectors({one:{one:f}});
      expect(consoleErrors.noArgsDefined.callCount).to.equal(1);
    });

    it('should not add selectors that have no args defined', function () {
      const selectors = combineSelectors({one:{one:f,two:()=>{}}});
      expectKeysToDeepEqual(selectors, ['one']);
    });
    it('should not add global selectors that have no args defined', function () {
      const selectors = combineSelectors({one:{one:f}}, {two:()=>{}});
      expectKeysToDeepEqual(selectors, ['one']);
    });

    it('should call the correct selector functions', function () {
      const oneSpy = sinon.spy(f);
      const twoSpy = sinon.spy(f);
      const threeSpy = sinon.spy(f);
      const reducerConfig = {
        one: {
          one: oneSpy,
          two: twoSpy,
        },
        two: {
          three: threeSpy
        }
      };

      const selectors = combineSelectors(reducerConfig);

      const mockState = {};

      selectors.one(mockState);
      expect(oneSpy.callCount).to.equal(1);

      selectors.two(mockState);
      expect(twoSpy.callCount).to.equal(1);

      selectors.three(mockState);
      expect(threeSpy.callCount).to.equal(1);
    });

    it('should pass the reducer\'s state (not entire state) as the first selector arg', function () {
      const oneSpy = sinon.spy(f);
      const twoSpy = sinon.spy(f);
      const selectors = combineSelectors({one:{one:oneSpy},two:{two:twoSpy}});

      const mockState = {
        one: {
          oneState: 'one'
        },
        two: {
          twoState: 'two'
        }
      };

      selectors.one(mockState);
      expect(oneSpy.firstCall.args).to.deep.equal([mockState.one]);

      selectors.two(mockState);
      expect(twoSpy.firstCall.args).to.deep.equal([mockState.two]);
    });
    it('should pass any additional selector args to selector', function () {
      const oneSpy = sinon.spy(f);
      const selectors = combineSelectors({one:{one:oneSpy}});

      const mockState = {};

      selectors.one(mockState, 'AddiTIONalArgONE', 'AdDITionALArgtwo');
      expect(oneSpy.firstCall.args.slice(1)).to.deep.equal(['AddiTIONalArgONE', 'AdDITionALArgtwo']);
    });
  });

  describe('addGlobalSelectors', function () {
    it('should combine all reducer and global selectors as one object', function () {
      const reducers = {
        reducerOne:{selectorOne:f,selectorTwo:f},
        reducerTwo:{selectorThree:f}
      };
      const selectors = addGlobalSelectors(combineSelectors(reducers), {globalselectorOne:fG});

      expectKeysToDeepEqual(selectors, ['selectorOne', 'selectorTwo', 'selectorThree', 'globalselectorOne']);
    });

    itWithConsoleErrorsStub('should consoleErrors to check for dup global selectors', function () {
      addGlobalSelectors(combineSelectors({one:{one:f}}), {globalOne:fG});
      expect(consoleErrors.duplicateName.callCount).to.equal(2);
    });

    itWithConsoleErrorsStub('should consoleErrors to check if global selector has no args', function () {
      addGlobalSelectors(combineSelectors({one:{one:f}}), {globalOne:fG});
      expect(consoleErrors.noArgsDefined.callCount).to.equal(2);
    });

    itWithConsoleErrorsStub('should consoleErrors to check if the global selector is a function', function () {
      addGlobalSelectors(combineSelectors({one:{one:f}}), {globalOne:fG});
      expect(consoleErrors.notFunction.callCount).to.equal(2);
    });

    it('should call the correct global selector functions', function () {
      const oneSpy = sinon.spy(f);
      const twoSpy = sinon.spy(f);
      const threeSpy = sinon.spy(f);
      const globalOneSpy = sinon.spy(fG);
      const reducerConfig = {
        one: {
          one: oneSpy,
          two: twoSpy,
        },
        two: {
          three: threeSpy
        }
      };

      const selectors = addGlobalSelectors(combineSelectors(reducerConfig), {globalOne:globalOneSpy});

      const mockState = {};

      selectors.one(mockState);
      expect(oneSpy.callCount).to.equal(1);

      selectors.two(mockState);
      expect(twoSpy.callCount).to.equal(1);

      selectors.three(mockState);
      expect(threeSpy.callCount).to.equal(1);

      selectors.globalOne();
      expect(globalOneSpy.callCount).to.equal(1);
    });

    it('should pass the selectors object to global selectors', function () {
      const globalTwoSpy = sinon.spy(fG);
      const selectors = addGlobalSelectors(combineSelectors({one:{one:f}}), {two:globalTwoSpy});

      selectors.two();
      expect(globalTwoSpy.firstCall.args.length).to.equal(1);
      expectKeysToDeepEqual(globalTwoSpy.firstCall.args[0], ['one', 'two']);
    });

    it('should pass any additional global selector args to global selector', function () {
      const globalTwoSpy = sinon.spy(fG);
      const selectors = addGlobalSelectors(combineSelectors({one:{one:f}}), {two:globalTwoSpy});

      selectors.two('AddiTIONalArgONE', 'AdDITionALArgtwo');
      expect(globalTwoSpy.firstCall.args.slice(1)).to.deep.equal(['AddiTIONalArgONE', 'AdDITionALArgtwo']);
    });

    it('should return values from reducer and global selectors', function () {
      const one = oneState => 'oneResult';
      const globalTwo = selectors => 'globalResult';
      const selectors = addGlobalSelectors(combineSelectors({one:{one:one}}), {two:globalTwo});

      const mockState = {
        one: {}
      };

      const oneResult = selectors.one(mockState);
      const globalTwoResult = selectors.two();

      expect(oneResult).to.equal('oneResult');
      expect(globalTwoResult).to.equal('globalResult');
    });
  });
});
