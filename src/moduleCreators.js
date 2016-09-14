export function settableValue(initialValue, selectorName, actionName, actionType = actionName) {
  return {
    reducer: (state = initialValue, action) => {
      if (action.type === actionType) {
        return action.payload;
      } else {
        return state;
      }
    },
    actions: {
      [actionName]: (payload) => ({
        type: actionType,
        payload
      })
    },
    selectors: {
      [selectorName]: state => state
    }
  }
}
