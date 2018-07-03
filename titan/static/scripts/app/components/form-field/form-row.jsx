import React from 'react';
import Label from '../label.jsx';
import './index.css';

class FormRow extends React.Component {
  render() {

    const className = 'form-row'
      + (this.props.compact ? ' form-row-compact' : '')
      + ' ' + (this.props.className || '');

    return (
      <div className={className}>
        <Label required={this.props.required} tooltip={this.props.tooltip}>{this.props.label}</Label>
        {
          this.props.error &&
            <p className="input-error-message">{this.props.error}</p>
        }
        { this.props.children }
      </div>
    );
  }
}

export default FormRow;
