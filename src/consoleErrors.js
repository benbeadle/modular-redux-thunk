import warning from 'warning';

const consoleErrors = {};

/**
 * Display a console error when propName exists in combinedItems. This is used
 * when combining actions and selectors, the developer doesn't accidentally
 * use the same name twice unknowingly.
 * @param  {string} name          The type. Either "action" or "selector".
 * @param  {string} propName      The prop name that should be in combinedItems.
 * @param  {object} combinedItems The object to check if propName exists.
 * @return {bool}                   Returns true if the action already exists, else false.
 */
consoleErrors.duplicateName = (name, propName, combinedItems) => {
  const propExists = propName in combinedItems;
  warning(!propExists, `Duplicated ${name} by the name of '${propName}' found. Make sure you give each ${name} a unique name.`);
  return propExists;
};

/**
 * Display a console error when the action doesn't exist.
 * @param  {string} actionName      The desired action.
 * @param  {object} combinedActions The object of all actions.
 * @return {bool}                   Returns true if the action is missing, else false.
 */
consoleErrors.actionMissing = (actionName, combinedActions) => {
  const propMissing = !(actionName in combinedActions);
  warning(!propMissing, `Couldn't find action ${actionName}. Make sure you define the action in a reducer.`);
  return propMissing;
};

/**
 * Display a console error when the func isn't a function.
 * @param  {string} funcType    The type, such as "action", "global action", etc.
 * @param  {string} funcName    The defined name.
 * @param  {*}      func        The object to test.
 * @return {bool}               True if the func isn't a function, else false.
 */
consoleErrors.notFunction = (funcType, funcName, func) => {
  const funcObjectType = typeof func;
  const notFunction = funcObjectType !== 'function';
  warning(!notFunction, `The ${funcType} ${funcName} must be a function, not ${funcObjectType}.`);
  return notFunction;
};

/**
 * Display a console error when the func doesn't have at least one argument defined.
 * @param  {string}   name      The type, such as "global action", "selector", or "global selector".
 * @param  {string}   funcName  The defined name.
 * @param  {function} func      The function to test.
 * @param  {string}   argDesc   The description of what the argument is.
 * @return {bool}               True if there are 0 args defined, else false.
 */
consoleErrors.noArgsDefined = (name, funcName, func, argDesc) => {
  const noArgsDefined = func.length === 0;
  warning(!noArgsDefined, `The ${name} ${funcName} should define at least one argument - ${argDesc}.`);
  return noArgsDefined;
};

/**
 * Displays a console error if a reducer config is missing one of the required field properties
 * or that value is not an object.
 * @param  {string} reducerName   The reducer name.
 * @param  {object} reducerConfig The object to test if it's missing any required keys.
 * @return {bool}                 True if it's missing a key or the key value is invalid, else false.
 */
consoleErrors.invalidReducerConfig = (reducerName, reducerConfig) => {
  const requiredKeys = ['actions', 'selectors'];
  for(let i = 0; i < requiredKeys.length; i++) {
    const key = requiredKeys[i];

    // Make sure the key exists and is an object.
    if(!(key in reducerConfig)) {
      warning(false, `The ${reducerName} config should have a "${key}" property defined.`);
      return true;
    } else if(typeof reducerConfig[key] !== 'object') {
      warning(false, `The "${key}" value of the ${reducerName} config should be an object, not ${typeof reducerConfig[key]}.`);
      return true;
    }
  }

  let hasReducer = false;

  if (reducerConfig.reducers) {
    if (typeof reducerConfig.reducers !== 'object') {
      warning(false, `The "reducers" value of the ${reducerName} config should be an object, not ${typeof reducerConfig.reducers}.`);
      return true;
    }
    hasReducer = true;
  } else if (reducerConfig.reducer) {
    if (typeof reducerConfig.reducer !== 'function') {
      warning(false, `The "reducer" value of the ${reducerName} config should be a function, not ${typeof reducerConfig.reducer}.`);
      return true;
    }
    hasReducer = true;
  }

  if (!hasReducer) {
    warning(false, `The ${reducerName} config should have either a "reducer" or "reducers" property defined.`);
    return true;
  }

  return false;
};

export default consoleErrors;
