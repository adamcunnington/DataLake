import React from 'react';
import Select from 'react-select';
import Label from '../label.jsx';
import TextField from '../form-field/text-field.jsx';
import Ajax from '../../utils/ajax';

class ExtractForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      availableDestinations: [],
      destination: props.destination,
      options: props.options
    };

    this.onDestinationChange = this.onDestinationChange.bind(this);
    this.onOptionChange = this.onOptionChange.bind(this);
  }

  componentDidMount() {
    Ajax.fetch('/api/extract-programs/')
      .then(res => res.json())
      .then(result => {
        this.setState({
          availableDestinations: result.data
        });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.destination !== this.state.destination) {
      this.setState({
        destination: nextProps.destination
      });
    }
    if (nextProps.options !== this.state.options) {
      this.setState({
        options: nextProps.options
      });
    }
  }

  onDestinationChange(destination) {

    // Pass the destination and options to the parent

    const label = destination ? destination.label : '';

    // Get option config
    const optionConfig = destination
      ? this.state.availableDestinations.find(d => d.ExtractProgramPythonName === destination.value).Options
      : [];

    // Reset options
    const options = optionConfig.map(option => {
      return this.createBlankExtractOption(option.ExtractProgramOptionName);
    });

    this.props.onDestinationChange(destination ? destination.value : '', options, optionConfig);
  }

  onOptionChange(e) {
    const target = e.target;
    const options = this.state.options;

    let option = options.find(option => option.ScheduledExtractOptionName === target.name);

    // Option not found?  Add it
    if (!option) {
      option = this.createBlankExtractOption(target.name);
      options.push(option);
    }

    option.ScheduledExtractOptionValue = target.value;

    this.props.onOptionsChange(options, this.isValid());
  }

  createBlankExtractOption(name) {
    return {
      ScheduledExtractOptionName: name,
      ScheduledExtractOptionValue: ''
    }
  }

  getOptionsConfig() {
    const dest = this.state.availableDestinations.find(d => d.ExtractProgramPythonName === this.state.destination);
    return dest ? dest.Options : [];
  }

  // Get a list of the fields which are required
  getRequiredOptions() {
    return this.getOptionsConfig()
      .filter(config => config.ExtractProgramOptionRequired)
      .map(config => config.ExtractProgramOptionName);
  }

  // Check that the extract is valid
  isValid() {

    // If destination is blank, this is fine
    if (!this.state.destination) {
      return true;
    }

    const invalidOptions = [];
    const requiredOptions = this.getRequiredOptions();
    
    // Cross-reference options with a list of required options
    for (let optionName of requiredOptions) {

      const option = this.state.options.find(option => option.ScheduledExtractOptionName === optionName);

      if (!option || !option.ScheduledExtractOptionValue) {
        invalidOptions.push(optionName);
      }
    }

    return invalidOptions.length === 0;
  }

  render() {

    // NOTE:  We are passed a list of current values for the extract options, and a list containing
    //        all fields and details on whether they are mandatory (along with an explanation). We
    //        need to cross-reference the two so that blank options are still displayed.

    let rows = [];

    const destinationOptions = this.state.availableDestinations.map(destination => {
      return {
        value: destination.ExtractProgramPythonName,
        label: destination.ExtractProgramFriendlyName,
        options: destination.Options
      };
    });

    // Find the correct object from destinationObjects
    const destinationValue = destinationOptions.find(o => o.value === this.state.destination);

    if (this.state.destination) {

      // Get a list of all available options
      const optionsConfig = this.getOptionsConfig();

      rows = optionsConfig.map((optionConfig, index) => {

        // Option name
        const name = optionConfig.ExtractProgramOptionName;

        // Look for the existing value
        const option = this.state.options
          .find(option => option.ScheduledExtractOptionName === name);

        // Option not found? Create a blank value
        const value = option ? option.ScheduledExtractOptionValue : '';

        return (
          <TextField
            key={index}
            label={name}
            name={name}
            value={value}
            required={optionConfig.ExtractProgramOptionRequired}
            onChange={this.onOptionChange}
            validate={this.props.validate}
            tooltip={optionConfig.ExtractProgramOptionHelp}
          />
        );

      });
    }

    return (
      <div className="extract-form">
        <div>
          <Label>Destination</Label>
          <Select
            value={destinationValue}
            options={destinationOptions}
            onChange={this.onDestinationChange}
            className="titan-react-select"
          />
        </div>
        {rows}
      </div>
    );
  }

}

export default ExtractForm;
