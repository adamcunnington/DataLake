import React from 'react';
import FilterButton from './filter-button.jsx';
import FilterMenu from './filter-menu.jsx';

import './filter.css';

class ColumnFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  close() {
    this.setState({
      open: false
    });
  }

  render() {
    return (
      <span className="column-filter">
        <FilterButton toggle={this.toggle} open={this.state.open} filtered={this.props.filtered} />
        <FilterMenu open={this.state.open} controls={this.props.controls}
          className={this.props.menuClassName} controlsClassName={this.props.controlsClassName}>
          { this.props.children }
        </FilterMenu>
        <div className={'filter-cover' + (this.state.open && ' filter-cover-open')} onClick={this.close} />
      </span>
    );
  }
}

export default ColumnFilter;
