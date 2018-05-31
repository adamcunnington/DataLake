import React from 'react';

class ExecutionDetails extends React.Component {

  render() {
    return (
      <div className="execution-details">
        <p>Task Name: {this.props.execution.name}</p>
        <p>Task ID: {this.props.execution.id}</p>
      </div>
    );
  }

}

export default ExecutionDetails;
