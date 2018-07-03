import React from 'react';
import FormRow from './form-row.jsx';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../react-datepicker-overrides.css';

class DateField extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    this.props.onChange(this.props.name, ...arguments);
  }

  render() {

    let value = this.props.value;

    // Handle strings and moments
    if (typeof value === 'string') {
      // IMPORTANT: Dates should always be assumed to be in UTC
      value = moment.utc(value);
    }

    const error = this.props.required
      && this.props.validate
      && value === null;

    const className = error ? 'input-error' : '';
    const errorMessage = error ? 'This field is required' : '';

    const dateFormat = 'DD/MM/YYYY'
      + (this.props.includeTime ? ' HH:mm' : '');

    return (
      <FormRow
        compact={this.props.compact}
        required={this.props.required}
        label={this.props.label}
        error={errorMessage}
        tooltip="All dates and times are in GMT">
        <DatePicker
          dateFormat={dateFormat}
          className={className}
          type="text"
          name={this.props.name}
          selected={value}
          disabled={this.props.disabled}
          onChange={this.handleChange}
          showTimeSelect={this.props.includeTime}
        />
      </FormRow>
    );
  }
}

export default DateField;
