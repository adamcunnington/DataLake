import React from 'react';
import DatePicker from 'react-datepicker';
import AcquireList from './acquire-list/acquire-list.jsx';
import ExtractForm from './extract/extract-form.jsx';
import Ajax from '../utils/ajax';

// Datepicker styles
require('react-datepicker/dist/react-datepicker.css');

class AdhocForm extends React.Component {

  constructor() {
    super();
    this.state = {
      program: '',
      loadDate: null,
      client: '',
      dataSource: '',
      dataSet: '',
      user: '',
      availablePrograms: [],

      acquireProperties: ['property1', 'property2', 'property3'],
      acquires: [],

      extractDestination: '',
      extractFields: [],

      submitted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleProgramChange = this.handleProgramChange.bind(this);
    this.handleLoadDateChange = this.handleLoadDateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addAcquire = this.addAcquire.bind(this);
    this.removeAcquire = this.removeAcquire.bind(this);
    this.updateAcquireItem = this.updateAcquireItem.bind(this);
    this.onSelectExtractDestination = this.onSelectExtractDestination.bind(this);
    this.onUpdateExtractField = this.onUpdateExtractField.bind(this);
  }

  componentDidMount() {

    // Get available acquire programs
    Ajax.fetch('/api/acquire-programs')
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

    this.setState({
      [name]: value
    });
  }

  // Special case for program
  handleProgramChange(event) {

    const program = Number(event.target.value);
    const dataSource = program
      ? this.state.availablePrograms.find((obj) => { return obj.id === program; }).dataSource
      : '';

    this.setState({
      dataSource: dataSource,
      acquires: [],
      extractFields: []
    });
    this.handleChange(...arguments);
  }

  // Special case for load date
  // TODO only permit dates in the past?
  handleLoadDateChange(date) {
    this.setState({
      loadDate: date
    });
  }

  addAcquire() {

    const acquire = {
      fields: this.state.acquireProperties.reduce((obj, option) => { obj[option] = ''; return obj; }, {})
    }

    const acquires = this.state.acquires;
    acquires.push(acquire);

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

  updateAcquireItem(index, name, value) {
    let acquires = this.state.acquires;
    acquires[index].fields[name] = value;
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

  onUpdateExtractField(name, value) {
    const extractFields = this.state.extractFields;
    extractFields[name] = value;
    this.setState({
      extractFields: extractFields
    });
  }

  handleSubmit(event) {

    this.setState({
      submitted: true
    });

    Ajax.fetch('/api/executions', {
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
        <div>
          <label>Program</label>
          <select name="program" value={this.state.program} onChange={this.handleProgramChange}>
            <option value=""></option>
            { programOptions }
          </select>
        </div>
        <div>
          <label>Load date</label>
          <DatePicker selected={this.state.loadDate} dateFormat="DD/MM/YYYY" onChange={this.handleLoadDateChange} />
        </div>
        <div>
          <label>Client</label>
          <input type="text" name="client" value={this.state.client} onChange={this.handleChange} />
        </div>
        <div>
          <label>Data source</label>
          <input type="text" name="dataSource" value={this.state.dataSource} onChange={this.handleChange} disabled={!!this.state.program} />
        </div>
        <div>
          <label>Data set</label>
          <input type="text" name="dataSet" value={this.state.dataSet} onChange={this.handleChange} />
        </div>
        <div>
          <label>User</label>
          <input type="text" name="user" value={this.state.user} onChange={this.handleChange} />
        </div>
        <div className="form-section">
          <h6>Acquires</h6>
          {
            this.state.program
            ? <AcquireList acquires={this.state.acquires} onAdd={this.addAcquire}
                onRemove={this.removeAcquire} onItemChange={this.updateAcquireItem} />
            : <p>Select an acquire program</p>
          }
        </div>
        <div className="form-section">
          <h6>Extract</h6>
          {
            this.state.program
              ? <ExtractForm destination={this.state.extractDestination} selectDestination={this.onSelectExtractDestination}
                  fields={this.state.extractFields} updateField={this.onUpdateExtractField} />
              : <p className="empty-msg">No acquire program selected</p>
          }
        </div>
        <div>
          <input type="submit" value="Execute" />
        </div>
      </form>
    );
  }

}

export default AdhocForm;
