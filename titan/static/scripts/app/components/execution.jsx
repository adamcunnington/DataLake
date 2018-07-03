import React from 'react';
import ExecutionDetails from './execution/details.jsx';
import ExecutionAcquireDetails from './execution/acquire-details.jsx';
import ExecutionExtractDetails from './execution/extract-details.jsx';
import Ajax from '../utils/ajax';

import './execution.css';

class Execution extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      execution: null,
      acquires: null,
      extract: null
    };
  }

  componentDidMount() {

    Ajax.fetch('/api/executions/' + this.props.executionKey)
      .then(res => res.json())
      .then(result => {
        const data = result.data;
        this.setState({
          loading: false,
          execution: data.execution,
          acquires: data.acquires,
          extract: data.extract
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

    const acquires = this.state.acquires.map(
      acquire => <ExecutionAcquireDetails key={acquire.AcquireKey} acquire={acquire} />
    );
    return (
      <div className="execution">
        <ExecutionDetails execution={this.state.execution} />
        <section className="form-section">
          <h6>Acquires</h6>
          { acquires }
        </section>
        {
          this.state.extract.ExtractKey &&
            <section className="form-section">
              <h6>Extract</h6>
              <ExecutionExtractDetails extract={this.state.extract} />
            </section>
        }
        {
          this.state.execution.ScheduledExecutionKey &&
            <section className="form-section">
              <a href={`/schedules/${this.state.execution.ScheduledExecutionKey}`}>
                Go to schedule <span className="fas fa-angle-right" />
              </a>
            </section>
        }
      </div>
    );
  }

}

export default Execution;
