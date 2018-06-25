import React from 'react';
import DateUtils from '../../utils/date-utils';

class ScheduleTableRow extends React.Component {

  render() {

    const schedule = this.props.schedule;
    const nextDate = DateUtils.dateToString(schedule.ScheduledExecutionNextScheduled),
      loadDate = DateUtils.dateToString(schedule.ScheduledExecutionNextLoadDate);

    return (
      <tr>
        <td>
          <a href={`/schedules/${schedule.ScheduledExecutionKey}`}>{schedule.ScheduledExecutionName}</a>
        </td>
        <td>{nextDate}</td>
        <td>{schedule.ScheduledExecutionClientName}</td>
        <td>{schedule.ScheduledExecutionDataSetName}</td>
        <td>{loadDate}</td>
        <td>
          <input type="checkbox" disabled={true} checked={schedule.ScheduledExecutionEnabled} />
        </td>
      </tr>
    );

  }

}

export default ScheduleTableRow;
