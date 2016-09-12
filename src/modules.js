import { combineReducers } from 'redux';
import combineActions from './actions';
import combineSelectors from './selectors';
import consoleErrors from './consoleErrors';

const getReducerFromModule = (module) =>
  module.reducers
    ? combineReducers(module.reducers)
    : module.reducer;

export function combineModules(modules) {
  // Break down modules into objects for the reducer,
  // selectors, and actions of each reducer defined.
  const reducers = {};
  const moduleSelectors = {};
  const moduleActions = {};
  Object.keys(modules).forEach(name => {
    const module = modules[name];
    // We only add the config if it's a valid defined module.
    if(!consoleErrors.invalidReducerConfig(name, module)) {
      // Since the reducers is an object of reducers, combine them into one module.
      reducers[name] = getReducerFromModule(module);
      moduleSelectors[name] = module.selectors;
      moduleActions[name] = module.actions;
    }
  });

  const reducer = combineReducers(reducers);
  const selectors = combineSelectors(moduleSelectors);
  const actions = combineActions(moduleActions);

  return {
    reducer,
    actions,
    selectors,
  };
}

export function reducerToModule(reducer) {
  return {
    reducer,
    actions: {},
    selectors: {}
  };
}
