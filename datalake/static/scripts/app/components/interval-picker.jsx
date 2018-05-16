import React from 'react';

class IntervalPicker extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeHours = this.onChangeHours.bind(this);
    this.onChangeMinutes = this.onChangeMinutes.bind(this);
    this.onChangeSeconds = this.onChangeSeconds.bind(this);
  }

  onChangeHours(event) {

    // Ensure value is between 0 and 23
    let hours = event.target.value;
    if (hours < 0) {
      hours = 0;
    } else if (hours > 23) {
      hours = 23;
    }

    this.props.onUpdate(hours, this.props.minutes, this.props.seconds);
  }

  onChangeMinutes(event) {

    // Ensure value is between 0 and 59
    let minutes = event.target.value;
    if (minutes < 0) {
      minutes = 0;
    } else if (minutes > 59) {
      minutes = 59;
    }

    this.props.onUpdate(this.props.hours, minutes, this.props.seconds);
  }

  onChangeSeconds(event) {

    // Ensure value is between 0 and 59
    let seconds = event.target.value;
    if (seconds < 0) {
      seconds = 0;
    } else if (seconds > 59) {
      seconds = 59;
    }

    this.props.onUpdate(this.props.hours, this.props.minutes, seconds);
  }

  render() {
    return (
      <div className="interval-picker">
        <label className="interval-picker-label">Hours</label>
        <input type="number" className="interval-picker-input" value={this.props.hours} onChange={this.onChangeHours} />
        <label className="interval-picker-label">Minutes</label>
        <input type="number" className="interval-picker-input" value={this.props.minutes} onChange={this.onChangeMinutes} />
        <label className="interval-picker-label">Seconds</label>
        <input type="number" className="interval-picker-input" value={this.props.seconds} onChange={this.onChangeSeconds} />
      </div>
    );
  }
}

export default IntervalPicker;
