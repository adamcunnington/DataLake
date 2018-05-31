import React from 'react';
import ScheduleTable from './table.jsx';
import Ajax from '../../utils/ajax';

require('./schedule.css');

class ScheduleList extends React.Component {

  constructor() {
    super();
    this.state = {
      schedules: [],
      loading: true,
      selectedClients: [],
      selectedDataSets: []
    };

    this.onClientFilterChange = this.onClientFilterChange.bind(this);
    this.onDataSetFilterChange = this.onDataSetFilterChange.bind(this);
  }

  componentDidMount() {

    // On page load, retrieve a list of schedules

    Ajax.fetch('/api/schedules')
      .then(res => res.json())
      .then((results) => {
        this.setState({
          schedules: results,
          loading: false,
          selectedClients: this.getUniqueClients(results),
          selectedDataSets: this.getUniqueDataSets(results)
        });
      });
  }

  // Filter update methods

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

  // Get a list of all clients included in the given list of schedules
  getUniqueClients(schedules) {
    return schedules.reduce((clients, schedule) => {
      if (clients.indexOf(schedule.client) === -1) {
        clients.push(schedule.client);
      }
      return clients;
    }, []).sort();
  }

  // Get a list of all datasets included in the given list of schedules
  getUniqueDataSets(schedules) {
    return schedules.reduce((dataSets, schedule) => {
      if (dataSets.indexOf(schedule.dataSet) === -1) {
        dataSets.push(schedule.dataSet);
      }
      return dataSets;
    }, []).sort();
  }

  render() {

    const clients = this.getUniqueClients(this.state.schedules),
      dataSets = this.getUniqueDataSets(this.state.schedules);

    let schedules = this.state.schedules;

    // Filter by client
    schedules = schedules.filter((schedule) => {
      return this.state.selectedClients.indexOf(schedule.client) !== -1; 
    });

    // Filter by dataset
    schedules = schedules.filter((schedule) => {
      return this.state.selectedDataSets.indexOf(schedule.dataSet) !== -1; 
    });

    return (
      <div className="schedule-list">
        <ScheduleTable schedules={schedules} loading={this.state.loading}
          clients={clients} filterClients={this.onClientFilterChange}
          dataSets={dataSets} filterDataSets={this.onDataSetFilterChange}
          />
      </div>
    );
  }

}

export default ScheduleList;
