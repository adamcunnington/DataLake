import React from 'react';

class MonitoringControls extends React.Component {

  constructor(props) {
    super(props);

    this.showPrevious = this.showPrevious.bind(this);
    this.showNext = this.showNext.bind(this);
  }

  showPrevious() {
    let end = new Date(this.props.dates.start);
    end.setDate(end.getDate() - 1);
    let start = new Date(end);
    start.setDate(start.getDate() - 4);

    this.props.selectDates(start, end);
  }

  showNext() {
    let start = new Date(this.props.dates.end);
    start.setDate(start.getDate() + 1);
    let end = new Date(start);
    end.setDate(end.getDate() + 4);

    this.props.selectDates(start, end);
  }

  render() {
    // TODO enable / disable controls based on available data?
    return (
      <div className="monitoring-controls u-cf">
        <a onClick={this.showPrevious} className="monitoring-control-previous">&lt; Previous</a>
        <a onClick={this.showNext} className="monitoring-control-next">Next &gt;</a>
      </div>
    );
  }

}

export default MonitoringControls;
