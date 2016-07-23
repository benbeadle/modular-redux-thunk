

// When combining the reducers and actions, duplicate keys will be overridden.
// In local and dev, console an error warning that there's duplicated name so
// they are aware.
// Also error when they are trying to create an action object and one of the
// actions doesn't exist.
let consoleErrors = {};
if(__LOCAL__ || __DEV__) {
  consoleErrors.errorDuplicate = (name, propName, combinedItems) => {
    if(propName in combinedItems) {
      console.error(`Warning: Duplicated ${name} by the name of '${propName}' found. Make sure you give each ${name} a unique name.`);
    }
  };
  consoleErrors.errorActionMissing = (name, combinedActions) => {
    if(!(name in combinedActions)) {
      console.error(`Warning: Couldn't find action ${name}. Make sure you define the action in a reducer.`);
    }
  };
}

export default createReducerStore;
export { combineSelectors, combineActions };
