import React from 'react';
import { render } from 'react-dom';
import Execution from './components/execution.jsx';

class ExecutionApp extends React.Component {
  render() {
    return <Execution executionKey={data.executionKey} />;
  }
}

render(<ExecutionApp />, document.getElementById('execution'));
