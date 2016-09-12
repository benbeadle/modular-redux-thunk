import createStore from './store.js';
import { combineModules } from './modules';

// Instead of:
//    "export default createStore"
// Reasoning: Babel 6 compile the above line to:
//    exports.default = createStore;
// But we don't to require users to do:
//    require('modular-redux-thunk').default
module.exports = createStore;
module.exports.combineModules = combineModules;
