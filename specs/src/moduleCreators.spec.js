import { expect } from 'chai';
import { combineModules } from '../../src/modules';
import { settableValue } from '../../src/moduleCreators';

describe('module creators', function () {
  describe('settableValue', function () {
    const { reducer, actions, selectors } = settableValue('INITIAL VALUE', 'getMyValue', 'setMyValue', 'SET_MY_VALUE');

    it('should respect the initial value', function () {
      expect(reducer(undefined, { type: '__INIT__' })).to.equal('INITIAL VALUE');
    });

    it('should have a selector', function () {
      expect(selectors.getMyValue('NEW VALUE')).to.equal('NEW VALUE');
    });

    it('should have an action creator', function () {
      expect(
        reducer('OLD VALUE', actions.setMyValue('NEW VALUE'))
      ).to.equal('NEW VALUE');
    });
  });
});
