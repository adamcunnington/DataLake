import React from 'react';
import FilterButton from './filter-button.jsx';
import FilterMenu from './filter-menu.jsx';

require('./filter.css');

class ColumnFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      values: this.props.values.map((value) => {
        return { name: value, selected: true }
      })
    };
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
    this.select = this.select.bind(this);
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

  select(name, selected) {
    const values = this.state.values;
    const value = values.find((value) => value.name === name);
    value.selected = selected;
    this.setState({
      values: values
    });

    const names = values
      .filter(value => value.selected)
      .map(value => value.name);

    this.props.onChange(names);
  }

  render() {
    return (
      <span className="column-filter">
        <FilterButton toggle={this.toggle} />
        <FilterMenu open={this.state.open} values={this.state.values} onSelect={this.select} />
        <div className={'filter-cover' + (this.state.open && ' filter-cover-open')} onClick={this.close} />
      </span>
    );
  }
}

export default ColumnFilter;
