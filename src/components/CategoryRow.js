import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CategoryRow.css';
import TerpeneLegend from './TerpeneLegend';

const CategoryRow = ({ title, strains, onFindMatches }) => {
    const navigate = useNavigate();

    const handleViewAll = () => {
      // Navigate to the explorer page for the specific category
      navigate(`/category/${title.split(' ').pop().toLowerCase()}`);
    };
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTerpene, setSelectedTerpene] = useState(null);

  /**
   * 🧬 handleTerpeneClick:
   * Triggers the educational modal and connects to the MySQL matching logic.
   * Prevents interaction if the terpene data is missing.
   */
  const handleTerpeneClick = (terpene) => {
    if (terpene && terpene !== 'Unknown Terpene') {
      setSelectedTerpene(terpene);
      setModalOpen(true);
      // We don't automatically trigger onFindMatches here so the user can 
      // read the legend first, then click "Find Strains" inside the modal.
    }
  };

  return (
    <div className="category-section">
      {/* 🏷️ Row Header: Includes the 'View All' link from your screenshot */}
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        <button className="view-all-btn" onClick={handleViewAll}>View All</button>
      </div>
      
      {/* ↔️ Horizontal Scroll: Matches the sliding carousel behavior */}
      <div className="horizontal-scroll-container">
        {strains && strains.map((strain) => (
          <div key={strain.id} className="strain-card-mini">
            <div className="strain-image-wrapper">
              <img 
                src={strain.image_url || '/assets/default-leaf.png'} 
                alt={strain.name} 
                className="strain-card-img"
              />
              {/* Type Badge: Color-coded via CSS (Sativa/Indica/Hybrid) */}
              <span className={`type-tag ${strain.type?.toLowerCase()}`}>
                {strain.type}
              </span>
            </div>
            
            <div className="strain-card-details">
              <h4>{strain.name}</h4>
              
              {/* Interactive Terpene Tag: Connects to the Legend Modal */}
              <p 
                className="terpene-detail-pill"
                onClick={() => handleTerpeneClick(strain.primary_terpene)}
                style={{ cursor: strain.primary_terpene ? 'pointer' : 'default' }}
              >
                {strain.primary_terpene || 'Unknown Terpene'}
              </p>
              
              <div className="rating-pill">⭐ {strain.rating || 'N/A'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 🛡️ Terpene Legend: The educational bridge between data and user */}
      <TerpeneLegend 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        selectedTerpene={selectedTerpene}
        onFindMatches={onFindMatches}
      />
    </div>
  );
};

export default CategoryRow;