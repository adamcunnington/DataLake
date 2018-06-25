import React from 'react';

class MonitoringFooter extends React.Component {

  render() {
    return (
      <div className="monitor-controls-footer">
        <a onClick={this.props.showMore} className="monitoring-control-more">Show more</a>
        <a onClick={this.props.retryExecutions} className={'monitor-btn-retry' + (!!this.props.retryList.length ? '' : ' monitor-btn-disabled')}>Retry</a>
      </div>
    );
  }
}

export default MonitoringFooter;
