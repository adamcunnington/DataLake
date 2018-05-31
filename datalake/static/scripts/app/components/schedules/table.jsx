import React from 'react';
import ColumnFilter from '../column-filter/filter.jsx'
import dateUtils from '../../utils/date-utils';

class ScheduleTable extends React.Component {

  render() {

    const head = (
      <tr>
        <th>Schedule</th>
        <th>Next scheduled date</th>
        <th>
          Client
          {
            !!this.props.clients.length &&
              <ColumnFilter values={this.props.clients} onChange={this.props.filterClients} />
          }
        </th>
        <th>
          Dataset
          {
            !!this.props.dataSets.length &&
              <ColumnFilter values={this.props.dataSets} onChange={this.props.filterDataSets} />
          }
        </th>
        <th>Load date</th>
        <th>Enabled?</th>
      </tr>
    );

    const body = this.props.schedules.length
      ? this.props.schedules.map((schedule, index) => {

        const href = '/schedules/' + schedule.id;
        const nextDate = dateUtils.dateToString(new Date(schedule.nextScheduled));
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
      })
      : <tr>
        <td className="schedule-loading" colSpan="6">{ this.props.loading ? 'Loading...' : 'No schedules' }</td>
      </tr>;

    return (
      <table className="schedule-table">
        <thead>{head}</thead>
        <tbody>{body}</tbody>
      </table>
    );

  }
  
}

export default ScheduleTable;
