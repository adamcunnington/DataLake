import React from 'react';
import MonitoringGridExecution from './execution.jsx';

class MonitoringGridDataSet extends React.Component {

  render() {

    const cells = Object.keys(this.props.data).map((key) => {

      const datum = this.props.data[key];
      const id = datum.id, date = new Date(key);

      return (
        <MonitoringGridExecution key={key} data={datum} select={this.props.selectExecution} taskId={id} date={date} />
      );
    });

    return (
      <div className="monitoring-dataset">
        {this.props.children}
        <span className="monitoring-dataset-label">{this.props.name}</span>
        <div className="monitoring-executions">{cells}</div>
      </div>
    );
  }

}

export default MonitoringGridDataSet;
