import React from 'react';
import Label from '../label.jsx';
import './index.css';

class FormRow extends React.Component {
  render() {
    return (
      <div>
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
