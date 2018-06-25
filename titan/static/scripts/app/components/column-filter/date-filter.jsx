import React from 'react';
import ColumnFilter from './filter.jsx';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

class ColumnDateFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      date: null
    }
    this.clear = this.clear.bind(this);
    this.select = this.select.bind(this);
  }

  clear() {

    // Ignore if no date is selected
    if (this.state.date) {
      this.setState({
        date: null
      });
      this.props.onChange(null);
    }
  }

  select(date) {
    this.setState({ date });
    this.props.onChange(date);
  }

  render() {

    const controls = <a className={'filter-menu-link' + (this.state.date ? '' : ' filter-menu-link-disabled')}
      onClick={this.clear}>
      <span className="fas fa-times filter-menu-icon" />
      Clear
    </a>;

    return (
      <ColumnFilter filtered={!!this.state.date} controls={controls}
        controlsClassName="filter-controls-date" menuClassName="filter-menu-date">
        <DatePicker inline={true}
          selected={this.state.date} onChange={this.select}
          minDate={this.props.minDate} maxDate={this.props.maxDate}
          calendarClassName="filter-menu-datepicker"
        />
      </ColumnFilter>
    );
  }

}

export default ColumnDateFilter;
