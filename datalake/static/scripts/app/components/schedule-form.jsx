import React from 'react';
import ScheduleDays from './schedule/days.jsx';
import IntervalPicker from './interval-picker.jsx';
import DatePicker from 'react-datepicker';
import dateUtils from '../utils/date-utils';
import moment from 'moment';

// react-datepicker stylesheet
require('react-datepicker/dist/react-datepicker.css');

class ScheduleForm extends React.Component {

  constructor(props) {
    super(props);

    // TODO populate these from querying (componentDidMount)
    this.state = {
      id: this.props.id,

      name: '',
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
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false
      },
      acquire: '',
      extract: '',

      acquireOptions: [
        { id: 1, name: 'Acquire 1' },
        { id: 2, name: 'Acquire 2' },
        { id: 3, name: 'Acquire 3' },
        { id: 4, name: 'Acquire 4' },
        { id: 5, name: 'Acquire 5' }
      ],
      extractOptions: [
        { id: 1, name: 'Extract 1' },
        { id: 2, name: 'Extract 2' },
        { id: 3, name: 'Extract 3' },
        { id: 4, name: 'Extract 4' },
        { id: 5, name: 'Extract 5' }
      ],

      loading: false
    };

    this.onChange = this.onChange.bind(this);
    this.updateInterval = this.updateInterval.bind(this);
    this.updateNextScheduled = this.updateNextScheduled.bind(this);
    this.updateScheduleEnd = this.updateScheduleEnd.bind(this);
    this.updateNextLoadDate = this.updateNextLoadDate.bind(this);
    this.updateDay = this.updateDay.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {

    this.setState({
      loading: true
    });

    if (this.state.id) {

      fetch('/api/schedules/' + this.state.id)
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

  onSubmit(event) {

    // TODO send insert/update to server
    fetch('/api/schedules', {
      method: 'POST',
      data: JSON.stringify(this.state)
    })
      .then(() => {
        this.setState({
          updated: true
        });
      });

    event.preventDefault();
  }

  render() {

    if (this.state.updated) {
      return <p>Schedule updated</p>;
    }

    // NOTE: Handles both insert and update

    // TODO (re-use existing components?):
    // - acquire option(s) (name/value)
    // - extract option(s) (name/value)

    // TODO loading state
    // TODO separate into two components?

    // Acquire options
    const acquireOptions = this.state.acquireOptions.map(
      (option) => <option key={option.id} value={option.id}>{option.name}</option>
    );

    // Extract options
    const extractOptions = this.state.extractOptions.map(
      (option) => <option key={option.id} value={option.id}>{option.name}</option>
    );

    return (
      <form className="schedule-form" onSubmit={this.onSubmit}>

        <h5>{ this.state.id ? 'Update Schedule' : 'New Schedule' }</h5>

        <div>
          <label>Name</label>
          <input type="text" name="name" value={this.state.name} onChange={this.onChange} />
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
          <label>Data Source</label>
          <input type="text" name="dataSource" value={this.state.dataSource} onChange={this.onChange} />
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
        <div>
          <label>Interval</label>
          <IntervalPicker hours={this.state.interval.hours} minutes={this.state.interval.minutes}
            seconds={this.state.interval.seconds} onUpdate={this.updateInterval} />
        </div>
        <div>
          <ScheduleDays key="days" days={this.state.days} onChange={this.updateDay} />
        </div>
        <div>
          <label>Acquire program</label>
          <select name="acquire" value={this.state.acquire} onChange={this.onChange}>
            <option value=""></option>
            { acquireOptions }
          </select>
        </div>
        <div>
          <label>Extract program</label>
          <select name="acquire" value={this.state.extract} onChange={this.onChange}>
            <option value=""></option>
            { extractOptions }
          </select>
        </div>

        <div>
          <input type="submit" value={ this.state.id ? 'Update' : 'Create' } />
        </div>

      </form>
    );
  }

}

export default ScheduleForm;
