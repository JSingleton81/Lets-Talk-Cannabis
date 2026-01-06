import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Home.css';

const StrainExplorer = () => {
  const [strains, setStrains] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState(''); // Sativa, Indica, or Hybrid
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Trigger fetch when search, type, or page changes
  useEffect(() => {
    const fetchStrains = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/strains`, {
          params: { page, limit: 20, search, type }
        });
        setStrains(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching strains:', err);
        setStrains([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStrains();
  }, [search, type, page]);

  return (
    <div className="explorer-container">
      <div className="filter-bar">
        {/* Search Input */}
        <input 
          type="text" 
          placeholder="Search strains (e.g. OG Kush)..." 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="strain-search-input"
        />

        {/* Type Filter Buttons */}
        <div className="type-filters">
          {['Sativa', 'Indica', 'Hybrid'].map(t => (
            <button 
              key={t}
              className={`filter-btn ${type === t ? 'active' : ''} ${t.toLowerCase()}`}
              onClick={() => { setType(type === t ? '' : t); setPage(1); }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading Garden...</div>
      ) : strains.length === 0 ? (
        <div className="no-results">
          <p>No strains found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="strain-grid">
          {strains.map(strain => (
            <div key={strain.id} className="strain-card">
              <div className="strain-image-wrapper">
                <img src={strain.image_url || '/leaf-placeholder.png'} alt={strain.name} />
                <span className={`type-badge ${strain.type.toLowerCase()}`}>{strain.type}</span>
              </div>
              <div className="strain-content">
                <h3>{strain.name}</h3>
                <p className="description-preview">{strain.description?.substring(0, 100)}...</p>
                <div className="card-footer">
                  <span className="rating">⭐ {strain.rating || 'N/A'}</span>
                  <button className="learn-more-btn">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page}</span>
        <button disabled={strains.length < 20} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default StrainExplorer;
