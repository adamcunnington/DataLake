import React from 'react';

class ExtractForm extends React.Component {

  constructor(props) {
    super(props);
    this.onDestinationChange = this.onDestinationChange.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  onDestinationChange(e) {
    this.props.selectDestination(e.target.value);
  }

  onFieldChange(e) {
    const target = e.target;
    this.props.updateField(target.name, target.value);
  }

  render() {

    let rows = [];
    const destinations = [ // TODO get these from props
      'FTP',
      'Database',
      'Dropbox'
    ];

    // Destination
    const destinationOptions = destinations.map((source, index) => {
      return <option key={index} value={source}>{source}</option>;
    });

    rows.push(
      <div key="destination" className="row">
        <label>Destination</label>
        <select value={this.props.destination} onChange={this.onDestinationChange}>
          <option value=""></option>
          { destinationOptions }
        </select>
      </div>
    );

    if (this.props.destination) {

      // Dynamic fields
      const dynamicFieldRows = Object.keys(this.props.fields).map((key, index) => {
        return (
          <div key={'df-' + index} className="row">
            <label>{key}</label>
            <input type="text" name={key} value={this.props.fields[key]} onChange={this.onFieldChange} />
          </div>
        );
      });

      rows = rows.concat(dynamicFieldRows);
    }

    return (
      <div className="extract-form">
        {rows}
      </div>
    );
  }

}

export default ExtractForm;
