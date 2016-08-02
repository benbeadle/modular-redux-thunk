import { combineReducers, createStore, applyMiddleware, compose } from 'redux';

import combineSelectors from './selectors.js';
import combineActions, { pickActionsWrapper } from './actions.js';

export default (reducerData, globalReducerData={}, reduxConfig={}) => {
  console.log(reduxConfig);

  const reducerSelectors = {};
  const reducerActions = {};

  Object.keys(reducerData).map(name => {
    reducers[name] = reducerData[name]['reducer'];
    reducerSelectors[name] = reducerData[name]['selectors'];
    reducerActions[name] = reducerData[name]['actions'];
  });

  // Create the root reducer which combines all other reducers.
  // This is also where react-router-redux is included
  const rootReducer = combineReducers(reducers);

  // Combine all reducer's selectors and any global selectors into one.
  const selectors = combineSelectors(reducerSelectors, globalSelectors);

  // Combine all actions and return the action props creator function
  const actions = combineActions(reducerActions, globalActions);
  const pickActions = pickActionsWrapper(actions);

  // Thunk allows us to create async actions.
  const middleware = [thunk];
  let devToolsExtension = f => f;
  if (process.env.NODE_ENV !== 'production') {
    // Ensure the state is never modified directly
    middleware.push(require('redux-freeze'));

    // Allow use of the Redux DevTools Chrome extension.
    // (https://github.com/zalmoxisus/redux-devtools-extension)
    if(window.devToolsExtension) {
      devToolsExtension = window.devToolsExtension();
    }
  }

  // Create the store with all middleware and include devToolsExtension if
  // local and the extension is installed.
  const store = createStore(rootReducer, undefined, compose(
    applyMiddleware(...middleware),
    devToolsExtension
  ));

  return { store, selectors, actions, pickActions };
};
