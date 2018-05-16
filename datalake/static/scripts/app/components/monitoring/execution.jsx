import React from 'react';
import MonitoringGridExecutionAcquire from './execution-acquire.jsx';
import MonitoringGridExecutionExtract from './execution-extract.jsx';

class MonitoringGridExecution extends React.Component {

  constructor(props) {
    super(props);
    this.selectorChange = this.selectorChange.bind(this);
  }

  selectorChange(e) {
    const add = e && e.target && e.target.checked;
    this.props.select(this.props.taskId, this.props.date, add);
  }

  render() {

    const SUCCESS = 'success', FAILURE = 'failure';
    const execution = this.props.data,
      acquireStatus = execution.acquire,
      extractStatus = execution.extract;
    const showSelector = acquireStatus === FAILURE || extractStatus === FAILURE;
    const showLink = acquireStatus === SUCCESS
      || acquireStatus === FAILURE
      || extractStatus === SUCCESS
      || extractStatus === FAILURE;

    const status = showLink
      ? <a href={'/monitoring/executions/' + execution.id}>
          <MonitoringGridExecutionAcquire status={execution.acquire} />
          <MonitoringGridExecutionExtract status={execution.extract} />
        </a>
      : <span>
          <MonitoringGridExecutionAcquire status={execution.acquire} />
          <MonitoringGridExecutionExtract status={execution.extract} />
        </span>;

    return (
      <span className="execution-cell" title={'Date: ' + execution.date}>
        {status}
        {
          showSelector
            ? <input type="checkbox" checked={execution.selected} className="execution-selector" onChange={this.selectorChange} />
            : null
        }
      </span>
    );
  }

}

export default MonitoringGridExecution;
