import React from 'react';
import TaskStatus from './task-status.jsx';
import ExecutionExtractOptions from './extract-options.jsx';

class ExecutionExtractDetails extends React.Component {

  render() {

    const extract = this.props.extract;

    return (
      <div className="extract-details">

        <div className="extract-info">
          <div>
            <label>Key</label>
            <span className="execution-value">{extract.ExtractKey}</span>
          </div>
          <div>
            <label>Destination</label>
            <span className="execution-value">{extract.ExtractDestination}</span>
          </div>
          <div>
            <label>Start Time</label>
            <span className="execution-value">{extract.ExtractStartTime}</span>
          </div>
          <div>
            <label>End Time</label>
            <span className="execution-value">{extract.ExtractEndTime}</span>
          </div>
          <div>
            <label>Status</label>
            <span className="execution-value">
              <TaskStatus status={extract.ExtractStatus} />
            </span>
          </div>
          {
            extract.ExtractStatus && extract.ExtractStatus.toUpperCase() === 'FAILURE' &&
              <div>
                <label>Error Message</label>
                <span className="execution-value">{extract.ExtractErrorMessage}</span>
              </div>
          }
        </div>

        <ExecutionExtractOptions options={extract.Options} />

      </div>
    );
  }
}

export default ExecutionExtractDetails;
