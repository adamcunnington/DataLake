import React from 'react';

class FilterMenu extends React.Component {

  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
  }

  select(event) {
    const target = event.target;
    this.props.onSelect(target.name, target.checked);
  }

  render() {

    const options = this.props.values.map((value, index) => {

      const id = 'filter-value-' + index; // TODO more robust unique ID?

      return <div key={index} className="filter-menu-row">
        <input id={id} type="checkbox" name={value.name} checked={value.selected} onChange={this.select} />
        <label htmlFor={id}>{value.name}</label>
      </div>;
    })

    if (this.props.open) {
      return (
        <div className="filter-menu">
          {options}
        </div>
      );
    }
    return [];
  }
}

export default FilterMenu;
