import React from 'react';

const OpenNiceties = ({ open, onClick }) => (
  <div>
    <button
      onClick={onClick}
    >
      { open === true
          ? "Close Niceties"
          : "Open Niceties"
      }
    </button>
  </div>
);

export default OpenNiceties;
