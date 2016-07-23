import consoleErrors from './consoleErrors.js';

// Combine all the actions for each reducer into one object and then
// return a function to be used in components to quickly create a props object
// passed to react-redux's connect.
const combineActions = (reducers, actions = {}) => {
  let combinedActions = {};

  // Combine all reducers' actions into one object.
  Object.keys(reducers).map(reducerName => {
    const reducerActions = reducers[reducerName];

    Object.keys(reducerActions).map(actionName => {
      if(process.env.NODE_ENV !== 'production') {
        consoleErrors.errorDuplicate('action', actionName, combinedActions);
      }
      combinedActions[actionName] = reducerActions[actionName];
    });
  });

  // If there's any global actions, then do the same thing as above.
  Object.keys(actions).map(actionName => {
    const action = actions[actionName];

    if(process.env.NODE_ENV !== 'production') {
      consoleErrors.errorDuplicate('action', actionName, combinedActions);
    }

    // Global actions have an extra argument. They get the combined actions
    // which allows them to call actions from all reducers.
    combinedActions[actionName] = action.bind(this, combinedActions);
  });

  return combinedActions;
};

// Return a function that allows easily creating action objects. Pass
// the actions you want to include as parameters and the object will
// be returned.
// In local and dev, a console error will occur if you try to include
// an action that doesn't exist.
const pickActionsWrapper = (actions) => {
  return (...actionNames) => {
    let subActions = {};
    actionNames.map(actionName => {
      if(process.env.NODE_ENV !== 'production') {
        consoleErrors.errorActionMissing(actionName, actions);
      }

      // Only add it if the action exists
      if(actionName in actions) {
        subActions[actionName] = actions[actionName];
      }
    });
    return subActions;
  };
};

export default combineActions;
export { pickActionsWrapper };
