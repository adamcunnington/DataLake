import React from 'react';
import Tooltip from '../tooltip/index.jsx';
import './index.css';

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
            <Tooltip offsetX={30} offsetY={-7}>{this.props.tooltip}</Tooltip>
        }
      </span>
    );
  }
}

export default Info;
