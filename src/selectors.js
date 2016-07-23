import consoleErrors from './consoleErrors.js';

// From each reducer, grab the selectors and combine them all into one object.
// Also create a wrapper for each selector to get the state for that reducer.
// Each reducer only knows about it's own state nothing else.
// If you need a selector that handles multiple states, then pass "global"
// selectors as the second argument
const combineSelectors = (reducers, selectors = {}) => {
  let combinedSelectors = {};

  // Create the wrapper so the reducer's state is passed to the selector
  // instead of state.
  const selectorWrapper = (reducerName, selector, state) => selector(state[reducerName]);

  // Loop through each reducer and get the selectors
  Object.keys(reducers).map(reducerName => {
    const reducerSelectors = reducers[reducerName];

    // For each selector, console error if there's a duplicate
    // and then add it to the combined selectors.
    Object.keys(reducerSelectors).map(selectorName => {
      const selector = reducerSelectors[selectorName];
      if(process.env.NODE_ENV !== 'production') {
        consoleErrors.errorDuplicate('selector', selectorName, combinedSelectors);
      }
      combinedSelectors[selectorName] = selectorWrapper.bind(this, reducerName, selector);
    });
  });

  // If there's any global selectors, then do the same thing as above.
  //let globalSelectors = {};
  Object.keys(selectors).map(selectorName => {
    const selector = selectors[selectorName];

    if(process.env.NODE_ENV !== 'production') {
      consoleErrors.errorDuplicate('selector', selectorName, combinedSelectors);
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
