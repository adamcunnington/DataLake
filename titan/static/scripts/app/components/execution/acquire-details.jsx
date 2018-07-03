import React from 'react';
import ExecutionAcquireOptions from './acquire-options.jsx';
import TaskStatus from './task-status.jsx';

class ExecutionAcquireDetails extends React.Component {

  render() {

    const acquire = this.props.acquire;

    return (
      <div className="acquire-details">

        <div className="acquire-info">
          <div>
            <label>Key</label>
            <span className="execution-value">{acquire.AcquireKey}</span>
          </div>
          <div>
            <label>Start Time</label>
            <span className="execution-value">{acquire.AcquireStartTime}</span>
          </div>
          <div>
            <label>End Time</label>
            <span className="execution-value">{acquire.AcquireEndTime}</span>
          </div>
          <div>
            <label>Status</label>
            <span className="execution-value">
              <TaskStatus status={acquire.AcquireStatus} />
            </span>
          </div>
          {
            acquire.AcquireStatus && acquire.AcquireStatus.toUpperCase() === 'FAILURE' &&
              <div>
                <label>Error Message</label>
                <span className="execution-value">{acquire.AcquireErrorMessage}</span>
              </div>
          }
        </div>

        <ExecutionAcquireOptions options={acquire.Options} />

      </div>
    )
  }
}

export default ExecutionAcquireDetails;
