import React from 'react';
import ColumnFilter from './filter.jsx';

class ColumnListFilter extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      values: this.props.values.map(value => {
        return {
          name: value,
          selected: true
        };
      })
    };

    this.select = this.select.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
  }

  select(event) {

    const values = this.state.values;
    values.find(value => value.name === event.target.name).selected = event.target.checked;

    this.setState({ values });

    this.change(values);
  }

  selectAll() {

    const values = this.state.values.map(value => {
      value.selected = true;
      return value;
    });

    this.setState({ values });

    this.change(values);
  }

  deselectAll() {

    const values = this.state.values.map(value => {
      value.selected = false;
      return value;
    });

    this.setState({ values });

    this.change(values);
  }

  change(values) {

    const filterList = values.filter(value => value.selected).map(value => value.name);

    this.props.onChange(filterList);
  }

  render() {

    const filtered = !!this.state.values.find(value => !value.selected);

    const controls = [
      <a key={1} className="filter-menu-link" onClick={this.selectAll}>
        <span className="far fa-check-square filter-menu-icon" />
        Select all
      </a>,
      <a key={2} className="filter-menu-link" onClick={this.deselectAll}>
        <span className="far fa-square filter-menu-icon" />
        Deselect all
      </a>
    ];

    const options = this.state.values.map((value, index) => {
      const id = 'filter-value-' + index; // TODO more robust unique ID?
      return (
        <div key={index} className={ 'filter-menu-row' + (value.selected ? ' filter-menu-row-selected' : '') }>
          <input id={id} type="checkbox" name={value.name} checked={value.selected} onChange={this.select} />
          <label htmlFor={id}>{value.name}</label>
        </div>
      );
    });

    return (
      <ColumnFilter filtered={filtered} controls={controls}>
        { options }
      </ColumnFilter>
    );
  }

}

export default ColumnListFilter;
