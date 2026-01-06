import React from 'react';
import { TERPENE_DATA } from '../utils/terpeneData';
import '../styles/TerpeneLegend.css';

const TerpeneLegend = ({ isOpen, onClose, selectedTerpene, onFindMatches }) => {
  if (!isOpen || !selectedTerpene) return null;

  const data = TERPENE_DATA[selectedTerpene];
  
  // Safety check in case a terpene is passed that isn't in your utility file
  if (!data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="terpene-modal" onClick={e => e.stopPropagation()}>
        {/* Dynamic color-coding based on the terpene's profile */}
        <header style={{ borderBottom: `4px solid ${data.color}` }}>
          <h2>{data.icon} {selectedTerpene}</h2>
        </header>

        <div className="modal-body">
          <p><strong>👃 Aroma:</strong> {data.aroma}</p>
          <p><strong>🧠 Effects:</strong> {data.effects}</p>
          <p><strong>🌿 Also found in:</strong> {data.foundIn}</p>
          {data.description && (
            <p className="terpene-description">{data.description}</p>
          )}
        </div>

        <div className="modal-actions">
          {/* This button triggers the MySQL filter logic we built for your Home page */}
          {onFindMatches && (
            <button 
              className="find-matches-btn" 
              onClick={() => {
                onFindMatches(selectedTerpene);
                onClose();
              }}
            >
              Find Strains with {selectedTerpene}
            </button>
          )}
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TerpeneLegend;