import React from 'react';
import ExecutionDetails from './execution-details.jsx';
import Ajax from '../utils/ajax';

class Execution extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      execution: null
    };
  }

  componentDidMount() {

    Ajax.fetch('/api/executions/' + this.props.executionKey)
      .then(res => res.json())
      .then((result) => {
        this.setState({
          loading: false,
          execution: result.execution
        });
      },
      (error) => {
        console.log('Unable to find information on excecution for task: ' + this.props.taskId);
      });
  }

  render() {

    if (this.state.loading) {
      return <p>Loading...</p>;
    }

    return (
      <div>
        <ExecutionDetails execution={this.state.execution} />
        <a href="/schedules/525">Go to schedule &gt;</a>
      </div>
    );
  }

}

export default Execution;
