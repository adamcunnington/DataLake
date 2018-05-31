import React from 'react';

class MonitoringGridLabel extends React.Component {

    constructor(props) {
        super(props);
    }

    // TODO include hierarchy
    render() {
        return <label>{this.props.label}</label>;
    }

}

export default MonitoringGridLabel;
