import React from 'react';

class ExecutionPartial extends React.Component {

  statusClass() {
    const classes = {
      'success': 'execution-partial-success',
      'failure': 'execution-partial-failure',
      'running': 'execution-partial-running',
      'not-requested': 'execution-partial-not-requested'
    };
    return this.props.status
      ? classes[this.props.status.toLowerCase()]
      : '';
  }

  render() {
    return (
      <span className={'execution-partial ' + this.statusClass()}>
        { this.props.children }
      </span>
    );
  }
}

export default ExecutionPartial;
