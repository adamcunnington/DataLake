import React from 'react';
import { render } from 'react-dom';
import Monitor from './components/monitor.jsx';

class MonitoringApp extends React.Component {
  render () {
    return <Monitor />;
  }
}

render(<MonitoringApp />, document.getElementById('monitoring'));
