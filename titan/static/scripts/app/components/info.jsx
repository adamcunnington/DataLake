import React from 'react';
import './info.css';

class Info extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    };
    this.mouseOver = this.mouseOver.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
  }

  mouseOver(event) {
    this.setState({
      showTooltip: true
    });
  }

  mouseOut(event) {
    this.setState({
      showTooltip: false
    });
  }

  render() {

    const className = 'fas fa-info-circle info-icon'
      + (this.props.className ? ' ' + this.props.className : '');

    return (
      <span className="info-wrap">
        <span className={className} onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} />
        {
          this.state.showTooltip &&
            <div className="info-tooltip">{this.props.tooltip}</div>
        }
      </span>
    );
  }
}

export default Info;
