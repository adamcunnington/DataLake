import React from 'react';
import MonitoringGridHeader from './header.jsx';
import MonitoringGridContent from './content.jsx';

class MonitoringGrid extends React.Component {

  render() {
    return (
      <table className="monitoring-table">
        <MonitoringGridHeader dates={this.props.dates} />
        <MonitoringGridContent data={this.props.data} selectExecution={this.props.select} />
      </table>
    );
  }

}

export default MonitoringGrid;