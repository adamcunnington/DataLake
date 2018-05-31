import React from 'react';
import MonitoringGridLabel from './label.jsx';
import MonitoringGridExecution from './execution.jsx';
import dateUtils from '../../utils/date-utils';

require('./row.css');

class MonitoringGridRow extends React.Component {

  render() {

    const cells = this.props.data.map((datum, index) => {

      const id = datum.id, date = new Date(datum.date);

      return (
        <td key={index} className={dateUtils.isYesterday(date) ? 'cell-highlight' : ''}>
          <MonitoringGridExecution data={datum} select={this.props.selectExecution} taskId={id} date={date} />
        </td>
      );
    });

    return (
      <tr>
        <td>
          <MonitoringGridLabel label={this.props.name} />
        </td>
        {cells}
      </tr>
    );
  }

}

export default MonitoringGridRow;
