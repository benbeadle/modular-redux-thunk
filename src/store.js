/**
 * modular-redux-thunk createStore.
 * @module modular-redux-thunk
 */

import { combineReducers, createStore as reduxCreateStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import combineSelectors from './selectors.js';
import combineActions, { pickActions as pickActionsWrapper } from './actions.js';

import consoleErrors from './consoleErrors.js';

// Since both globalDefinitions and reduxConfig are optional, we need to ensure they
// didn't pass in reduxConfig as the second argument. So if there are globalDefinitions
// and no reduxConfig, then test to see if it's really the reduxConfig.
// This is done by checking if all keys in globalDefinitions don't start "global" -> reduxConfig.
export const switchGlobalDefinitionsAndReduxConfig = (globalDefinitions=null, reduxConfig=null) => {
  if(globalDefinitions !== null && reduxConfig === null) {
    // If globalDefinitions doesn't have any keys that start with "global", then we
    // just assume it's reduxConfig.
    const globalDefKeys = Object.keys(globalDefinitions);
    let isReduxConfig = true;
    for(let i = 0; i < globalDefKeys.length; i++) {
      if(globalDefKeys[i].substring(0, 6) === 'global') {
        isReduxConfig = false;
        break;
      }
    }

    // If it is redux config, then switch the objects.
    if(isReduxConfig) {
      reduxConfig = globalDefinitions;
      globalDefinitions = null;
    }
  }

  return { globalDefinitions, reduxConfig };
};

/**
 * createStore converts the passed in redux and returns the store, selectors, and actions.
 * Also spits out console.error logs if a reducer config in modularReduxDefinition is invalid.
 * @param  {Object} modularReduxDefinition    The modular redux thunk config.
 * @param  {Object} [globalDefinitions={}]    Global selectors and actions.
 *                                            Allowed keys: [globalSelectors, globalActions]
 * @param  {Object} [reduxConfig={}]          Configuration you'd like passed to redux.
 *                                            Allowed keys: [reducers, middleware, enhancers]
 * @return {Object}                           Returns an object that contains the store,
 *                                            selectors, actions, and pickActions method.
 */
const createStore = (modularReduxDefinition, globalDefinitions=null, reduxConfig=null) => {

  // Since both globalDefinitions and reduxConfig are optional, we need to figure out
  // if they only passed in globalDefinitions and it's really reduxConfig.
  // NOTE: This was moved to another function for easy testing.
  ({ globalDefinitions, reduxConfig } = switchGlobalDefinitionsAndReduxConfig(globalDefinitions,reduxConfig));



  // Extract all the variables from the optional params.
  const { globalSelectors = {}, globalActions = {} } = (globalDefinitions || {});
  const { reducers = {}, middleware = [], enhancers = [] } = (reduxConfig || {});

  // Break down modularReduxDefinition into objects for the reducer,
  // selectors, and actions of each reducer defined.
  const reducerSelectors = {};
  const reducerActions = {};
  Object.keys(modularReduxDefinition).forEach(name => {
    const reducer = modularReduxDefinition[name];
    // We only add the config if it's a valid defined reducer.
    if(!consoleErrors.invalidReducerConfig(name, reducer)) {
      // Since the reducers is an object of reducers, combine them into one reducer.
      reducers[name] = combineReducers(reducer['reducers']);
      reducerSelectors[name] = reducer['selectors'];
      reducerActions[name] = reducer['actions'];
    }
  });

  // Create the root reducer which combines all other reducers.
  // This will also include any custom reducers passed into reduxConfig.
  const rootReducer = combineReducers(reducers);

  // Combine all reducer's selectors and any global selectors into one.
  const selectors = combineSelectors(reducerSelectors, globalSelectors);

  // Combine all actions and return the action props creator function
  const actions = combineActions(reducerActions, globalActions);
  // Bind the actions object as the first argument so the picking can actually be done.
  const pickActions = pickActionsWrapper.bind(pickActionsWrapper, actions);

  // Thunk allows us to use async actions
  middleware.push(thunk);

  const isNotProd = process.env.NODE_ENV !== 'production';

  // If we aren't in production, then add redux freeze to ensure the
  // state is never directly manipulated.
  if (isNotProd) {
    // Ensure the state is never modified directly using redux-freeze.
    // NOTE: This is NOT included in the production build.
    middleware.push(require('redux-freeze'));
  }

  // Apply all middlewares and add to the enhancers.
  if(middleware.length > 0) {
    enhancers.push(applyMiddleware(...middleware));
  }

  // Allow use of the Redux DevTools Chrome extension.
  // (https://github.com/zalmoxisus/redux-devtools-extension)
  // NOTE: This needs to be the last enhancer!
  if (isNotProd && 'window' in global && window.devToolsExtension) {
    enhancers.push(window.devToolsExtension());
  }

  // Compose all of the enhancers into one function.
  // The compose function will return a function even if the enhancers
  // array is empty. That just returns a function that is pointless, so
  // use the if to be more efficient.
  // NOTE: Set to undefined since the createStore function checks for that,
  // so I wanted to make it explicit.
  let composedEnhancers = undefined;
  if(enhancers.length > 0) {
    composedEnhancers = compose(...enhancers);
  }

  // Now create the store from the reducer,
  const store = reduxCreateStore(rootReducer, undefined, composedEnhancers);

  return { store, selectors, actions, pickActions };
};

export default createStore;
