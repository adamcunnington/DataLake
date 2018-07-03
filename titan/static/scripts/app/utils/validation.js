
const requiredScheduleFields = {
  execution: [
    'ScheduledExecutionName',
    'ScheduledExecutionClientName',
    'ScheduledExecutionDataSourceName',
    'ScheduledExecutionDataSetName',
    'ScheduledExecutionNextLoadDate',
    'ScheduledExecutionUser'
  ]
};

const requiredAdhocFields = {
  execution: [
    'ExecutionClientName',
    'ExecutionDataSourceName',
    'ExecutionDataSetName',
    'ExecutionLoadDate',
    'ExecutionUser'
  ]
};

function isValid(value) {

  if (typeof value === 'object') {
    return true;
  }

  return !!value
    && typeof value.trim === 'function'
    && !!value.trim().length;
}

export function validateScheduleData(data, acquireOptionConfig, extractOptionConfig) {

  // Validate execution
  for (let field of requiredScheduleFields.execution) {
    if (!isValid(data.execution[field])) {
      console.log('execution: ' + field);
      return false;
    }
  }

  const requiredAcquireOptions = acquireOptionConfig
    ? acquireOptionConfig
        .filter(option => option.AcquireProgramOptionRequired)
        .map(option => option.AcquireProgramOptionName)
    : [];

  // Check acquires, if applicable
  for (let acquire of data.acquires) {

    // Check name
    if (!isValid(acquire.ScheduledAcquireName)) {
      return false;
    }

    // Check required options
    for (let optionName of requiredAcquireOptions) {
      const option = acquire.Options
        .find(option => option.ScheduledAcquireOptionName === optionName);
      if (!option || !isValid(option.ScheduledAcquireOptionValue)) {
        return false;
      }
    }
  }

  // Check extract options, if applicable
  if (data.extract.ScheduledExtractDestination) {
    const requiredExtractOptions = extractOptionConfig
      .filter(option => option.ExtractProgramOptionRequired)
      .map(option => option.ExtractProgramOptionName);

    for (let optionName of requiredExtractOptions) {
      const option = data.extract.Options
        .find(option => option.ScheduledExtractOptionName === optionName);
      if (option && !isValid(option.ScheduledExtractOptionValue)) {
        return false;
      }
    }
  }

  return true;
}

export function validateAdhocData(data, acquireOptionConfig, extractOptionConfig) {

  // Validate execution
  for (let field of requiredAdhocFields.execution) {
    if (!isValid(data.execution[field])) {
      return false;
    }
  }

  const requiredAcquireOptions = acquireOptionConfig
    ? acquireOptionConfig
        .filter(option => option.AcquireProgramOptionRequired)
        .map(option => option.AcquireProgramOptionName)
    : [];

  // Check acquires, if applicable
  for (let acquire of data.acquires) {

    // Note: No name supplied for adhoc executions

    // Check required options
    for (let optionName of requiredAcquireOptions) {
      const option = acquire.Options
        .find(option => option.AcquireOptionName === optionName);
      if (!option || !isValid(option.AcquireOptionValue)) {
        return false;
      }
    }
  }

  // Check extract options, if applicable
  if (data.extract.ScheduledExtractDestination) {
    const requiredExtractOptions = extractOptionConfig
      .filter(option => option.ExtractProgramOptionRequired)
      .map(option => option.ExtractProgramOptionName);

    for (let optionName of requiredExtractOptions) {
      const option = data.extract.Options
        .find(option => option.ExtractOptionName === optionName);
      if (option && !isValid(option.ExtractOptionValue)) {
        return false;
      }
    }
  }

  return true;
}
