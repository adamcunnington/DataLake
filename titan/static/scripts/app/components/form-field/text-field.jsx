import React from 'react';
import FormRow from './form-row.jsx';

class TextField extends React.Component {

  render() {

    const error = this.props.required
      && this.props.validate
      && this.props.value.length === 0;

    const className = error ? 'input-error' : '';
    const errorMessage = error ? 'This field is required' : '';

    return (
      <FormRow required={this.props.required} label={this.props.label} error={errorMessage}>
        <input
          className={className}
          type="text"
          name={this.props.name}
          value={this.props.value}
          disabled={this.props.disabled}
          onChange={this.props.onChange}
        />
      </FormRow>
    );
  }
}

export default TextField;
