import React from 'react';

class FilterMenu extends React.Component {

  render() {
    if (this.props.open) {
      return <div className="filter-menu"></div>;
    }
    return [];
  }
}

export default FilterMenu;
