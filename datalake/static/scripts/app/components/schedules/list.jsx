import React from 'react';
import ScheduleTable from './table.jsx';

class ScheduleList extends React.Component {

  // Retrieve data from database
  // Manage the list of data

  constructor() {
    super();
    this.state = {
      schedules: [],
      loading: true,
      page: 1
    };

    this.loadMore = this.loadMore.bind(this);
  }

  componentDidMount() {

    fetch('/api/schedules')
      .then(res => res.json())
      .then((results) => {
        this.setState({
          schedules: results,
          loading: false
        });
      });

  }

  loadMore() {
    
    let page = this.state.page;
    page++;

    this.setState({
      loading: true,
      page: page
    });

    fetch('/api/schedules?page=' + page)
      .then(res => res.json())
      .then((results) => {
        this.setState({
          schedules: this.state.schedules.concat(results),
          loading: false
        });
      });
  }

  render() {

    // TODO
    // - Expandability?
    // - Other interactivity?

    return (
      <div className="schedule-list">
        <ScheduleTable schedules={this.state.schedules} />
        <div className="schedule-loading">
          {
            this.state.loading
              ? <p className="loading-message">Loading...</p>
              : <a onClick={this.loadMore}>Load more</a>
          }
        </div>
      </div>
    );
  }

}

export default ScheduleList;
