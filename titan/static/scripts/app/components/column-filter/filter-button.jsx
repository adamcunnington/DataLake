import React from 'react';

class FilterButton extends React.Component {

  render() {

    const className = 'filter-button'
      + (this.props.open ? ' filter-button-open' : '');

    return <button className={className} onClick={this.props.toggle}>
      <span className={'fas ' + (this.props.filtered ? 'fa-filter' : 'fa-caret-down')}></span>
      { this.props.filtered && <span className="fas fa-caret-down filter-icon-sub"></span> }
    </button>;
  }

}

export default FilterButton;
