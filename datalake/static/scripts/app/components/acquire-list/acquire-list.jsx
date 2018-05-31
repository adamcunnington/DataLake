import React from 'react';
import AcquireItem from './acquire-item.jsx';

require('./acquire-list.css');

class AcquireList extends React.Component {

  constructor(props) {
    super(props);

    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.itemChange = this.itemChange.bind(this);
  }

  // Add another acquire to list
  add() {
    this.props.onAdd();
  }

  remove(index) {
    this.props.onRemove(index);
  }

  itemChange(index, name, value) {
    this.props.onItemChange(index, name, value);
  }

  render() {

    const acquireItems = this.props.acquires.map((acquire, index) => {
      return <AcquireItem key={index} fields={acquire.fields} expanded={acquire.expanded}
        index={index} remove={this.remove} onChange={this.itemChange} />
    });

    return (
      <div className="acquire-list">
        { acquireItems }
        { !this.props.acquires.length && <p>No acquires</p> }
        <a onClick={this.add}>+ Add another</a>
      </div>
    );
  }
}

export default AcquireList;
