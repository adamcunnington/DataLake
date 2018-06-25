import React from 'react';
import MonitoringGridHeader from './header.jsx';
import MonitoringGridClient from './client.jsx';
import DateUtils from '../../utils/date-utils';

import './grid.css';

class MonitoringGrid extends React.Component {

  render() {

    const highlight = DateUtils.isYesterday(this.props.dates.end);

    const rows = Object.keys(this.props.data).map(key => {

      const datum = this.props.data[key];

      return <MonitoringGridClient key={key} name={key} data={datum} selectExecution={this.props.select} highlight={highlight} />;
    })

    return (
      <div className="monitoring-grid">
        <MonitoringGridHeader dates={this.props.dates} />
        { rows }
      </div>
    );
  }

}

export default MonitoringGrid;