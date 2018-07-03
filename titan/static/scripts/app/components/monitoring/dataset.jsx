import React from 'react';
import MonitoringGridExecution from './execution.jsx';
import DateUtils from '../../utils/date-utils';
import moment from 'moment';

class MonitoringGridDataSet extends React.Component {

  render() {

    // Iterate through date range, draw cells (empty or otherwise)
    let temp = moment(this.props.start), key = 1;    
    const executions = [];

    while (!temp.isAfter(this.props.end)) {

      const execution = this.props.data[temp.format('YYYY-MM-DD')];

      if (execution) {
        executions.push(
          <MonitoringGridExecution
            key={key}
            data={execution}
            select={this.props.selectExecution}
            executionKey={execution.ExecutionKey}
            date={temp.toDate()}
          />
        );
      } else {
        const className = 'execution execution-empty'
          + (DateUtils.isYesterday(temp.toDate()) ? ' execution-highlight' : '');
        executions.push(
          <span
            key={key}
            className={className}
          />
        );
      }

      temp.add(1, 'days');
      key++;
    }

    return (
      <div className="monitoring-dataset">
        <span className="monitoring-dataset-label">{this.props.name}</span>
        <div className="monitoring-executions">{executions}</div>
      </div>
    );
  }

}

export default MonitoringGridDataSet;
