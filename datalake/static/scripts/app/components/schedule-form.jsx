import React from 'react';
import ScheduleDays from './days/days.jsx';
import IntervalPicker from './interval-picker.jsx';
import AcquireList from './acquire-list/acquire-list.jsx';
import ExtractForm from './extract/extract-form.jsx';
import DatePicker from 'react-datepicker';
import Ajax from '../utils/ajax';
import dateUtils from '../utils/date-utils';
import moment from 'moment';

// react-datepicker stylesheet
require('react-datepicker/dist/react-datepicker.css');

class ScheduleForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,

      name: '',
      program: '',
      nextScheduled: null,
      scheduleEnd: null,
      client: '',
      dataSource: '',
      dataSet: '',
      nextLoadDate: null,
      enabled: true,
      interval: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      days: {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: true,
        Sunday: true
      },
      extract: '',

      acquires: [],
      acquireProperties: ['property1', 'property2', 'property3'],

      extractDestination: '',
      extractFields: {
        'Extract field 1': '',
        'Extract field 2': '',
        'Extract field 3': ''
      },

      availablePrograms: [
        { id: 1, name: 'Acquire 1' },
        { id: 2, name: 'Acquire 2' },
        { id: 3, name: 'Acquire 3' },
        { id: 4, name: 'Acquire 4' },
        { id: 5, name: 'Acquire 5' }
      ],

      loading: false
    };

    this.onChange = this.onChange.bind(this);
    this.onChangeProgram = this.onChangeProgram.bind(this);
    this.updateInterval = this.updateInterval.bind(this);
    this.updateNextScheduled = this.updateNextScheduled.bind(this);
    this.updateScheduleEnd = this.updateScheduleEnd.bind(this);
    this.updateNextLoadDate = this.updateNextLoadDate.bind(this);
    this.updateDay = this.updateDay.bind(this);
    this.addAcquire = this.addAcquire.bind(this);
    this.removeAcquire = this.removeAcquire.bind(this);
    this.updateAcquireItem = this.updateAcquireItem.bind(this);
    this.selectExtractDestination = this.selectExtractDestination.bind(this);
    this.updateExtractField = this.updateExtractField.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {

    this.setState({
      loading: true
    });

    if (this.state.id) {

      Ajax.fetch('/api/schedules/' + this.state.id)
        .then(res => res.json())
        .then((result) => {

          // TODO Make this a method in dateUtils?
          result.nextScheduled = moment(new Date(result.nextScheduled));
          result.scheduleEnd = moment(new Date(result.scheduleEnd));
          result.nextLoadDate = moment(new Date(result.nextLoadDate));

          this.setState(result);
          this.setState({
            loading: false
          });
        });
    }
  }

  onChange(event) {
    const target = event.target,
      name = target.name,
      value = target.value;

    this.setState({
      [name]: value
    });
  }

  // Special case for program
  onChangeProgram() {
    // TODO get data source from server
    this.setState({
      dataSource: 'Program data source',
      acquires: []
    });
    this.onChange(...arguments);
  }

  updateInterval(hours, minutes, seconds) {
    this.setState({
      interval: {
        hours: hours,
        minutes: minutes,
        seconds: seconds
      }
    });
  }

  updateNextScheduled(value) {
    this.setState({
      nextScheduled: value
    });
  }

  updateScheduleEnd(value) {
    this.setState({
      scheduleEnd: value
    });
  }

  updateNextLoadDate(value) {
    this.setState({
      nextLoadDate: value
    });
  }

  updateDay(day, enabled) {
    const days = this.state.days;
    days[day] = enabled;
    this.setState({
      days: days
    });
  }

  addAcquire() {
    const acquires = this.state.acquires;
    acquires.push({
      fields: this.state.acquireProperties.reduce((obj, option) => { obj[option] = ''; return obj; }, {})
    });
    this.setState({
      acquires: acquires
    });
  }

  removeAcquire(index) {
    let acquires = this.state.acquires;
    acquires.splice(index, 1);
    this.setState({
      acquires: acquires
    });
  }

  updateAcquireItem(index, name, value) {
    const acquires = this.state.acquires;
    acquires[index].fields[name] = value;
    this.setState({
      acquires: acquires
    });
  }

  selectExtractDestination(destination) {
    this.setState({
      extractDestination: destination
    });
  }

  updateExtractField(name, value) {
    const extractFields = this.state.extractFields;
    extractFields[name] = value;
    this.setState({
      extractFields: extractFields
    });
  }

  onSubmit(event) {

    // Send insert/update to server
    Ajax.fetch('/api/schedules', {
      method: 'POST',
      data: JSON.stringify(this.state)
    })
      .then(res => res.json())
      .then((response) => {
        this.setState({
          id: this.state.id || response.id,
          updated: true
        });
      });

    event.preventDefault();
  }

  render() {

    // NOTE: Handles both insert and update

    // Acquire options
    const programOptions = this.state.availablePrograms.map(
      (option) => <option key={option.id} value={option.id}>{option.name}</option>
    );

    return (
      <form className="schedule-form" onSubmit={this.onSubmit}>

        { this.state.updated && <p>Schedule updated</p> }

        <h5>{ this.state.id ? 'Update Schedule' : 'New Schedule' }</h5>

        <div>
          <label>Name</label>
          <input type="text" name="name" value={this.state.name} onChange={this.onChange} />
        </div>
        <div>
          <label>Program</label>
          <select name="program" value={this.state.program} onChange={this.onChangeProgram}>
            <option value=""></option>
            { programOptions }
          </select>
        </div>
        <div>
          <label>Next scheduled</label>
          <DatePicker selected={this.state.nextScheduled} dateFormat="DD/MM/YYYY" onChange={this.updateNextScheduled} />
        </div>
        <div>
          <label>Schedule end</label>
          <DatePicker selected={this.state.scheduleEnd} dateFormat="DD/MM/YYYY" onChange={this.updateScheduleEnd} />
        </div>
        <div>
          <label>Client</label>
          <input type="text" name="client" value={this.state.client} onChange={this.onChange} />
        </div>
        <div>
          <label>Data source</label>
          <input type="text" name="dataSource" value={this.state.dataSource} onChange={this.onChange} disabled={!!this.state.program} />
        </div>
        <div>
          <label>Data set</label>
          <input type="text" name="dataSet" value={this.state.dataSet} onChange={this.onChange} />
        </div>
        <div>
          <label>Next load date</label>
          <DatePicker selected={this.state.nextLoadDate} dateFormat="DD/MM/YYYY" onChange={this.updateNextLoadDate} />
        </div>
        <div>
          <label>
            <input type="checkbox" name="enabled" checked={this.enabled} onChange={this.onChange} />
            <span className="label-body">Enabled</span>
          </label>
        </div>
        <div className="form-section">
          <h6>Interval</h6>
          <IntervalPicker hours={this.state.interval.hours} minutes={this.state.interval.minutes}
            seconds={this.state.interval.seconds} onUpdate={this.updateInterval} />
        </div>
        <div className="form-section">
          <h6>Days</h6>
          <ScheduleDays key="days" days={this.state.days} onChange={this.updateDay} />
        </div>
        <div className="form-section">
          <h6>Acquires</h6>
          {
            this.state.program
              ? <AcquireList acquires={this.state.acquires} onAdd={this.addAcquire}
                  onRemove={this.removeAcquire} onItemChange={this.updateAcquireItem} />
              : <p>Select an acquire program</p>
          }
        </div>
        <div className="form-section">
          <h6>Extract</h6>
          <ExtractForm destination={this.state.extractDestination} selectDestination={this.selectExtractDestination}
            fields={this.state.extractFields} updateField={this.updateExtractField} />
        </div>

        <div>
          <input type="submit" value={ this.state.id ? 'Update' : 'Create' } />
        </div>

      </form>
    );
  }

}

export default ScheduleForm;
