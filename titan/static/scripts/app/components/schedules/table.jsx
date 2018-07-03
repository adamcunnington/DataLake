import React from 'react';
import ColumnDateFilter from '../column-filter/date-filter.jsx';
import ColumnFlagFilter from '../column-filter/flag-filter.jsx';
import ColumnListFilter from '../column-filter/list-filter.jsx';
import ScheduleTableRow from './row.jsx';
import moment from 'moment';

class ScheduleTable extends React.Component {

  render() {

    const showFilters = !this.props.loading;

    const head = (
      <tr>
        <th>
          Schedule
          {
            showFilters &&
              <ColumnListFilter values={this.props.executions} onChange={this.props.filterExecutions} />
          }
        </th>
        <th>
          Next scheduled
          {
            showFilters &&
            <ColumnDateFilter onChange={this.props.filterNextScheduledDate} minDate={moment()} />
          }
        </th>
        <th>
          Client
          {
            showFilters &&
              <ColumnListFilter values={this.props.clients} onChange={this.props.filterClients} />
          }
        </th>
        <th>
          Dataset
          {
            showFilters &&
              <ColumnListFilter values={this.props.dataSets} onChange={this.props.filterDataSets} />
          }
        </th>
        <th>
          Load date
          {
            showFilters &&
              <ColumnDateFilter onChange={this.props.filterLoadDate} />
          }
        </th>
        <th>
          Enabled?
          {
            showFilters &&
              <ColumnFlagFilter trueLabel="Enabled" falseLabel="Disabled" onChange={this.props.filterEnabled} />
          }
        </th>
      </tr>
    );

    const body = this.props.schedules.length
      ? this.props.schedules.map((schedule, index) => <ScheduleTableRow key={index} schedule={schedule} />)
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
