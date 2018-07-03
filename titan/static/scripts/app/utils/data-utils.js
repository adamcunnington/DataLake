import moment from 'moment';

// Converts a list of acquire programs into a format to be used by react-select
export function getAcquireProgramOptions(programs) {
  return programs.map(program => {
    return {
      value: program.AcquireProgramKey,
      label: program.AcquireProgramFriendlyName,
      disabled: !program.AcquireProgramEnabled,
      dataSource: program.AcquireProgramDataSourceName,
      options: program.Options
    };
  });
}

// Pulls data to be submitted
export function getExecutionData(data) {

  // Remove scheduled interval key
  const execution = Object.assign({}, data.execution);
  delete execution.ScheduledIntervalKey;

  // Format dates to strings (YYYY-MM-DD HH:mm:ss)
  execution.ScheduledExecutionNextScheduled = formatDateTime(execution.ScheduledExecutionNextScheduled);
  execution.ScheduledExecutionScheduleEnd = formatDateTime(execution.ScheduledExecutionScheduleEnd);
  execution.ScheduledExecutionNextLoadDate = formatDateTime(execution.ScheduledExecutionNextLoadDate, true);

  // Remove interval values, if applicable
  if (execution.ScheduledIntervalMI === 0
      && execution.ScheduledIntervalHH === 0
      && execution.ScheduledIntervalDD === 0) {
    // All values are zero - remove entirely
    delete execution.ScheduledIntervalMI;
    delete execution.ScheduledIntervalHH;
    delete execution.ScheduledIntervalDD;
    delete execution.ScheduledMondayEnabled;
    delete execution.ScheduledTuesdayEnabled;
    delete execution.ScheduledWednesdayEnabled;
    delete execution.ScheduledThursdayEnabled;
    delete execution.ScheduledFridayEnabled;
    delete execution.ScheduledSaturdayEnabled;
    delete execution.ScheduledSundayEnabled;
  }

  // Important - this is an array, not an object literal
  const acquires = data.acquires;

  const extract = Object.assign({}, data.extract);

  return {
    data: {
      execution: execution,
      acquires: acquires,
      extract: extract
    }
  };
}

export function getAdhocExecutionData(data) {

  const execution = Object.assign({}, data.execution);

  // Format load date to string (YYYY-MM-DD HH:mm:ss)
  execution.ExecutionLoadDate = formatDateTime(execution.ExecutionLoadDate, true);

  // Restructure acquires into adhoc format
  const acquires = data.acquires.map(acquire => {
    return {
      Options: acquire.Options.map(option => {
        return {
          AcquireOptionName: option.ScheduledAcquireOptionName,
          AcquireOptionValue: option.ScheduledAcquireOptionValue
        };
      })
    }
  });

  // Restructure extract into adhoc format
  const extract = {
    ExtractDestination: data.extract.ExtractDestination,
    Options: data.extract.Options.map(option => {
      return {
        ExtractOptionName: option.ScheduledExtractOptionName,
        ExtractOptionValue: option.ScheduledExtractOptionValue
      }
    })
  }

  return {
    data: {
      execution: execution,
      acquires: acquires,
      extract: extract
    }
  };
}


function formatDateTime(dateTime, excludeTime) {
  const dateFormat = 'YYYY-MM-DD' + (excludeTime ? '' : ' HH:mm:ss');
  if (typeof dateTime === 'string') {
    return moment.utc(dateTime).format(dateFormat);
  } else if (dateTime === null) {
    return null;
  }
  return dateTime.format(dateFormat);
}

export function createInterval(days, hours, minutes) {
  return {
    ScheduledIntervalDD: days,
    ScheduledIntervalHH: hours,
    ScheduledIntervalMI: minutes
  };
}

export function createBlankIntervalDays() {
  return {
    ScheduledMondayEnabled: true,
    ScheduledTuesdayEnabled: true,
    ScheduledWednesdayEnabled: true,
    ScheduledThursdayEnabled: true,
    ScheduledFridayEnabled: true,
    ScheduledSaturdayEnabled: false,
    ScheduledSundayEnabled: false
  };
}

// Convert data in execution object into simpler weekday data
export function getWeekDays(execution) {
  return {
    Monday: execution.ScheduledMondayEnabled,
    Tuesday: execution.ScheduledTuesdayEnabled,
    Wednesday: execution.ScheduledWednesdayEnabled,
    Thursday: execution.ScheduledThursdayEnabled,
    Friday: execution.ScheduledFridayEnabled,
    Saturday: execution.ScheduledSaturdayEnabled,
    Sunday: execution.ScheduledSundayEnabled
  }
}

// Convert simple weekday data into properties to be merged into an execution object literal
export function getExecutionDays(days) {
  return {
    ScheduledMondayEnabled: days.Monday,
    ScheduledTuesdayEnabled: days.Tuesday,
    ScheduledWednesdayEnabled: days.Wednesday,
    ScheduledThursdayEnabled: days.Thursday,
    ScheduledFridayEnabled: days.Friday,
    ScheduledSaturdayEnabled: days.Saturday,
    ScheduledSundayEnabled: days.Sunday
  }
}

export function isEmpty(dataObj) {
  for (let key in dataObj) {
    if (dataObj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

// Merge two data objects 
export function mergeData(data1, data2) {
  return __mergeObjects(data1, data2);
}

function __mergeObjects(object1, object2) {

  const mergedObject = {};

  // Not an object?  No merging necessary
  if (typeof object1 !== 'object' || typeof object2 !== 'object') {
    return object1;
  }

  // Add all items from object 1, merging with object 2 when appropriate
  for (var key in object1) {

    if (object2.hasOwnProperty(key)) {
      // Ooooh recursion.  Be careful!
      mergedObject[key] = this.__mergeObjects(object1[key], object2[key]);
    } else {
      // Only in object 1 - just add to the object
      mergedObject[key] = object1[key];
    }
  }

  // Add any remaining values in object2
  for (var key in object2) {
    if (!object1.hasOwnProperty(key)) {
      mergedObject[key] = object2[key];
    }
  }

  return mergedObject;
}
