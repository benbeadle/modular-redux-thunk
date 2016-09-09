import { expect } from 'chai';
import sinon from 'sinon';

// Import the default function and then import the rest seperately.
// If you do import { } from '...', then they can't be stubbed.
import createStore, { switchGlobalDefinitionsAndReduxConfig } from './../../src/store.js';

import consoleErrors from './../../src/consoleErrors.js';

const itWithConsoleErrorsSpy = function(should, fn) {
  const before = function() {
    sinon.spy(consoleErrors, 'invalidReducerConfig');
    sinon.stub(console, 'error');
  };
  const after = function() {
    consoleErrors.invalidReducerConfig.restore();
    console.error.restore();
  };

  it(should, function() {
    before();
    try { return fn(); } finally { after(); }
  });
};
const itAsProduction = function(should, fn) {
  let originalEnv;
  const before = function() {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  };
  const after = function() {
    process.env.NODE_ENV = originalEnv;
  };

  it(should, function() {
    before();
    try { return fn(); } finally { after(); }
  });
};

const expectObjKeysToDeepEqual = (obj, keys) => {
  const objKeys = Object.keys(obj);
  objKeys.sort();
  keys.sort();
  expect(objKeys).to.deep.equal(keys);
};

const getChips = () => ({
  reducers: {
    favorite: (state = '', action) => {
      switch(action.type) {
        case 'NEW_FAVORITE_CHIPS': return action.newFavorite;
        default: return state;
      }
    }
  },
  actions: {
    setFavoriteChips: (newFavorite) => ({ type: 'NEW_FAVORITE_CHIPS', newFavorite }),
    setFavChipsAsync: (newFavorite) => {
      return dispatch => {
        dispatch({ type: 'NEW_FAVORITE_CHIPS', newFavorite })
      };
    }
  },
  selectors: {
    getFavoriteChips: chipState => chipState.favorite
  }
});
const getChipsReducer = () => ({
  chips: getChips()
});

