import React from 'react';

class FilterButton extends React.Component {

  render() {
    return <button className="filter-button" onClick={this.props.toggle}>
      <span className="fas fa-filter"></span>
    </button>;
  }

}

export default FilterButton;
