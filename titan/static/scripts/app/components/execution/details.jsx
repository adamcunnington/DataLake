import React from 'react';
import TaskStatus from './task-status.jsx';

class ExecutionDetails extends React.Component {

  render() {

    const execution = this.props.execution;

    return (
      <div className="execution-details">

        <div>
          <label>Key</label>
          <span className="execution-value">{execution.ExecutionKey}</span>
        </div>
        <div>
          <label>Container Group</label>
          <span className="execution-value">{execution.ExecutionContainerGroupName}</span>
        </div>
        <div>
          <label>Client</label>
          <span className="execution-value">{execution.ExecutionClientName}</span>
        </div>
        <div>
          <label>Data Source</label>
          <span className="execution-value">{execution.ExecutionDataSourceName}</span>
        </div>
        <div>
          <label>Data Set</label>
          <span className="execution-value">{execution.ExecutionDataSetName}</span>
        </div>
        <div>
          <label>Scheduled Time</label>
          <span className="execution-value">{execution.ExecutionScheduledTime}</span>
        </div>
        <div>
          <label>Start Time</label>
          <span className="execution-value">{execution.ExecutionStartTime}</span>
        </div>
        <div>
          <label>End Time</label>
          <span className="execution-value">{execution.ExecutionEndTime}</span>
        </div>
        <div>
          <label>Status</label>
          <span className="execution-value">
            <TaskStatus status={execution.ExecutionStatus} />
          </span>
        </div>
        {
          execution.ExecutionStatus && execution.ExecutionStatus.toUpperCase() === 'FAILURE' &&
            <div>
              <label>Error Message</label>
              <span className="execution-value">{execution.ExecutionErrorMessage}</span>
            </div>
        }
        <div>
          <label>Load Date</label>
          <span className="execution-value">{execution.ExecutionLoadDate}</span>
        </div>
        <div>
          <label>Version</label>
          <span className="execution-value">{execution.ExecutionVersion}</span>
        </div>
        <div>
          <label>User</label>
          <span className="execution-value">{execution.ExecutionUser}</span>
        </div>
        <div>
          <label>Acquire Program</label>
          <span className="execution-value">{execution.AcquireProgramFriendlyName}</span>
        </div>

      </div>
    );
  }

}

export default ExecutionDetails;
