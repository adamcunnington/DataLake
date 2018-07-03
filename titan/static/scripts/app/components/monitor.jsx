import React from 'react';
import MonitoringControls from './monitoring/controls.jsx';
import MonitoringGrid from './monitoring/grid.jsx';
import MonitoringFooter from './monitoring/footer.jsx';
import Alert from './alert/alert.jsx'
import Ajax from '../utils/ajax';
import { isEmpty, mergeData } from '../utils/data-utils';
import DateUtils from '../utils/date-utils';
import Dialog from '../utils/dialog.jsx';

import './monitor.css';

class Monitor extends React.Component {

  constructor() {

    super();

    const days = 5;

    const start = new Date();
    start.setDate(start.getDate() - days);
    const end = new Date();
    end.setDate(end.getDate() - 1);

    this.state = {
      hasError: false,
      start: start,
      end: end,
      loading: true,
      data: [],
      retryList: [],
      message: null,
      dialogHasOk: true
    };

    // Bind events
    this.selectExecution = this.selectExecution.bind(this);
    this.retryExecutions = this.retryExecutions.bind(this);
    this.showDates = this.showDates.bind(this);
    this.showMore = this.showMore.bind(this);
    this.onDialogClose = this.onDialogClose.bind(this);
  }

  componentDidMount() {

    const callback = (result) => {
      this.setState({
        loading: false,
        data: result.data
      });
    };

    this.fetchData({
        start: this.state.start,
        end: this.state.end
      },
      callback
    );
  }

  showDates(start, end) {

    this.setState({
      start: start,
      end: end,
      data: []
    });

    const callback = (result) => {
      this.setState({
        loading: false,
        data: result.data
      });
    }

    this.fetchData({ start: start, end: end }, callback);
  }

  showMore() {
    const callback = (result) => {
      this.setState({
        loading: false,
        data: mergeData(this.state.data, result.data)
      });
    };
    this.fetchData({
        start: this.state.start,
        end: this.state.end
      },
      callback
    );
  }

  fetchData(dates, callback) {

    this.setState({
      hasError: false,
      loading: true
    });

    // TODO make this dynamic, add page number
    const url = '/api/executions/'
      + '?end_date=' + DateUtils.dateToIso8601(dates.end);

    // Request data
    Ajax.fetch(url)
      .then(res => res.json())
      .then(
        callback,
        (error) => {
          console.error(error.message);
          this.setState({
            hasError: true
          });
        }
      );
  }

  selectExecution(executionKey, add) {

    // Add or remove execution from list

    const list = this.state.retryList;

    if (add) {
      // Add to list
      list.push(executionKey);
    } else {
      // Remove from list
      const index = list.indexOf(executionKey);
      if (index > -1) {
        list.splice(index, 1);
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
      message: 'Restarting executions...',
      dialogHasOk: false
    });

    fetch('/api/executions/retry', {
      method: 'post',
      body: JSON.stringify({
        'data': this.state.retryList
      })
    }).then(res => res.json())
      .then(result => {
          this.setState({
            retryList: [],
            requestingRetry: false,
            data: result.data,
            message: 'Executions restarted.  Check back in a few minutes to see progress.',
            dialogHasOk: true
          });
        },
        (error) => {
          // TODO error handling
          console.log('Error retrieving data');
        }
      );
  }

  onDialogClose() {
    this.setState({
      message: null
    });
  }

  render() {

    if (this.state.hasError) {
      return (
        <Alert type="error" title="Unable to load data" canDismiss={false}>
          <p>An error occurred while retrieving the monitoring data</p>
        </Alert>
      );
    }

    // TODO pass retryList to MonitoringGrid, use it to handle checked / unchecked state

    const dialogOk = this.state.dialogHasOk ? this.onDialogClose : null;

    return (
      <div className="monitor-grid">
        <MonitoringControls
          start={this.state.start}
          end={this.state.end}
          onSelectDates={this.showDates}
        />
        <MonitoringGrid
          start={this.state.start}
          end={this.state.end}
          data={this.state.data}
          onSelect={this.selectExecution}
        />
        {
          this.state.loading &&
            <p className="monitor-loading">Loading...</p>
        }
        {
          !isEmpty(this.state.data) &&
            <MonitoringFooter retryList={this.state.retryList}
              showMore={this.showMore} retryExecutions={this.retryExecutions} />
        }
        {
          isEmpty(this.state.data) && !this.state.loading &&
            <p className="monitor-empty">No monitoring data found</p>
        }
        {
          this.state.message &&
            <Dialog onClose={this.onDialogClose} onOk={dialogOk}>
              <p>{this.state.message}</p>
            </Dialog>
        }
      </div>
    );
  }
}

export default Monitor;
