import React from 'react';
import TextField from '../form-field/text-field.jsx';

class AcquireItem extends React.Component {

  constructor(props) {
    super(props);
    this.updateName = this.updateName.bind(this);
    this.updateOption = this.updateOption.bind(this);
    this.remove = this.remove.bind(this);
  }

  updateName(event) {
    this.props.onNameChange(this.props.index, event.target.value);
  }

  updateOption(event) {
    const target = event.target,
      name = target.name,
      value = target.value;
    this.props.onOptionChange(this.props.index, name, value);
  }

  remove() {
    this.props.remove(this.props.index);
  }

  render() {

    const rows = this.props.options.map((option, index) => {

      const optionName = option.AcquireProgramOptionName;

      const selectedOption = this.props.acquire.Options
        .find(_option => _option.ScheduledAcquireOptionName === optionName);

      const value = !!selectedOption ? selectedOption.ScheduledAcquireOptionValue : '';

      return (
        <TextField
          key={index}
          compact={true}
          label={optionName}
          name={optionName}
          value={value}
          required={option.AcquireProgramOptionRequired}
          validate={this.props.validate}
          tooltip={option.AcquireProgramOptionHelp}
          onChange={this.updateOption}
        />
      );
    });

    return (
      <div className="acquire-item u-cf">
        <a onClick={this.remove} className="acquire-item-remove">
          <span className="fas fa-times" />
        </a>
        {
          !this.props.adhoc &&
            <TextField
              label="Acquire Name"
              className="acquire-name"
              inputClassName="acquire-name-input"
              value={this.props.acquire.ScheduledAcquireName}
              required={true}
              validate={this.props.validate}
              onChange={this.updateName}
            />
        }
        <div className="acquire-options">
          <h6>Acquire Options</h6>
          {rows}
        </div>
      </div>
    );
  }
}

export default AcquireItem;
