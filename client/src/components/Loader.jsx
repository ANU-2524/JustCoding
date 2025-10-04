import React from 'react';
import '../Style/Loader.css';

const Loader = ({ message }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
      <p className="loader-message">{message || "Loading..."}</p>
      <p className="loader-hint">
        Please wait...
      </p>
    </div>
  );
};

export default Loader;