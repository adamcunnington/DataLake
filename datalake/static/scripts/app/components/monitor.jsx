import React from 'react';
import MonitoringControls from './monitoring/controls.jsx';
import MonitoringGrid from './monitoring/grid.jsx';

import Ajax from '../utils/ajax';
import dateUtils from '../utils/date-utils';

require('./monitor.css');

class Monitor extends React.Component {

  constructor() {

    super();

    const days = 5;

    const start = new Date();
    start.setDate(start.getDate() - days);
    const end = new Date();
    end.setDate(end.getDate() - 1);

    this.state = {
      dates: {
        start: start,
        end: end
      },
      loading: true,
      data: [],
      retryList: []
    };

    // Bind events
    this.selectExecution = this.selectExecution.bind(this);
    this.retryExecutions = this.retryExecutions.bind(this);
    this.showDates = this.showDates.bind(this);
    this.showMore = this.showMore.bind(this);
  }

  componentDidMount() {

    const callback = (result) => {
      this.setState({
        loading: false,
        data: result
      });
    };

    this.fetchData(this.state.dates, callback);
  }

  showDates(start, end) {

    this.setState({
      dates: {
        start: start,
        end: end
      },
      data: []
    });

    const callback = (result) => {
      this.setState({
        loading: false,
        data: result
      });
    }

    this.fetchData({ start: start, end: end }, callback);
  }

  showMore() {
    const callback = (result) => {
      this.setState({
        loading: false,
        data: this.state.data.concat(result)
      });
    };
    this.fetchData(this.state.dates, callback)
  }

  fetchData(dates, callback) {

    this.setState({
      loading: true
    });

    const url = '/api/executions'
      + '?start=' + dateUtils.dateToIso8601(dates.start)
      + '&end=' + dateUtils.dateToIso8601(dates.end);

    // Request data
    Ajax.fetch(url)
      .then(res => res.json())
      .then(
        callback,
        (error) => {
          // TODO error handling
          console.log('Error retrieving data');
        }
      );
  }

  selectExecution(id, date, add) {

    // Add or remove execution from list

    const list = this.state.retryList;

    if (add) {
      // Add to list
      list.push({
        id: id,
        date: date
      });
    } else {
      // Remove from list
      for (const i in list) {
        if (list[i].id === id && list[i].date === date) {
          list.splice(i, 1);
          break;
        }
      }
    }

    this.setState({
      retryList: list
    });
  }

  retryExecutions() {

    if (this.state.retryList.length === 0) {
      return;
    }

    this.setState({
      loading: true
    });

    fetch('/api/executions/retry', {
      method: 'post',
      body: JSON.stringify({
        'executions': this.state.retryList
      })
    }).then(res => res.json())
      .then((result) => {
          this.setState({
            retryList: [],
            loading: false,
            data: result
          });
        },
        (error) => {
          // TODO error handling
          console.log('Error retrieving data');
        }
      );
  }

  render() {

    // TODO pass retryList to MonitoringGrid, use it to handle checked / unchecked state

    return (
      <div className="monitor-grid">
        <MonitoringControls dates={this.state.dates} selectDates={this.showDates} />
        <MonitoringGrid dates={this.state.dates} data={this.state.data} select={this.selectExecution} />
        {
          this.state.loading
            ? <p className="monitor-loading">Loading...</p>
            : <div className="monitor-controls-footer">
                <a onClick={this.showMore} className="monitoring-control-more">Show more</a>
                <a onClick={this.retryExecutions} className={'monitor-btn-retry' + (!!this.state.retryList.length ? '' : ' monitor-btn-disabled')}>Retry</a>
              </div>
        }
      </div>
    );
  }
}

export default Monitor;
