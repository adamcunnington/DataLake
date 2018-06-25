import React from 'react';

require('./dialog.css');

class Dialog extends React.Component {
  
  constructor(props) {

    super(props);

    this.close = this.close.bind(this);
    this.ok = this.ok.bind(this);
  }

  close() {
    this.props.onClose();
  }

  ok() {
    this.props.onOk();
  }

  render() {

    return (
      <div className="dialog">
        <div className="dialog-box">
          <div className="dialog-contents">
            { this.props.children }
          </div>
          {
            this.props.onOk &&
              <div className="dialog-controls">
                <button className="button button-primary" onClick={this.ok}>Ok</button>
              </div>
          }
        </div>
        <div className="dialog-cover" onClick={this.close}></div>
      </div>
    );

  }  
}

export default Dialog;
