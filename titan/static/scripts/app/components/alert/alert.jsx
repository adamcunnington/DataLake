import React from 'react';
import PropTypes from 'prop-types';
import './alert.css';

class Alert extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      removed: false
    };
    this.close = this.close.bind(this);
  }

  close() {
    this.setState({
      removed: true
    });
  }

  getClassName() {

    const classNames = {
      success: 'alert-success',
      info: 'alert-info',
      warning: 'alert-warning',
      error: 'alert-error'
    };

    return classNames[this.props.type];
  }

  render() {

    if (this.state.removed) {
      return null;
    }

    return (
      <div className={'alert ' + this.getClassName()}>
        <div className="alert-header u-cf">
          {
            this.props.title &&
              <h5 className="alert-title">{this.props.title}</h5>
          }
          {
            this.props.canDismiss &&
              <a onClick={this.close} className="alert-close">
                <span className="fas fa-times alert-close-icon" />
              </a>
          }
        </div>
        <div className="alert-content">
          {this.props.children}
        </div>
      </div>
    );

  }

}

Alert.propTypes = {
  canDismiss: PropTypes.bool,
  title: PropTypes.string,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error'])
};

Alert.defaultProps = {
  canDismiss: true,
  type: 'info'
};

export default Alert;
