var createStore = require('./../../lib');
var expect = require('chai').expect;

// Define a reducer (typically would be in reducers/chips.js)
var chips = {
  reducers: {
    favorite: (state, action) => {
      state = state || 'unknown';
      switch(action.type) {
        case 'SET_FAVORITE_CHIPS': return action.newFav;
        default: return state;
      }
    }
  },
  selectors: {
    getFavoriteChips: chipsState => chipsState.favorite
  },
  actions: {
    setFavoriteChips: function(newFav) {
      return {type:'SET_FAVORITE_CHIPS', newFav:newFav};
    }
  }
};

var newStore = function() {
  return createStore({chips:chips});
};

describe('modularReduxThunk', function () {
  it('should return redux store', function () {
    var store = newStore().store;

    expect(store.getState()).to.deep.equal({chips:{favorite:'unknown'}});
  });

  it('should return selectors', function() {
    var modStore = newStore();
    var store = modStore.store;
    var selectors = modStore.selectors;

    expect(selectors).to.have.keys(['getFavoriteChips']);
    expect(selectors.getFavoriteChips(store.getState())).to.equal('unknown');
  });

  it('should return actions', function() {
    var modStore = newStore();
    var store = modStore.store;
    var actions = modStore.actions;

    expect(actions).to.have.keys(['setFavoriteChips']);

    store.dispatch(actions.setFavoriteChips('bbq'));
    expect(store.getState()).to.deep.equal({chips:{favorite:'bbq'}});
  });

  it('should return pickActions', function() {
    var modStore = newStore();
    var store = modStore.store;

    var actions = modStore.pickActions('setFavoriteChips');

    expect(actions).to.have.keys(['setFavoriteChips']);

    store.dispatch(actions.setFavoriteChips('bbq'));
    expect(store.getState()).to.deep.equal({chips:{favorite:'bbq'}});
  });
})
