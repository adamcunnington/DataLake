import React from 'react';
import dateUtils from '../../utils/date-utils';

class ScheduleTable extends React.Component {

  render() {

    const head = (
      <tr>
        <th>Schedule</th>
        <th>Next scheduled date</th>
        <th>Client</th>
        <th>Dataset</th>
        <th>Load date</th>
        <th>Enabled?</th>
      </tr>
    );

    const body = this.props.schedules.map((schedule, index) => {

      const href = '/schedules/' + schedule.id;
      const nextDate = dateUtils.dateToString(new Date(schedule.nextScheduled))
      const loadDate = dateUtils.dateToString(new Date(schedule.nextLoadDate));

      return (
        <tr key={index}>
          <td>
            <a href={href}>{schedule.name}</a>
          </td>
          <td>{nextDate}</td>
          <td>{schedule.client}</td>
          <td>{schedule.dataSet}</td>
          <td>{loadDate}</td>
          <td>
            <input type="checkbox" disabled={true} checked={schedule.enabled} />
          </td>
        </tr>
      );
    });

    return (
      <table className="schedule-table">
        <thead>{head}</thead>
        <tbody>{body}</tbody>
      </table>
    );

  }
  
}

export default ScheduleTable;
