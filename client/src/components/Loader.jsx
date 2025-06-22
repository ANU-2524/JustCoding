// components/Loader.jsx
import React from 'react';
import '../Style/Loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <p className="loader-text">Running your code...</p>
    </div>
  );
};

export default Loader;
