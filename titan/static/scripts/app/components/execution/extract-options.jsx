import React from 'react';
import ExecutionTaskOption from './task-option.jsx';

class ExecutionExtractOptions extends React.Component {

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

    const icon = this.state.expanded ? 'fa-angle-left' : 'fa-angle-right';

    const optionsList = this.props.options.map(
      (option, index) => <ExecutionTaskOption key={index} name={option.ExtractOptionName} value={option.ExtractOptionValue} />
    );

    return (
      <div className="extract-options">
        <div className="extract-options-toggle-wrap">
          <a onClick={this.toggle}>
            Options <span className={'fas ' + icon} />
          </a>
        </div>
        {
          this.state.expanded &&
            <div className="extract-options-list">
              {optionsList}
            </div>
        }
      </div>
    );
  }
}

export default ExecutionExtractOptions;
