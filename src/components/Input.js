import React from 'react';
import '../styles/Input.css';

const Input = ({ label, type = 'text', error, id, name, ...props }) => {
  const toSlug = (str) =>
    (str || 'field')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const inputId = id || `input-${toSlug(label)}`;
  const inputName = name || toSlug(label);

  return (
    <div className="input-wrapper" style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: '5px' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        style={{
          width: '100%',
          padding: '10px',
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px'
        }}
        id={inputId}
        name={inputName}
        {...props}
      />
      {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
};

export default Input;
