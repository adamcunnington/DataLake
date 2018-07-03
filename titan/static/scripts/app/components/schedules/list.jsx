import React from 'react';
import ScheduleTable from './table.jsx';
import Ajax from '../../utils/ajax';

import './schedule.css';

class ScheduleList extends React.Component {

  constructor() {
    super();
    this.state = {
      schedules: [],
      loading: true,
      selectedExecutions: [],
      selectedNextScheduledDate: null,
      selectedClients: [],
      selectedDataSets: [],
      selectedLoadDate: null,
      selectedEnabled: {
        selectedTrue: true,
        selectedFalse: true
      }
    };

    this.onNextScheduledDateFilterChange = this.onNextScheduledDateFilterChange.bind(this);
    this.onExecutionFilterChange = this.onExecutionFilterChange.bind(this);
    this.onClientFilterChange = this.onClientFilterChange.bind(this);
    this.onDataSetFilterChange = this.onDataSetFilterChange.bind(this);
    this.onLoadDateFilterChange = this.onLoadDateFilterChange.bind(this);
    this.onEnabledFilterChange = this.onEnabledFilterChange.bind(this);
  }

  componentDidMount() {

    // On page load, retrieve a list of schedules

    Ajax.fetch('/api/schedules/')
      .then(res => res.json())
      .then(results => {

        const schedules = results.data.map(schedule => {
          schedule.ScheduledExecutionNextScheduled = new Date(schedule.ScheduledExecutionNextScheduled);
          schedule.ScheduledExecutionNextLoadDate = new Date(schedule.ScheduledExecutionNextLoadDate);
          return schedule;
        });

        this.setState({
          schedules: schedules,
          loading: false,
          selectedExecutions: this.getUniqueExecutions(results.data),
          selectedClients: this.getUniqueClients(results.data),
          selectedDataSets: this.getUniqueDataSets(results.data)
        });
      });
  }

  // Filter update methods

  onNextScheduledDateFilterChange(date) {
    this.setState({
      selectedNextScheduledDate: date
    });
  }

  onExecutionFilterChange(executions) {
    this.setState({
      selectedExecutions: executions
    });
  }

  onClientFilterChange(clients) {
    this.setState({
      selectedClients: clients
    });
  }

  onDataSetFilterChange(dataSets) {
    this.setState({
      selectedDataSets: dataSets
    });
  }

  onLoadDateFilterChange(date) {
    this.setState({
      selectedLoadDate: date
    });
  }

  onEnabledFilterChange(values) {
    this.setState({
      selectedEnabled: values
    });
  }

  // Get a list of all executions included in the given list of schedules
  getUniqueExecutions(schedules) {
    return schedules.reduce((executions, schedule) => {
      if (executions.indexOf(schedule.ScheduledExecutionName) === -1) {
        executions.push(schedule.ScheduledExecutionName);
      }
      return executions;
    }, []).sort();
  }

  // Get a list of all clients included in the given list of schedules
  getUniqueClients(schedules) {
    return schedules.reduce((clients, schedule) => {
      if (clients.indexOf(schedule.ScheduledExecutionClientName) === -1) {
        clients.push(schedule.ScheduledExecutionClientName);
      }
      return clients;
    }, []).sort();
  }

  // Get a list of all datasets included in the given list of schedules
  getUniqueDataSets(schedules) {
    return schedules.reduce((dataSets, schedule) => {
      if (dataSets.indexOf(schedule.ScheduledExecutionDataSetName) === -1) {
        dataSets.push(schedule.ScheduledExecutionDataSetName);
      }
      return dataSets;
    }, []).sort();
  }

  render() {

    // TODO can we remove the need for these?
    const
      executions = this.getUniqueExecutions(this.state.schedules),
      clients = this.getUniqueClients(this.state.schedules),
      dataSets = this.getUniqueDataSets(this.state.schedules);

    let schedules = this.state.schedules;

    // Filter by next scheduled date
    if (this.state.selectedNextScheduledDate) {
      schedules = schedules.filter(schedule => {
        return this.state.selectedNextScheduledDate.isSame(schedule.ScheduledExecutionNextScheduled, 'day');
      });
    }

    // Filter by execution
    schedules = schedules.filter((schedule) => {
      return this.state.selectedExecutions.indexOf(schedule.ScheduledExecutionName) !== -1; 
    });

    // Filter by client
    schedules = schedules.filter((schedule) => {
      return this.state.selectedClients.indexOf(schedule.ScheduledExecutionClientName) !== -1; 
    });

    // Filter by dataset
    schedules = schedules.filter((schedule) => {
      return this.state.selectedDataSets.indexOf(schedule.ScheduledExecutionDataSetName) !== -1; 
    });

    // Filter by load date
    if (this.state.selectedLoadDate) {
      schedules = schedules.filter(schedule => {
        return this.state.selectedLoadDate.isSame(schedule.ScheduledExecutionNextLoadDate, 'day');
      });
    }

    // Filtered by enabled status
    if (!this.state.selectedEnabled.selectedTrue) {
      schedules = schedules.filter(schedule => !schedule.ScheduledExecutionEnabled);
    }
    if (!this.state.selectedEnabled.selectedFalse) {
      schedules = schedules.filter(schedule => schedule.ScheduledExecutionEnabled);
    }

    return (
      <div className="schedule-list">
        <ScheduleTable schedules={schedules} loading={this.state.loading}
          filterNextScheduledDate={this.onNextScheduledDateFilterChange}
          executions={executions} filterExecutions={this.onExecutionFilterChange}
          clients={clients} filterClients={this.onClientFilterChange}
          dataSets={dataSets} filterDataSets={this.onDataSetFilterChange}
          filterEnabled={this.onEnabledFilterChange}
          filterLoadDate={this.onLoadDateFilterChange}
        />
      </div>
    );
  }

}

export default ScheduleList;
