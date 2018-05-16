import React from 'react';

class ExtractForm extends React.Component {

  constructor(props) {
    super(props);
    this.onDestinationChange = this.onDestinationChange.bind(this);
    this.onDataSourceChange = this.onDataSourceChange.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  onDestinationChange(e) {
    this.props.selectDestination(e.target.value);
  }

  onDataSourceChange(e) {
    this.props.updateDataSource(e.target.value);
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

    if (this.props.showForm) {

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
        
        // Data source
        rows.push(
          <div key="datasource" className="row">
            <label>Data source name</label>
            <input type="text" name="datasource" value={this.props.dataSource} onChange={this.onDataSourceChange} />
          </div>
        );

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

    } else {  // Don't show form
      rows.push(<p key="empty-msg">No acquire job selected</p>);
    }

    return (
      <div className="extract-form">
        <h5>Extracts</h5>
        {rows}
      </div>
    );
  }

}

export default ExtractForm;