describe('createStore', function() {

  it('should return an object which has the store, selectors, actions, and pickActions', function () {
    const chips = getChipsReducer();
    const { store, selectors, actions, pickActions } = createStore(chips);

    expect(store.getState()).to.deep.equal({chips:{favorite:''}});

    expectObjKeysToDeepEqual(actions, ['setFavoriteChips', 'setFavChipsAsync']);
    expectObjKeysToDeepEqual(selectors, ['getFavoriteChips']);

    const myActions = pickActions('setFavoriteChips');
    expectObjKeysToDeepEqual(myActions, ['setFavoriteChips']);

    store.dispatch(myActions.setFavoriteChips('bbq'));
    expect(store.getState()).to.deep.equal({chips:{favorite:'bbq'}});
  });

  it('should allow async actions (redux-thunk)', function() {
    const chips = getChipsReducer();
    const { store, selectors, actions, pickActions } = createStore(chips);

    const myActions = pickActions('setFavChipsAsync');
    store.dispatch(myActions.setFavChipsAsync('bbq'));
    expect(store.getState()).to.deep.equal({chips:{favorite:'bbq'}});
  });

  it('should know when the second and/or third arg is reduxConfig instead of globalDefinitions', function() {

    // We have different combinations of argument values to test to make sure
    // all return the correct values.
    const configs = [];

    // If both args are null, then both should return as null.
    configs.push({first:null, second:null, result:
      {globalDefinitions:null, reduxConfig:null}});

    // If both are defined, then they should return the same objects.
    configs.push({first:{first:true}, second:{globalSecond:true}, result:
      {globalDefinitions:{first:true}, reduxConfig:{globalSecond:true}}});

    // We still test the use case where the user directly passes in null
    // as globalDefinitions. Not that they would do this, but just in case.
    configs.push({allowNull:true, first:null, second:{globalSecond:true}, result:
      {globalDefinitions:null, reduxConfig:{globalSecond:true}}});

    // If globalDefinitions is defined and not reduxConfig, then switch accordingly.
    // The algorithm will switch if NO keys in globalDefinitions start with "global".
    //
    // NO - This test should not switch since all keys start with global
    configs.push({first:{globalFirst:true}, second:null, result:
      {globalDefinitions:{globalFirst:true}, reduxConfig:null}});
    // YES - This test should switch since not all keys start with global
    configs.push({first:{first:true,second:true}, second:null, result:
      {globalDefinitions:null, reduxConfig:{first:true,second:true}}});
    // NO - This test should not switch since some keys start with global
    configs.push({first:{globalFirst:true,second:true}, second:null, result:
      {globalDefinitions:{globalFirst:true,second:true}, reduxConfig:null}});

    // If globalDefinitions is null and reduxConfig isn't, then it shouldn't do anything
    configs.push({first:null, second:{second:true}, result:
      {globalDefinitions:null, reduxConfig:{second:true}}});

    for(const configIndex in configs) {
      const config = configs[configIndex];

      // We don't pass in null directly, as use-cases wouldn't normally either,
      // unless the config specifically tells us to.
      const args = [];
      if(config.first !== null || config.allowNull) {
        args.push(config.first);
      }
      if(config.second !== null || config.allowNull) {
        args.push(config.second);
      }
      const { globalDefinitions, reduxConfig } = switchGlobalDefinitionsAndReduxConfig.apply(switchGlobalDefinitionsAndReduxConfig, args);

      if(config.result.globalDefinitions === null) {
        expect(globalDefinitions).to.equal(null, `(globalDefinitions - config index ${configIndex})`);
      } else {
        expect(globalDefinitions).to.deep.equal(config.result.globalDefinitions, `(globalDefinitions - config index ${configIndex})`);
      }
      if(config.result.reduxConfig === null) {
        expect(reduxConfig).to.equal(null, `(reduxConfig - config index ${configIndex})`);
      } else {
        expect(reduxConfig).to.deep.equal(config.result.reduxConfig, `(reduxConfig - config index ${configIndex})`);
      }
    }
  });

  it('should call switchGlobalDefinitionsAndReduxConfig. Tested by passing reduxConfig as second arg', function() {
    const chips = getChipsReducer();
    const configEnhancer = sinon.spy(() => next => {
      return (reducer_, initialState_, enhancer_) => {
        return next(reducer_, initialState_, enhancer_);
      };
    });

    const { store } = createStore(chips, {enhancers:[configEnhancer]});
    expect(configEnhancer.called).to.equal(true);
  });

  it('should include reducers if defined in reduxConfig', function () {
    const chips = getChipsReducer();
    const configReducer = (state = 'configReducerState', action) => state;

    const { store } = createStore(chips, {reducers: {configReducer: configReducer }});


    const state = store.getState();
    expect(state).to.have.property('configReducer');
    expect(state.configReducer).to.equal('configReducerState');
  });
  it('should include middleware if defined in reduxConfig', function () {
    const chips = getChipsReducer();
    const configMiddleware = sinon.spy(store => next => action => {
      return next(action);
    });

    const { store } = createStore(chips, {middleware:[configMiddleware]});

    expect(configMiddleware.called).to.equal(true);
  });
  it('should include enchancers if defined in reduxConfig', function () {
    const chips = getChipsReducer();
    const configEnhancer = sinon.spy(() => next => {
      return (reducer_, initialState_, enhancer_) => {
        return next(reducer_, initialState_, enhancer_);
      };
    });

    const { store } = createStore(chips, {enhancers:[configEnhancer]});
    expect(configEnhancer.called).to.equal(true);
  });

  it('should combine reducers from each reducer', function () {
    const chips = getChips();
    const drinks = {
      reducers: {
        favorite: (state = '', action) => {
          switch(action.type) {
            case 'NEW_FAVORITE_DRINK': return action.newFavorite;
            default: return state;
          }
        }
      },
      actions: {
        setFavoriteDrink: (newFavorite) => ({ type: 'NEW_FAVORITE_DRINK', newFavorite })
      },
      selectors: {
        getFavoriteDrink: chipState => chipState.favorite
      }
    };

    const { store } = createStore({ chips, drinks });

    expect(store.getState()).to.deep.equal({chips:{favorite:''}, drinks:{favorite:''}})
  });

  it('should combine all reducer and global selectors', function () {
    const chips = {
      reducers: {
        favorite: (state='bbq', action) => state
      },
      actions: {},
      selectors: {
        getFavoriteChips: chipState => chipState.favorite
      }
    };
    const drink = {
      reducers: {
        favorite: (state='mountain dew', action) => state
      },
      actions: {},
      selectors: {
        getFavoriteDrink: drinkState => drinkState.favorite
      }
    };

    const globalDefinitions = {
      globalSelectors: {
        getFavorites: (selectors, state) => ({
          chips: selectors.getFavoriteChips(state),
          drink: selectors.getFavoriteDrink(state)
        })
      }
    };

    const { store, selectors } = createStore({chips, drink}, globalDefinitions);

    expectObjKeysToDeepEqual(selectors, ['getFavoriteChips', 'getFavoriteDrink', 'getFavorites']);

    const state = store.getState();
    expect(selectors.getFavoriteDrink(state)).to.equal('mountain dew');
    expect(selectors.getFavorites(state)).to.deep.equal({chips:'bbq',drink:'mountain dew'});
  });

  it('should include all reducer and global actions', function() {
    const chips = {
      reducers: {
        favorite: (state = 'bbq', action) => state
      },
      actions: {
        clearFavoriteChip: () => ({type:'CLEAR_FAVORITE_CHIP'})
      },
      selectors: {}
    };
    const drink = {
      reducers: {
        favorite: (state = 'mountain dew', action) => state
      },
      actions: {
        clearFavoriteDrink: () => ({type:'CLEAR_FAVORITE_DRINK'})
      },
      selectors: {}
    };

    const globalDefinitions = {
      globalActions: {
        clearFavorites: (actions) => ({type:'CLEAR_FAVORITES'})
      }
    };

    const { store, actions } = createStore({chips, drink}, globalDefinitions);

    expectObjKeysToDeepEqual(actions, ['clearFavoriteChip', 'clearFavoriteDrink', 'clearFavorites']);

    expect(actions.clearFavoriteChip()).to.deep.equal({type:'CLEAR_FAVORITE_CHIP'});
    expect(actions.clearFavoriteDrink()).to.deep.equal({type:'CLEAR_FAVORITE_DRINK'});
    expect(actions.clearFavorites()).to.deep.equal({type:'CLEAR_FAVORITES'});
  });

  itWithConsoleErrorsSpy('should consoleErrors for invalid reducer config', function () {
    const chips = {};
    const drinks = {};

    createStore({chips, drinks});

    expect(consoleErrors.invalidReducerConfig.callCount).to.equal(2);
  });

  itWithConsoleErrorsSpy('should should not add reducer config that does not contain all three config keys ("reducers", "actions", "selectors") or the value of one is not an object', function () {
    const chips = {
      reducers: {},
      actions: {},
      selectors: {}
    };
    const drinks = {
      reducers: {},
      actions: {},
      selectors: 'I should not be a string! Doh!'
    };

    const { store } = createStore({chips, drinks});
    expect(store.getState()).to.deep.equal({chips:{}});
  });

  it('should include redux-freeze when not in production');
  it('should not include redux-freeze when in production');
  it('should only include window.devToolsExtension enhancer when defined and not in production');
});
