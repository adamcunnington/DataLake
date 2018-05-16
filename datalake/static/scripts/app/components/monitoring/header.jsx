import React from 'react';
import dateUtils from '../../utils/date-utils';

class MonitoringGridHeader extends React.Component {

  render() {

    const start = this.props.dates.start, end = this.props.dates.end;

    let cells = [], i = 1, temp = new Date(start);

    // Iterate from start to end dates
    while (temp <= end) {

      // Add header cell with (formatted) date
      cells.push(<th key={i++}>{dateUtils.dateToString(temp)}</th>);
      
      // Next date
      temp.setDate(temp.getDate() + 1)
    }

    return (
      <thead>
        <tr>
          <th>Task</th>
          {cells}
        </tr>
      </thead>
    );
  }

}

export default MonitoringGridHeader;
