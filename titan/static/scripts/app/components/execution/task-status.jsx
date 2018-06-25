import React from 'react';

class ExecutionTaskStatus extends React.Component {

  render() {

    const classNames = {
      success: 'text-success',
      failure: 'text-failure',
      running: 'text-neutral'
    };

    const icons = {
      success: 'fas fa-check',  // tick
      failure: 'fas fa-times',  // cross
      running: 'far fa-clock'   // clock
    };

    const className = classNames[this.props.status] || '';
    const icon = icons[this.props.status];

    return <span className={'task-status ' + className}>
      { icon && <span className={'task-status-icon ' + icon} /> }
      { this.props.status.toUpperCase() }
    </span>;

  }
}

export default ExecutionTaskStatus;