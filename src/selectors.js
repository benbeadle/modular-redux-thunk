import consoleErrors from './consoleErrors.js';

/**
 * Combines the selectors from all reducers, and any global selectors. Also spits
 * out console.error logs when duplicated selector names are found or selector
 * definitions aren't functions.
 * @param  {Object} reducers              The object where each key is a reducer
 *                                        name and the value is that reducer's
 *                                        selectors object. A selector's first
 *                                        argument will always be the state of
 *                                        the reducer it's defined in.
 * @param  {Object} [globalSelectors={}]  The object of global selectors. Global
 *                                        selectors differ than reducer selectors
 *                                        in that the first argument will the
 *                                        selectors object, which allows the
 *                                        global selector to combine data from
 *                                        multiple reducers as one.
 * @return {Object}                    All selectors combined into one object.
 */
const combineSelectors = (reducers, globalSelectors = {}) => {
  let combinedSelectors = {};

  // Create the wrapper so the reducer's state is passed to the selector
  // instead of state (not used for global selectors).
  // This also passes any additional args to the selectors.
  const selectorWrapper = (reducerName, selector, state, ...addtionalArgs) => {
    return selector.apply(selector, [state[reducerName], ...addtionalArgs]);
  };

  // Combine all reducers' selectors into one object.
  Object.keys(reducers).map(reducerName => {
    const reducerSelectors = reducers[reducerName];

    Object.keys(reducerSelectors).map(selectorName => {
      const selector = reducerSelectors[selectorName];

      // Console if another selector exists with the same name.
      if(consoleErrors.duplicateName('selector', selectorName, combinedSelectors)) {
        return;
      }

      // If it's not a function, then don't add the selector
      if(consoleErrors.notFunction('selector', selectorName, selector)) {
        return;
      }

      if(consoleErrors.noArgsDefined('selector', selectorName, selector, `the state of the ${selectorName}'s reducer`)) {
        return;
      }

      // Selectors first argument will always be the state of the reducer it
      // is defined in.
      combinedSelectors[selectorName] = selectorWrapper.bind(this, reducerName, selector);
    });
  });

  // If there's any global selectors, then do the same thing as above.
  Object.keys(globalSelectors).map(selectorName => {
    const selector = globalSelectors[selectorName];

    // Console if another selector exists with the same name.
    if(consoleErrors.duplicateName('selector', selectorName, combinedSelectors)) {
      return;
    }

    // If it's not a function, then don't add the selector
    if(consoleErrors.notFunction('selector', selectorName, selector)) {
      return;
    }

    if(consoleErrors.noArgsDefined('global selector', selectorName, selector, 'the selectors object')) {
      return;
    }

    // Global selectors have an extra argument. They get the combined selectors
    // which allows them to call selectors from all reducers.
    // NOTE: At first I opted in to added these selectors the globalSelectors
    // object as I didn't want these selectors to be available to themselves.
    combinedSelectors[selectorName] = selector.bind(this, combinedSelectors);
  });

  return combinedSelectors;
};

export default combineSelectors;
