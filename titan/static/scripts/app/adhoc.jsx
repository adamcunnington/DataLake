import React from 'react';
import { render } from 'react-dom';
import AdhocForm from './components/adhoc-form.jsx';

class AdhocApp extends React.Component {
  render() {
    return <AdhocForm schedule={data.scheduleId} />;
  }
}

render(<AdhocApp />, document.getElementById('adhoc'));
