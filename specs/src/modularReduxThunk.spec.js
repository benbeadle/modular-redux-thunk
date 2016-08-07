import { expect } from 'chai';
import sinon from 'sinon';
import { connect } from 'react-redux';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';

import createStore from './../../src';

const render = component => {
  const renderer = ReactTestUtils.createRenderer();
  renderer.render(component);
};

// Define a reducer (typically would be in reducers/chips.js)
const chips = {
  reducers: {
    favorite: (state = 'bbq', action) => {
      switch(action.type) {
        default: return state;
      }
    }
  },
  selectors: {
    getFavoriteChips: data => data.favorite
  },
  actions: {}
};

// Now create the store
const { store, selectors, pickActions, actions } = createStore({ chips });

// Create the connected component
class _ChipsComponent extends React.Component {
  render() {
    const { favoriteChips } = this.props;

    const statement = `My favorite kind of chips are ${favoriteChips}!`;
    return (<div>{ statement }</div>);
  }
};
_ChipsComponent.propTypes = {
  favoriteChips: React.PropTypes.string
};
const ChipsComponent = connect(state => {
  return {
    favoriteChips: selectors.getFavoriteChips(state)
  };
}, {})(_ChipsComponent);

describe('modular-redux-thunk', function() {

  it('should render in react', function() {
    render(<_ChipsComponent favoriteChips='unknown' />);
  });

  it('should render a react-redux connected component', function() {
    render(<ChipsComponent store={ store } />);
  });
});
