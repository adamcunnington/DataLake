import React from 'react';
import PropTypes from 'prop-types';

import './interval-picker.css';

class IntervalPicker extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeDays = this.onChangeDays.bind(this);
    this.onChangeHours = this.onChangeHours.bind(this);
    this.onChangeMinutes = this.onChangeMinutes.bind(this);
  }

  onChangeDays(event) {

    // Ensure value is non-negative
    let days = this.getInt(event.target.value);
    if (days < 0) {
      days = 0;
    }

    this.props.onChange(days, this.props.hours, this.props.minutes);
  }

  onChangeHours(event) {

    // Ensure value is between 0 and 23
    let hours = this.getInt(event.target.value);
    if (hours < 0) {
      hours = 0;
    } else if (hours > 23) {
      hours = 23;
    }

    this.props.onChange(this.props.days, hours, this.props.minutes);
  }

  onChangeMinutes(event) {

    // Ensure value is between 0 and 59
    let minutes = this.getInt(event.target.value);
    if (minutes < 0) {
      minutes = 0;
    } else if (minutes > 59) {
      minutes = 59;
    }

    this.props.onChange(this.props.days, this.props.hours, minutes);
  }

  getInt(value) {
    let int = parseInt(value);
    return !!int ? int : 0;
  }

  render() {
    return (
      <div className="interval-picker">
        <label className="interval-picker-label">Days</label>
        <input type="number" className="interval-picker-input" value={this.props.days} onChange={this.onChangeDays} />
        <label className="interval-picker-label">Hours</label>
        <input type="number" className="interval-picker-input" value={this.props.hours} onChange={this.onChangeHours} />
        <label className="interval-picker-label">Minutes</label>
        <input type="number" className="interval-picker-input" value={this.props.minutes} onChange={this.onChangeMinutes} />
      </div>
    );
  }
}

IntervalPicker.propTypes = {
  days: PropTypes.number.isRequired,
  hours: PropTypes.number.isRequired,
  minutes: PropTypes.number.isRequired
};

export default IntervalPicker;
