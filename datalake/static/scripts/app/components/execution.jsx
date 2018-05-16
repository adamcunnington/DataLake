import React from 'react';
import ExecutionDetails from './execution-details.jsx';

class Execution extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      execution: null
    };
  }

  componentDidMount() {

    fetch('/api/executions/' + this.props.executionKey)
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
    return this.state.loading
      ? <p>Loading...</p>
      : <ExecutionDetails execution={this.state.execution} />;
  }

}

export default Execution;
