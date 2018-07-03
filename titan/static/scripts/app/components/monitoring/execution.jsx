import React from 'react';
import ExecutionPartial from './execution-partial.jsx';
import Tooltip from '../tooltip/index.jsx';
import DateUtils from '../../utils/date-utils';

import './execution.css';

class MonitoringGridExecution extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    };
    this.mouseOver = this.mouseOver.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
    this.selectorChange = this.selectorChange.bind(this);
  }

  mouseOver() {
    this.setState({
      showTooltip: true
    });
  }

  mouseOut() {
    this.setState({
      showTooltip: false
    });
  }

  selectorChange(e) {
    const add = e && e.target && e.target.checked;
    this.props.select(this.props.executionKey, add);
  }

  getStatusClass(status) {
    const classes = {
      'success': 'execution-success',
      'failure': 'execution-failure',
      'running': 'execution-running',
      'not-requested': 'execution-not-requested'
    };
    return status
      ? (' ' + classes[status.toLowerCase()])
      : '';
  }

  isFailure() {
    return this.props.data.ExecutionStatus.toLowerCase() === 'failure';
  }

  render() {

    const SUCCESS = 'success', FAILURE = 'failure';
    const execution = this.props.data;
    const className = 'execution'
      + (DateUtils.isYesterday(this.props.date) ? ' execution-highlight' : '')
      + this.getStatusClass(execution.ExecutionStatus);

    const errorMessage = 'Unable to access blah blah blah'; // TODO

    return (
      <span className={className}>
        <a href={`/monitoring/executions/${execution.ExecutionKey}`} onMouseOver={this.mouseOver} onMouseOut={this.mouseOut}>
          <span className="execution-parts">
            <ExecutionPartial status={execution.AcquireStatus}>A</ExecutionPartial>
            <ExecutionPartial status={execution.ExtractStatus}>E</ExecutionPartial>
          </span>
        </a>
        {
          this.isFailure() &&
            <input type="checkbox" checked={execution.selected} className="execution-selector" onChange={this.selectorChange} />
        }
        {
          this.state.showTooltip &&
            <Tooltip offsetY={50}>
              <p>
                <label>Execution time:</label> {execution.ExecutionStartTime || '-'}
              </p>
              <p>
                <label>Acquire time:</label> {execution.AcquireStartTime || '-'}
              </p>
              <p>
                <label>Extract time:</label> {execution.ExtractStartTime || '-'}
              </p>
              {
                errorMessage &&
                  <p className="tooltip-error">
                    <span className="fas fa-exclamation-triangle tooltip-error-icon" />
                    Unable to access blah blah blah
                  </p>
              }
            </Tooltip>
        }
      </span>
    );
  }

}

export default MonitoringGridExecution;
