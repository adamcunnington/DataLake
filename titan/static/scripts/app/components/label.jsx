import React from 'react';
import Info from './info/index.jsx';
import './label.css';

// Creates a label, handles the 'required' asterisk and any tooltips
class Label extends React.Component {
  render() {
    return (
      <label className="label">
        { this.props.children }
        {
          // "required" asterisk (NOTE: this component doesn't enforce anything)
          this.props.required &&
            <span className="fas fa-asterisk label-required" />
        }
        {
          // Tooltip
          this.props.tooltip &&
            <Info tooltip={this.props.tooltip} className="label-tooltip-icon" />
        }
      </label>
    );
  }
}

export default Label;
