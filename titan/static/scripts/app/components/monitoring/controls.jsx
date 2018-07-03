import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../react-datepicker-overrides.css';

class MonitoringControls extends React.Component {

  constructor(props) {
    super(props);
    this.selectDate = this.selectDate.bind(this);
  }

  selectDate(value) {
    
    const start = value.toDate();
    start.setDate(start.getDate() - 4);
    const end = value.toDate();

    this.props.onSelectDates(start, end);
  }

  render() {

    const date = moment(this.props.end);

    return (
      <section className="controls">
        <label>Show executions up to date</label>
        <DatePicker selected={date} dateFormat="DD/MM/YYYY" onChange={this.selectDate} maxDate={moment().add(-1, 'd')} />
      </section>
    );
  }

}

export default MonitoringControls;
