import React from 'react';
import dateUtils from '../../utils/date-utils';

import './header.css';

class MonitoringGridHeader extends React.Component {

  render() {

    const start = this.props.start, end = this.props.end;

    let labels = [], i = 1, temp = new Date(start);

    // Iterate from start to end dates
    while (temp <= end) {

      let dateLabel = '', className = 'header-label';

      // Special case for yesterday and today
      if (dateUtils.isToday(temp)) {
        dateLabel = 'Today';
      } else if (dateUtils.isYesterday(temp)) {
        dateLabel = 'Yesterday';
        className += ' header-highlight';
      } else {
        dateLabel = dateUtils.dateToString(temp);
      }

      // Add header cell with (formatted) date
      labels.push(
        <span key={i++} className={className}>
          <label className="header-date">{dateLabel}</label>
          <label className="header-day">{dateUtils.getWeekday(temp)}</label>
        </span>
      );

      // Next date
      temp.setDate(temp.getDate() + 1);
    }

    return (
      <div className="header">
        <h4 className="header-description">Client, Data Source, Data Set</h4>
        {labels}
      </div>
    );
  }

}

export default MonitoringGridHeader;
