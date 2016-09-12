import consoleErrors from './consoleErrors.js';

/**
 * Combines the actions from all reducers, and any global actions. Also spits
 * out console.error logs when duplicated action names are found or action
 * definitions aren't functions.
 * @param  {Object} reducers           The object where each key is a reducer
 *                                     name and the value is that reducer's
 *                                     actions object.
 * @param  {Object} [globalActions={}] The object of global actions. Global
 *                                     actions differ than reducer actions as
 *                                     the first argument passed to them will
 *                                     always be the actions object. This allows
 *                                     global actions to trigger reducer actions.
 * @return {Object}                    All actions combined into one object.
 */
const combineActions = (reducers) => {
  let combinedActions = {};

  // Combine all reducers' actions into one object.
  Object.keys(reducers).forEach(reducerName => {
    const reducerActions = reducers[reducerName];

    Object.keys(reducerActions).forEach(actionName => {
      // Console if another action exists with the same name.
      if(consoleErrors.duplicateName('action', actionName, combinedActions)) {
        return;
      }

      // If it's not a function, then don't add the action
      if(consoleErrors.notFunction('action', actionName, reducerActions[actionName])) {
        return;
      }

      combinedActions[actionName] = reducerActions[actionName];
    });
  });

  return combinedActions
};

const addGlobalActions = (combinedActions, globalActions) => {
  // If there's any global actions, then do the same thing as above.
  Object.keys(globalActions).forEach(actionName => {
    const globalAction = globalActions[actionName];

    if(consoleErrors.duplicateName('action', actionName, combinedActions)) {
      return;
    }

    // If it's not a function, then don't add the action
    if(consoleErrors.notFunction('global action', actionName, globalAction)) {
      return;
    }

    // This is more of a warning, so we don't have to return if true.
    consoleErrors.noArgsDefined('global action', actionName, globalAction, 'the actions object');

    // Global actions have an extra argument. They get the combined actions
    // which allows them to call actions from any/all reducers.
    combinedActions[actionName] = globalAction.bind(this, combinedActions);
  });

  return combinedActions;
}

/**
 * A function useful to components so they can pick what actions they use so
 * when using react-redux, they don't pass the entire actions object. Components
 * should NOT pass the entire actions object to react-redux. Also spits
 * out console.error logs when action names are not found.
 * @param  {Object} actions           The object of actions that's returned from
 *                                    combineActions above. Used to create a "sub"
 *                                    objects of desired actions.
 * @param  {...string[]} actionNames  The list of action names to be picked from actions.
 * @return {Object}                   The new "sub" object of actions.
 */
const pickActions = (actions, ...actionNames) => {
  let subActions = {};

  actionNames.forEach(actionName => {
    // Only add it if the action exists
    if(!consoleErrors.actionMissing(actionName, actions)) {
      subActions[actionName] = actions[actionName];
    }
  });

  return subActions;
};

export default combineActions;
export { pickActions, addGlobalActions };
