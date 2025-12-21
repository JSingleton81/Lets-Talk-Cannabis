// src/components/Input.js
import React from 'react';

const Input = ({ label, type = "text", error, ...props }) => {
  return (
    <div className="input-wrapper" style={{ marginBottom: '1rem' }}>
      {label && <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>}
      <input 
        type={type} 
        style={{ 
          width: '100%', 
          padding: '10px', 
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px'
        }} 
        {...props} 
      />
      {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
};

export default Input; // 🟢 Default export to avoid import errors