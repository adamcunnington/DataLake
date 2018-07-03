import React from 'react';
import FormRow from './form-row.jsx';

class TextField extends React.Component {

  render() {

    const error = this.props.required
      && this.props.validate
      && !this.props.value;

    const inputClassName =
      (this.props.inputClassName || '')
      + (error ? ' input-error' : '');
    const errorMessage = error ? 'This field is required' : '';

    return (
      <FormRow
        compact={this.props.compact}
        className={this.props.className}
        required={this.props.required}
        label={this.props.label}
        error={errorMessage}
        tooltip={this.props.tooltip}>
        <input
          className={inputClassName}
          type="text"
          name={this.props.name}
          value={this.props.value}
          disabled={this.props.disabled}
          onChange={this.props.onChange}
          autoComplete="off"
        />
      </FormRow>
    );
  }
}

export default TextField;
