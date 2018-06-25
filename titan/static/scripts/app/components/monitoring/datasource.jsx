import React from 'react';
import MonitoringGridDataSet from './dataset.jsx';

class MonitoringGridDataSource extends React.Component {

  render() {

    const rows = Object.keys(this.props.data).map((key, index) => {

      const datum = this.props.data[key];

      return (
        <MonitoringGridDataSet key={index} name={key} data={datum} selectExecution={this.props.selectExecution} />
      );
    });

    const className = 'monitoring-datasource-title'
        + (this.props.highlight ? ' monitoring-title-highlight' : '');

    return (
      <div className="monitoring-datasource">
        <h5 className={className}>{this.props.name}</h5>
        {rows}
      </div>
    );
  }
}

export default MonitoringGridDataSource;
