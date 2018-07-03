import React from 'react';
import { render } from 'react-dom';
import ScheduleForm from './components/schedule-form.jsx';

class ScheduleApp extends React.Component {
  render() {
    const id = data.scheduleKey;
    return <ScheduleForm id={id} />;
  }
}

render(<ScheduleApp />, document.getElementById('schedule'));
