import React from 'react';
import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loading-text">Tending the Garden...</p>
    </div>
  );
};

export default Loader;