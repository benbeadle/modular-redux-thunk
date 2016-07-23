const consoleErrors = {};

consoleErrors.errorDuplicate = (name, propName, combinedItems) => {
  if(propName in combinedItems) {
    console.error(`Warning: Duplicated ${name} by the name of '${propName}' found. Make sure you give each ${name} a unique name.`);
  }
};
consoleErrors.errorActionMissing = (name, combinedActions) => {
  if(!(name in combinedActions)) {
    console.error(`Warning: Couldn't find action ${name}. Make sure you define the action in a reducer.`);
  }
};

export default consoleErrors;
