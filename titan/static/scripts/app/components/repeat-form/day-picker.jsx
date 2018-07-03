import React from 'react';

import './day-picker.css';

class DayPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      days: this.props.days
    };
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.days !== this.state.days) {
      this.setState({
        days: nextProps.days
      });
    }
  }

  onChange(event) {

    const days = this.state.days;
    days[event.target.name] = event.target.checked;

    this.props.onChange(days);
  }

  render() {

    const days = {
      Monday: 'Mon',
      Tuesday: 'Tues',
      Wednesday: 'Wed',
      Thursday: 'Thurs',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun'
    };

    const dayInputs = Object.keys(days).map(day => {
      return (
        <label className="schedule-days-label" key={day}>
          <input type="checkbox" className="schedule-days-input" name={day} checked={this.state.days[day]} onChange={this.onChange} />
          <span className="schedule-days-text">{days[day]}</span>
        </label>
      );
    });

    return (
      <div className="schedule-days">
        {dayInputs}
      </div>
    );
  }
}

export default DayPicker;
