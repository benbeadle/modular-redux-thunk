import warning from 'warning';

const consoleErrors = {};

consoleErrors.errorDuplicate = (name, propName, combinedItems) => {
  warning(propName in combinedItems, `Warning: Duplicated ${name} by the name of '${propName}' found. Make sure you give each ${name} a unique name.`);
};
consoleErrors.errorActionMissing = (name, combinedActions) => {
  warning(!(name in combinedActions), `Warning: Couldn't find action ${name}. Make sure you define the action in a reducer.`);
};

export default consoleErrors;
