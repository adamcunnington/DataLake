import React from 'react';
import Select from 'react-select';
import RepeatForm from './repeat-form/index.jsx';
import AcquireList from './acquire-list/acquire-list.jsx';
import ExtractForm from './extract/extract-form.jsx';
import TextField from './form-field/text-field.jsx';
import DateField from './form-field/date-field.jsx';
import Label from './label.jsx';
import Ajax from '../utils/ajax';

import { requiredExecutionFields, getAcquireProgramOptions, getExecutionData, getWeekDays, getExecutionDays, validateField } from '../utils/data-utils';

// Import styles
import 'react-select/dist/react-select.css';
import './schedule-form.css';

class ScheduleForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

      execution: {
        ScheduledExecutionKey: this.props.id,
        ScheduledExecutionName: '',
        ScheduledExecutionNextScheduled: null,
        ScheduledExecutionScheduleEnd: null,
        ScheduledExecutionClientName: '',
        ScheduledExecutionDataSourceName: '',
        ScheduledExecutionDataSetName: '',
        ScheduledExecutionNextLoadDate: null,
        ScheduledExecutionUser: '',
        ScheduledExecutionEnabled: true,
        AcquireProgramKey: 0
      },

      acquires: [],
      extract: {
        ScheduledExtractDestination: 0,
        Options: []
      },

      availablePrograms: [],

      includeRepeat: false,

      invalidFields: []
    };

    this.onExecutionChange = this.onExecutionChange.bind(this);
    this.onChangeProgram = this.onChangeProgram.bind(this);
    this.addRepeat = this.addRepeat.bind(this);
    this.removeRepeat = this.removeRepeat.bind(this);
    this.updateRepeat = this.updateRepeat.bind(this);
    this.updateNextScheduled = this.updateNextScheduled.bind(this);
    this.updateScheduleEnd = this.updateScheduleEnd.bind(this);
    this.updateNextLoadDate = this.updateNextLoadDate.bind(this);
    this.updateAcquires = this.updateAcquires.bind(this);
    this.updateExtractDestination = this.updateExtractDestination.bind(this);
    this.updateExtractOptions = this.updateExtractOptions.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.executeNow = this.executeNow.bind(this);
  }

  componentDidMount() {

    // Get acquire prohrams
    Ajax.fetch('/api/acquire-programs/')
      .then(res => res.json())
      .then(result => {
        this.setState({
          availablePrograms: result.data
        });
      });

    if (this.state.execution.ScheduledExecutionKey) {

      Ajax.fetch(`/api/schedules/${this.state.execution.ScheduledExecutionKey}`)
        .then(res => res.json())
        .then(result => {
          this.setState({
            execution: result.data.execution,
            acquires: result.data.acquires,
            extract: result.data.extract,
            includeRepeat: this.shouldIncludeRepeat(result.data.execution)
          });
        });
    }
  }

  onExecutionChange(event) {

    const target = event.target,
      name = target.name,
      value = target.hasOwnProperty('checked') ? target.checked : target.value;

    const execution = this.state.execution;
    execution[name] = value;

    // Remove field validation warning
    let index;
    if ((index = this.state.invalidFields.indexOf(name)) > -1) {
      const invalidFields = this.state.invalidFields;
      invalidFields.splice(index, 1);
      this.setState({
        invalidFields: invalidFields
      });
    }

    this.setState({
      execution: execution
    });
  }

  // Special case for program
  onChangeProgram(program) {

    const execution = this.state.execution;
    execution.AcquireProgramKey = program ? program.value : 0;
    execution.ScheduledExecutionDataSourceName = program ? program.dataSource : '';

    this.setState({
      execution: execution,
      acquires: []
    });
  }

  shouldIncludeRepeat(execution) {
    return execution.ScheduledIntervalDD
        + execution.ScheduledIntervalHH
        + execution.ScheduledIntervalMI
      > 0;
  }

  addRepeat() {

    // Add default interval and day values to this.state
    const execution = Object.assign(
      this.state.execution, {
        ScheduledIntervalDD: 0,
        ScheduledIntervalHH: 0,
        ScheduledIntervalMI: 0,
        ScheduledMondayEnabled: true,
        ScheduledTuesdayEnabled: true,
        ScheduledWednesdayEnabled: true,
        ScheduledThursdayEnabled: true,
        ScheduledFridayEnabled: true,
        ScheduledSaturdayEnabled: true,
        ScheduledSundayEnabled: true
      }
    );

    this.setState({
      execution: execution,
      includeRepeat: true
    });
  }

  removeRepeat() {
    this.setState({
      includeRepeat: false
    });
  }

  updateRepeat(repeat) {

    const execution = this.state.execution;

    Object.assign(
      execution, {
        // Update interval
        ScheduledIntervalDD: repeat.interval.days,
        ScheduledIntervalHH: repeat.interval.hours,
        ScheduledIntervalMI: repeat.interval.minutes
      },
      // Update days
      getExecutionDays(repeat.days)
    );

    // Update state
    this.setState({ execution });
  }

  updateNextScheduled(value) {
    const execution = this.state.execution;
    execution.ScheduledExecutionNextScheduled = value;
    this.setState({
      execution: execution
    });
  }

  updateScheduleEnd(value) {
    const execution = this.state.execution;
    execution.ScheduledExecutionScheduleEnd = value;
    this.setState({
      execution: execution
    });
  }

  updateNextLoadDate(value) {
    const execution = this.state.execution;
    execution.ScheduledExecutionNextLoadDate = value;
    this.setState({
      execution: execution
    });
  }

  updateAcquires(acquires) {
    this.setState({
      acquires: acquires
    });
  }

  updateExtractDestination(destination, options) {
    const extract = this.state.extract;
    extract.ScheduledExtractDestination = destination;
    extract.Options = options;
    this.setState({
      extract: extract
    });
  }

  updateExtractOptions(options) {
    const extract = this.state.extract;
    extract.Options = options;
    this.setState({
      extract: extract
    });
  }

  onSubmit(event) {

    event.preventDefault();

    // Validate fields
    if (!this.validateFields()) {
      window.scrollTo(0, 0);
      return;
    }

    const data = getExecutionData(this.state);
    const key = this.state.execution.ScheduledExecutionKey;

    // Send insert/update to server
    Ajax.fetch('/api/schedules/' + (key || ''), {
      method: key ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(response => {

        // TODO handle returned execution data

        const execution = this.state.execution;
        execution.ScheduledExecutionKey = execution.ScheduledExecutionKey || response.ScheduledExecutionKey;

        this.setState({
          execution: execution,
          updated: true
        });
      });
  }

  validateFields() {
    
    const invalidFields = [];

    for (let field of requiredExecutionFields) {

      const value = this.state.execution[field];

      if (!validateField(value)) {
        invalidFields.push(field);
      }
    }

    this.setState({
      invalidFields: invalidFields
    });

    return invalidFields.length === 0;
  }

  isRequired(fieldName) {
    return requiredExecutionFields.indexOf(fieldName) > -1;
  }

  isInvalid(fieldName) {
    return this.state.invalidFields.indexOf(fieldName) > -1;
  }

  executeNow() {

    // TODO
    // Dialog about unsaved values?

    // Redirect to adhoc form, pre-populated
    window.location.href = `/adhoc?schedule=${this.state.execution.ScheduledExecutionKey}`;
  }

  render() {

    // NOTE: Handles both insert and update

    const execution = this.state.execution;

    // Repeat object
    const repeat = {
      interval: {
        days: execution.ScheduledIntervalDD,
        hours: execution.ScheduledIntervalHH,
        minutes: execution.ScheduledIntervalMI
      },
      days: getWeekDays(execution)
    };

    // Acquire program dropdown options
    const programOptions = getAcquireProgramOptions(this.state.availablePrograms);

    const program = programOptions.find(option => option.value === execution.AcquireProgramKey);

    const extractOptions = this.state.extract.Options;

    return (
      <form className="schedule-form" onSubmit={this.onSubmit}>

        { this.state.updated && <p>Schedule updated</p> }

        <h5>{ execution.ScheduledExecutionKey ? 'Update Schedule' : 'New Schedule' }</h5>

        <TextField
          label="Name"
          name="ScheduledExecutionName"
          value={execution.ScheduledExecutionName}
          required={this.isRequired('ScheduledExecutionName')}
          validate={this.isInvalid('ScheduledExecutionName')}
          onChange={this.onExecutionChange}
        />

        <div>
          <Label>Program</Label>
          <Select
            value={program}
            onChange={this.onChangeProgram}
            options={programOptions}
            className="titan-react-select"
          />
        </div>

        <DateField
          label="Next scheduled"
          name="ScheduledExecutionNextScheduled"
          value={execution.ScheduledExecutionNextScheduled}
          required={this.isRequired('ScheduledExecutionNextScheduled')}
          validate={this.isInvalid('ScheduledExecutionNextScheduled')}
          onChange={this.updateNextScheduled}
          includeTime={true}
        />
        <DateField
          label="Schedule end"
          name="ScheduledExecutionScheduleEnd"
          value={execution.ScheduledExecutionScheduleEnd}
          required={this.isRequired('ScheduledExecutionScheduleEnd')}
          validate={this.isInvalid('ScheduledExecutionScheduleEnd')}
          onChange={this.updateScheduleEnd}
          includeTime={true}
        />

        <TextField
          label="Client"
          name="ScheduledExecutionClientName"
          value={execution.ScheduledExecutionClientName}
          required={this.isRequired('ScheduledExecutionClientName')}
          validate={this.isInvalid('ScheduledExecutionClientName')}
          onChange={this.onExecutionChange}
        />

        <TextField
          label="Data source"
          name="ScheduledExecutionDataSourceName"
          value={execution.ScheduledExecutionDataSourceName}
          required={this.isRequired('ScheduledExecutionDataSourceName')}
          validate={this.isInvalid('ScheduledExecutionDataSourceName')}
          disabled={!!program}
          onChange={this.onExecutionChange}
        />

        <TextField
          label="Data set"
          name="ScheduledExecutionDataSetName"
          value={execution.ScheduledExecutionDataSetName}
          required={this.isRequired('ScheduledExecutionDataSetName')}
          validate={this.isInvalid('ScheduledExecutionDataSetName')}
          onChange={this.onExecutionChange}
        />

        <DateField
          label="Next load date"
          name="ScheduledExecutionNextLoadDate"
          value={execution.ScheduledExecutionNextLoadDate}
          required={this.isRequired('ScheduledExecutionNextLoadDate')}
          validate={this.isInvalid('ScheduledExecutionNextLoadDate')}
          onChange={this.updateNextLoadDate}
        />

        <TextField
          label="User"
          name="ScheduledExecutionUser"
          value={execution.ScheduledExecutionUser}
          required={this.isRequired('ScheduledExecutionUser')}
          validate={this.isInvalid('ScheduledExecutionUser')}
          onChange={this.onExecutionChange}
        />

        <div className="form-checkbox-field">
          <label>
            <input type="checkbox" name="ScheduledExecutionEnabled" checked={this.ScheduledExecutionEnabled} onChange={this.onExecutionChange} />
            <span className="label-body">Enabled</span>
          </label>
        </div>

        <div className="form-section">
          <RepeatForm
            value={repeat}
            includeRepeat={this.state.includeRepeat}
            onAddRepeat={this.addRepeat}
            onRemoveRepeat={this.removeRepeat}
            onChange={this.updateRepeat}
          />
        </div>

        <div className="form-section">
          <h6>Acquires</h6>
          {
            program
              ? <AcquireList
                  options={program.options}
                  acquires={this.state.acquires}
                  onChange={this.updateAcquires}
                />
              : <p>No acquire program selected</p>
          }
        </div>
        <div className="form-section">
          <h6>Extract</h6>
          <ExtractForm
            destination={this.state.extract.ScheduledExtractDestination}
            onDestinationChange={this.updateExtractDestination}
            options={extractOptions}
            onOptionsChange={this.updateExtractOptions}
          />
        </div>

        <div>
          <input type="submit" value={ execution.ScheduledExecutionKey ? 'Update' : 'Create' } />
          {
            this.props.id &&
              <button onClick={this.executeNow} className="btn-now">
                Execute now
                <span className="fas fa-angle-right btn-now-icon" />
              </button>
          }
        </div>

      </form>
    );
  }

}

export default ScheduleForm;
