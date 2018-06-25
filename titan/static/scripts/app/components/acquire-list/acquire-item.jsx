import React from 'react';
import Label from '../label.jsx';

class AcquireItem extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.remove = this.remove.bind(this);
  }

  onChange(event) {
    const target = event.target,
      name = target.name,
      value = target.value;
    this.props.onChange(this.props.index, name, value);
  }

  remove() {
    this.props.remove(this.props.index);
  }

  render() {

    // TODO show when fields are required

    const rows = this.props.acquire.Options.map((option, index) => {
      return (
        <div key={index} className="acquire-property">
          <Label>{option.ScheduledAcquireOptionName}</Label>
          <input type="text" name={option.ScheduledAcquireOptionName} value={option.ScheduledAcquireOptionValue} onChange={this.onChange} />
        </div>
      );
    });

    return (
      <div className="acquire-item u-cf">
        <div className="acquire-properties">
          {rows}
        </div>
        <a onClick={this.remove} className="acquire-item-remove">
          <span className="fas fa-times" />
        </a>
      </div>
    );
  }
}

export default AcquireItem;
