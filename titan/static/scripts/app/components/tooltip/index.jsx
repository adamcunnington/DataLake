import React from 'react';
import './index.css';

function Tooltip(props) {

  const top = props.offsetY || 0,
    left = props.offsetX || 0;

  return (
    <div className="tooltip" style={{ top: top, left: left }}>
      {props.children}
    </div>
  );
}

export default Tooltip;
