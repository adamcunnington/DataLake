import React from 'react';
import MonitoringGridLabel from './label.jsx';
import MonitoringGridExecution from './execution.jsx';

class MonitoringGridRow extends React.Component {

  render() {

    const name = this.props.name;
    const id = this.props.name; // TODO
    const date = '2018-05-08';  // TODO
    const select = this.props.selectExecution;

    const cells = this.props.data.map((datum, index) => {
      return (
        <td key={'grid-execution-' + name + '-' + index}>
          <MonitoringGridExecution data={datum} select={select} taskId={id} date={date} />
        </td>
      );
    });

    return (
      <tr>
        <td>
          <MonitoringGridLabel label={name} />
        </td>
        {cells}
      </tr>
    );
  }

}

export default MonitoringGridRow;
