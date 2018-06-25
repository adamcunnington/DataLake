import React from 'react';
import FormRow from './form-row.jsx';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../react-datepicker-overrides.css';

class DateField extends React.Component {

  render() {

    let value = this.props.value;

    // Handle strings and moments
    if (typeof value === 'string') {
      value = moment(new Date(value));
    }

    const error = this.props.required
      && this.props.validate
      && value === null;

    const className = error ? 'input-error' : '';
    const errorMessage = error ? 'This field is required' : '';

    const dateFormat = 'DD/MM/YYYY'
      + (this.props.includeTime ? ' HH:mm' : '');

    return (
      <FormRow required={this.props.required} label={this.props.label} error={errorMessage}
        tooltip="All dates and times are in UTC">
        <DatePicker
          dateFormat={dateFormat}
          className={className}
          type="text"
          name={this.props.name}
          selected={value}
          disabled={this.props.disabled}
          onChange={this.props.onChange}
          showTimeSelect={this.props.includeTime}
        />
      </FormRow>
    );
  }
}

export default DateField;
