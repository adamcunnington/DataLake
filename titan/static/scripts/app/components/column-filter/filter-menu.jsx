import React from 'react';

class FilterMenu extends React.Component {

  render() {

    if (!this.props.open) {
      return null;
    }

    return (
      <div className={'filter-menu ' + (this.props.className || '')}>
        {
          this.props.controls &&
            <div className={'filter-menu-controls ' + (this.props.controlsClassName || '')}>
              { this.props.controls }
            </div>
        }
        <div className="filter-menu-options">
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default FilterMenu;
