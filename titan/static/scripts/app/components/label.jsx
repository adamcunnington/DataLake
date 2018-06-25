import React from 'react';
import Info from './info.jsx';
import './label.css';

// Creates a label, handles the 'required' asterisk
class Label extends React.Component {
  render() {
    return (
      <label className="label">
        { this.props.children }
        {
          this.props.required &&
            <span className="fas fa-asterisk label-required" />
        }
        {
          this.props.tooltip &&
            <Info tooltip={this.props.tooltip} className="label-tooltip-icon" />
        }
      </label>
    );
  }
}

export default Label;
