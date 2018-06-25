import React from 'react';
import ExecutionTaskOption from './task-option.jsx';

class ExecutionAcquireOptions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    this.setState({
      expanded: !this.state.expanded
    });
    event.preventDefault();
  }

  render() {

    // Don't render if no options are provided
    if (!this.props.options.length) {
      return null;
    }

    const icon = this.state.expanded ? 'fa-angle-left' : 'fa-angle-right';

    const options = this.props.options.map(
      (option, index) => <ExecutionTaskOption key={index} name={option.AcquireOptionName} value={option.AcquireOptionValue} />
    );

    return (
      <div className="acquire-options">
        <div className="acquire-options-toggle-wrap">
          <a onClick={this.toggle}>
            Options <span className={'fas ' + icon} />
          </a>
        </div>
        {
          this.state.expanded && 
          <div className="acquire-option-list">
            {options}
          </div>
        }
      </div>
    );
  }

}

export default ExecutionAcquireOptions;