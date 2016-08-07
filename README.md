
A [ducks](https://github.com/erikras/ducks-modular-redux)-inspired package to help organize actions, reducers, and selectors together.

# Motivation

```
import { routerReducer as routing } from 'react-router-redux';
{
  routing: routing
}
```

```
middleware.push(require('redux-freeze'));
```

Each reducer is only aware of it's own state.


# Releasing
```
Commit all changes
Build (clean, build, test:build)
npm version premajor #v1.0.0-beta1
npm publish
git push origin HEAD:master --tags
```


# TODO
* This readme...
* Finish pending tests
* Travis CI
* Add Gemnasium and other status images
* Coveralls.io / Fix Istanbul
* Minify build
