import React from 'react';
import MonitoringGridDataSource from './datasource.jsx';

class MonitoringGridClient extends React.Component {

  render() {

    const dataSources = Object.keys(this.props.data).map((key, index) => {

      const datum = this.props.data[key];

      return (
        <MonitoringGridDataSource
          key={index}
          name={key}
          start={this.props.start}
          end={this.props.end}
          data={datum}
          selectExecution={this.props.selectExecution}
          highlight={this.props.highlight}
        />
      );
    });

    const className = 'monitoring-client-title'
      + (this.props.highlight ? ' monitoring-title-highlight' : '');

    return (
      <div className="monitoring-client">
        <h4 className={className}>{this.props.name}</h4>
        {dataSources}
      </div>
    );
  }
}

export default MonitoringGridClient;
