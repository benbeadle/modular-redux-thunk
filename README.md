Modular Redux Thunk
=============

[![Dependency Status](https://gemnasium.com/badges/github.com/benbeadle/modular-redux-thunk.svg)](https://gemnasium.com/github.com/benbeadle/modular-redux-thunk) [![npm version](https://img.shields.io/npm/v/modular-redux-thunk.svg?style=flat-square)](https://www.npmjs.com/package/modular-redux-thunk) [![Build Status](https://travis-ci.org/benbeadle/modular-redux-thunk.svg?branch=master)](https://travis-ci.org/benbeadle/modular-redux-thunk)

A [ducks](https://github.com/erikras/ducks-modular-redux)-inspired package to help organize actions, reducers, and selectors together - with built-in [redux-thunk](https://github.com/gaearon/redux-thunk) support for async actions.


### Rules
- **Each module is only aware of it's own state.** Reducer's don't care or know about each other's state.
- **Only a module should be aware of how its state is structured.** You define all actions, reducers, and selectors in each module that manipulate and retrieve data from that reducer.
- **You can define global actions and global selectors.** Occasionally, you'll need to dispatch actions or define selectors that use multiple reducers. Global actions have access to all defined actions, and global reducers have access to all defined selectors.
- **Connected components should not assume to know how the store is structured.** When creating connected components, you should never reference the state directly. Instead, use the selectors you've defined in each module, and any global reducers, to return that data.
- **You should not have to update your connected components when changing your store's structure.** This is a huge bonus. Since all components use *pickActions* and *selectors* (more about that below), you can change your store's structure as much as you'd like. For example, you can move a data node from one module to another without affecting your components - as along as you maintain your actions and update your selectors to reflect the latest structure.

# Installation

`npm install --save modular-redux-thunk`

```js
import createStore from 'modular-redux-thunk';

const { store, pickActions, selectors } = createStore(myModules);
```

You can also include custom reducers, middleware, or enhancers. For example, if you install react-router and redux-freeze:

```
npm install --save react-router
```

```js
import createStore from 'modular-redux-thunk';
import { routerReducer } from 'react-router-redux';

const { store, pickActions, selectors } = createStore(myModules, {
	reducers: {
		routing: routerReducer
	},
	enhancers: []
});
```

# Example

Let's say your app will be storing the following information in the state:
* A list of chips you sell
* The logged-in-user's favorite chips
* A list of drinks you sell
* The logged-in-user's favorite drink

`reducers/chips.js`
```js
const actions = {};
const reducers = {};
const selectors = {};
const ACTION_PREPEND = 'my-react-app/chips';

const SET_FAVORITE_CHIPS = `${ACTION_PREPEND}/SET_FAVORITE_CHIPS`;
reducers.favorite = (state = 'unknown', action) => {
  switch(action.type) {
    case SET_FAVORITE_CHIPS: return action.newFav;
    default: return state;
  };
};
actions.setFavoriteChips = (newFav) => {
  return {
    type: SET_FAVORITE_CHIPS,
    newFav
  };
};
selectors.getFavoriteChips = (chipsState) => chipsState.favorite;

const SET_CHIPS_FOR_SALE = `${ACTION_PREPEND}/SET_CHIPS_FOR_SALE`;
reducers.chipsForSale = (state = [], action) => {
  switch(action.type) {
    case SET_CHIPS_FOR_SALE: return action.chips;
    default: return state;
  };
};
actions.setChipsForSale = (chips) => {
  return {
    type: SET_CHIPS_FOR_SALE,
    chips
  };
};
selectors.getChipsForSale = (chipsState) => chipsState.chips;

export default { actions, reducers, selectors };
```

`reducers/drinks.js`
```js
import { combineModules, settableValue } from 'modular-redux-thunk';
const actions = {};
const reducers = {};
const selectors = {};
const ACTION_PREPEND = 'my-react-app/drinks';

// You can also define individual modules and combine them
const SET_FAVORITE_DRINK = `${ACTION_PREPEND}/SET_FAVORITE_DRINK`;
const favorite = {
	reducer: (state = 'unknown', action) => {
	  switch(action.type) {
	    case SET_FAVORITE_DRINK: return action.newFav;
	    default: return state;
	  };
	},
	actions: {
		setFavoriteDrink: (newFav) => ({
	    type: SET_FAVORITE_DRINK,
	    newFav
	  })
	},
	selectors: {
		getFavoriteDrink: (favoriteDrinkState) => favoriteDrinkState;
	}
}

// Or even use a module creator function to automate this common pattern
const drinksForSale = settableValue([], 'getDrinksForSale', 'setDrinksForSale');

export default combineModules({
	favorite,
	drinksForSale
});
```

`reducers/selectors.js`
```js
export const getUserFavorites = (selectors, state) => {
  return {
    chips: selectors.getFavoriteChips(state),
    drink: selectors.getFavoriteDrink(state)
  }
};
```

`reducers/actions.js`
```js
export const setUserFavorites = (actions, favChips, favDrink) => {
  return function(dispatch) {
    dispatch(actions.setFavoriteChips(favChips));
    dispatch(actions.setFavoriteDrink(favDrink));
  };
};
```

`reducers/index.js`
```js
import createStore from 'modular-redux-thunk';

import chips from './chips.js';
import drinks from './drinks.js';
import * as globalActions from './actions.js';
import * as globalSelectors from './selectors.js';

const modules = {chips, drinks};

const globals = {
  globalActions: globalActions,
  globalSelectors: globalSelectors
};

const { store, selectors, pickActions } = createStore(modules, globals);
export { store, selectors, pickActions };
```

`app.js`
```js
import React from 'react';
import { Provider, connect } from 'react-redux';
import { store, selectors, pickActions } from './reducers';

// Create the connected component
class _AppComponent extends React.Component {
  render() {
    const { favorites } = this.props;

    const statement = `My favorite kind of chips are ${favorites.chips} and drink is ${favorites.drink}!`;
    return (<div>{ statement }</div>);
  }
};
_AppComponent.propTypes = {
  setFavoriteChips: React.PropTypes.func,
  favorites: React.PropTypes.object
};
const AppComponent = connect(state => {
  return {
    favorites: selectors.getUserFavorites(state)
  };
}, pickActions('setFavoriteChips'))(_ChipsComponent);

const AppWrapper = (props) => {
	return (<Provider store={ store }><AppComponent /></Provider>);
};

ReactDOM.render(
  <AppWrapper />,
  document.getElementById('app')
);
```

# API Reference

## Module

A module object consists of:

- One of the following:
	- `reducer` - A standard Redux reducer function. Each reducer should be defined in it's simplest form. For example, define reducers that are strings, booleans, numbers, or arrays.
	- `reducers` - An object of Redux reducer functions. If you choose this option, its value will be run through `Redux.combineReducers`.
- `actions` (*object*): A map of action creator functions. Each action should return an object with, at the very least, a `type` property.
- `selectors` (*object*): Selector functions that connected components call to get parts of the state. A selector's first and only argument is the module's current state.

## `createStore(modules, [globalDefinitions], [reduxConfig])`

Creates a Redux store that combines your reducers into a single and complete state tree.

### Arguments

1. `modules` (*object*): Defines the global structure of the store. Each key represents the modules's location in the store, and the value is the module object itself. Module objects are described above.
2. `[globalDefinitions]` (*object*):  Pass in any global actions or selectors. Globals are given access to all reducers. You can pass in the following keys:
	- `[globalActions]` (*object*):  Actions that can themselves perform actions from any reducer. Global actions differ from reducer actions in that the first argument will always be:
		- `combinedActions` (*object*):  All combined actions from reducers. This allows you to reference reducer-defined actions.
	- `[globalSelectors]` (*object*):  Selectors that have access to all reducer-defined selectors. Global selectors differ from reducer selectors in that the first argument will always be:
		- `combinedSelectors` (*object*):  All combined selectors from reducers. This allows you to reference reducer-defined selectors.
3. `[reduxConfig]` (*object*):  Any custom redux config. You can pass in the following keys:
	- `[reducers]` (*object*):  Additional reducers you'd like to be added to the store. For example, if using react-router, you can pass in `routing` which will be added to the store.
	- `[middleware]` (*array*):  Any custom middleware to be added to the store. [redux-thunk](https://github.com/gaearon/redux-thunk) is automatically included as a middleware for your convenience.
	- `[enhancers]` (*array*):  Any custom enhancers to be added to the store, such as [redux-freeze](https://github.com/buunguyen/redux-freeze). When not in production, [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) is automatically added for your convenience.

### Returns

Returns an object with the following properties:

1. `store` (*Store*): A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
2. `pickActions` (*function*): A function that returns an object of desired actions out of all available actions. Use this instead of passing the `actions` object to your connected components.
3. `selectors` (*object*): All combined selectors for use when connecting your components.
4. `actions` (*object*): All available actions. You can cherry-pick actions here as opposed to using `pickActions`.

## `combineModules(modules)`

Takes a map of Module objects and returns a single Module object.

## `settableValue(initialValue, selectorName, actionName, [actionType])`

Creates a module that controls a single value and responds to a single "set" action, as is quite common in Redux.

### Arguments

1. `initialValue` - The initial value of the module
2. `selectorName` - The name of the module's single selector - usually something like `getMyValue`
3. `actionName` - The name of the module's single action creator - usually something like `setMyValue`
4. `actionType` - Optional. The action's type constant - usually something like `SET_MY_VALUE`. If not set, it will default to `actionName`.

# TODO
- Finish pending tests
- Coveralls.io / Fix Istanbul (and status)
- Minify build


#### Releasing
```
Commit all changes
npm run build # runs "npm test && npm run clean:build && npm run build && npm run test:build"
npm version "v1.0.0-beta1" -m "Message"
npm publish
git push origin HEAD:master --tags
# Update Changelog
```
