import React from 'react';
import {render} from 'react-dom';
import ScheduleList from './components/schedules/list.jsx';

class SchedulesApp extends React.Component {
  render() {
    return <ScheduleList />;
  }
}

render(<SchedulesApp />, document.getElementById('schedules'));
