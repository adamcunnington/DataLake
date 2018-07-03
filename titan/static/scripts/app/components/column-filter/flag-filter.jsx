import React from 'react';
import ColumnFilter from './filter.jsx';

class ColumnFlagFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTrue: true,
      selectedFalse: true
    };
    this.toggleTrue = this.toggleTrue.bind(this);
    this.toggleFalse = this.toggleFalse.bind(this);
  }

  toggleTrue(event) {
    this.setState({
      selectedTrue: event.target.checked
    });

    const values = {
      selectedTrue: event.target.checked,
      selectedFalse: this.state.selectedFalse
    };
    this.change(values);
  }

  toggleFalse(event) {
    this.setState({
      selectedFalse: event.target.checked
    });

    const values = {
      selectedTrue: this.state.selectedTrue,
      selectedFalse: event.target.checked
    };
    this.change(values);
  }

  change(values) {
    this.props.onChange(values);
  }

  render() {

    const filtered = !(this.state.selectedTrue && this.state.selectedFalse);

    return (
      <ColumnFilter filtered={filtered} menuClassName="filter-menu-flag">
        <div className={'filter-menu-row' + (this.state.selectedTrue ? ' filter-menu-row-selected' : '')}>
          <label>
            <input type="checkbox" checked={this.state.selectedTrue} onChange={this.toggleTrue} />
            {this.props.trueLabel}
          </label>
        </div>
        <div className={'filter-menu-row' + (this.state.selectedFalse ? ' filter-menu-row-selected' : '')}>
          <label>
            <input type="checkbox" checked={this.state.selectedFalse} onChange={this.toggleFalse} />
            {this.props.falseLabel}
          </label>
        </div>
      </ColumnFilter>
    );
  }

}

export default ColumnFlagFilter;
