import React from 'react';
import AcquireItem from './item.jsx';

import './index.css';

class AcquireList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      acquires: this.props.acquires
    };

    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.itemNameChange = this.itemNameChange.bind(this);
    this.itemOptionChange = this.itemOptionChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.acquires !== this.state.acquires) {
      this.setState({
        acquires: nextProps.acquires
      });
    } 
  }

  // Add another acquire to list
  add() {

    const acquires = this.state.acquires;

    const newAcquire = {
      ScheduledAcquireName: name,
      Options: this.props.options.map(option => {
        return {
          ScheduledAcquireOptionName: option.AcquireProgramOptionName,
          ScheduledAcquireOptionValue: ''
        }
      })
    };

    acquires.push(newAcquire);

    this.setState({ acquires });

    this.props.onChange(acquires);
  }

  remove(index) {
    let acquires = this.state.acquires;
    acquires.splice(index, 1);
    this.setState({ acquires });
    this.props.onChange(acquires);
  }

  itemNameChange(index, value) {
    const acquires = this.state.acquires;
    acquires[index].ScheduledAcquireName = value;
    this.setState({ acquires });
    this.props.onChange(acquires);
  }

  itemOptionChange(index, name, value) {
    const acquires = this.state.acquires;

    let option = acquires[index].Options
      .find(option => option.ScheduledAcquireOptionName === name);

    // Option not found? Add it
    if (!option) {
      option = {
        ScheduledAcquireOptionName: name,
        ScheduledAcquireOptionValue: ''
      };
      acquires[index].Options.push(option);
    }

    option.ScheduledAcquireOptionValue = value;

    this.setState({ acquires });
    this.props.onChange(acquires);
  }

  render() {

    const acquireItems = this.state.acquires.map((acquire, index) => {
      return <AcquireItem
        key={index}
        adhoc={this.props.adhoc}
        acquire={acquire}
        index={index}
        remove={this.remove}
        onNameChange={this.itemNameChange}
        onOptionChange={this.itemOptionChange}
        options={this.props.options}
        validate={this.props.validate}
      />
    });

    return (
      <div className="acquire-list">
        { acquireItems }
        { !this.state.acquires.length && <p>No acquires</p> }
        <a onClick={this.add}>+ Add another</a>
      </div>
    );
  }
}

export default AcquireList;
  