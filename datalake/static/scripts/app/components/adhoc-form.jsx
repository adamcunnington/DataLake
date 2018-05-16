import React from 'react';
import DatePicker from 'react-datepicker';
import AcquireForm from './adhoc/acquire-form.jsx';
import ExtractForm from './adhoc/extract-form.jsx';

// Datepicker styles
require('react-datepicker/dist/react-datepicker.css');


class AdhocForm extends React.Component {
  
  // Form values
  // - Program
  // - Load date
  // - Client
  // - Dataset
  // - User

  // TODO add:
  // - Define zero or more acquires (name-value pairs)
  // - Extract details - same as above, but with destination and data source name

  constructor() {
    super();
    this.state = {
      program: '',
      loadDate: null,
      client: '',
      dataset: '',
      user: '',
      availablePrograms: [],

      // Handled by sub-forms
      acquires: [],

      extractDestination: '',
      extractDataSource: '',
      extractFields: [],

      submitted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLoadDateChange = this.handleLoadDateChange.bind(this);
    this.onAddAnotherAcquire = this.onAddAnotherAcquire.bind(this);
    this.removeAcquire = this.removeAcquire.bind(this);
    this.onSelectExtractDestination = this.onSelectExtractDestination.bind(this);
    this.onUpdateExtractDataSource = this.onUpdateExtractDataSource.bind(this);
    this.onUpdateExtractField = this.onUpdateExtractField.bind(this);
  }

  componentDidMount() {

    // Get available acquire programs
    fetch('/api/acquire-programs')
      .then(res => res.json())
      .then((results) => {
        this.setState({
          availablePrograms: results
        });
      });

  }

  handleChange(event) {

    const target = event.target,
      value = target.value,
      name = target.name;

    // TODO is there a better way of catching this event?
    if (name === 'program') {

      if (value) {
        this.addAcquire();
        this.setState({
          extractFields: []
        });
      } else {
        this.setState({
          acquires: [],
          extractFields: []
        });
      }
    }

    this.setState({
      [name]: value
    });
  }

  // Special case - merge with handleChange?
  // TODO only permit dates in the past?
  handleLoadDateChange(date) {
    this.setState({
      loadDate: date
    });
  }

  onAddAnotherAcquire() {
    this.addAcquire();
  }

  addAcquire() {

    let acquires = this.state.acquires;

    // TODO get property names dynamically
    acquires.push({
      // TODO add ID / name here?
      fields: {
        property1: '',
        property2: '',
        property3: ''
      }
    });

    this.setState({
      acquires: acquires
    });
  }

  removeAcquire(index) {
    let acquires = this.state.acquires;
    acquires.splice(index, 1);
    this.setState({
      acquires: acquires
    });
  }

  onSelectExtractDestination(destination) {
    this.setState({
      extractDestination: destination,
      extractFields: {
        'Extract field 1': '',
        'Extract field 2': '',
        'Extract field 3': ''
      }
    });
  }

  onUpdateExtractDataSource(dataSource) {
    this.setState({
      extractDataSource: dataSource
    });
  }

  onUpdateExtractField(name, value) {
    const extractFields = this.state.extractFields;
    extractFields[name] = value;
    this.setState({
      extractFields: extractFields
    });
  }

  // TODO handle changes in sub-components, show / hide submit button

  handleSubmit(event) {

    this.setState({
      submitted: true
    });

    fetch('/api/executions', {
      method: 'POST',
      data: JSON.stringify(this.state)
    })
      .then(() => {
        console.log('execution successful!');
      })

    event.preventDefault();
  }

  render() {

    const programOptions = this.state.availablePrograms.map((program, index) => {
      return <option key={index} value={program.id}>{program.name}</option>;
    });

    // TODO calculate whether to show Execute button based on other values

    // TODO calculate extractFields based on other values?

    if (this.state.submitted) {
      // TODO update this to contain status of execution (requires result from server)
      return <p>Adhoc execution triggered</p>;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="row">
          <label>Program</label>
          <select name="program" value={this.state.program} onChange={this.handleChange}>
            <option value=""></option>
            { programOptions }
          </select>
        </div>
        <div className="row">
          <label>Load date</label>
          <DatePicker selected={this.state.loadDate} dateFormat="DD/MM/YYYY" onChange={this.handleLoadDateChange} />
        </div>
        <div className="row">
          <label>Client</label>
          <input type="text" name="client" value={this.state.client} onChange={this.handleChange} />
        </div>
        <div className="row">
          <label>Dataset</label>
          <input type="text" name="dataset" value={this.state.dataset} onChange={this.handleChange} />
        </div>
        <div className="row">
          <label>User</label>
          <input type="text" name="user" value={this.state.user} onChange={this.handleChange} />
        </div>
        <AcquireForm acquires={this.state.acquires} addAnother={this.onAddAnotherAcquire} remove={this.removeAcquire} />
        <ExtractForm showForm={!!this.state.program}
          destination={this.state.extractDestination} selectDestination={this.onSelectExtractDestination}
          dataSource={this.state.extractDataSource} updateDataSource={this.onUpdateExtractDataSource}
          fields={this.state.extractFields} updateField={this.onUpdateExtractField} />
        <input type="submit" value="Execute" />
      </form>
    );
  }

}

export default AdhocForm;
