import React from 'react';
import MonitoringGridRow from './row.jsx';

class MonitoringGridContent extends React.Component {

  render() {

    // Table contents
    const contents = this.props.data.map((datum, index) => {
      return <MonitoringGridRow key={'grid-row-' + index} name={datum.name}
        data={datum.executions} selectExecution={this.props.selectExecution} />;
    });

    return (
      <tbody>
        {contents}
      </tbody>
    );
  }

}

export default MonitoringGridContent;
