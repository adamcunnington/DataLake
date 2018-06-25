import React from 'react';

require('./scroll-to-top.css');

class ScrollToTop extends React.Component {

  constructor() {
    super();
    this.state = {
      show: false
    };
    this.setVisibility = this.setVisibility.bind(this);
  }

  setVisibility() {
    this.setState({
      show: !!document.scrollingElement.scrollTop
    });
  }

  componentDidMount() {
    window.addEventListener('scroll', this.setVisibility);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setVisibility);
  }

  render() {
    if (this.state.show) {
      return (
        <div className="scroll-to-top">
          <a href="#">
            <span className="fas fa-angle-up scroll-to-top-icon" />
            Back to top
          </a>
        </div>
      );
    }
    return null;

  }
}

export default ScrollToTop;
