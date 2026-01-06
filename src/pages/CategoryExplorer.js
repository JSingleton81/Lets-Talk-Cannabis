import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CategoryExplorer.css';

const CategoryExplorer = () => {
  const { type } = useParams(); // Grabs 'sativa', 'indica', etc. from URL
  const [strains, setStrains] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullCategory = async () => {
      try {
        // Connects to your backend filter route built previously
        const res = await axios.get(`/api/strains/filter?type=${type}`);
        setStrains(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Explorer Load Error:", err);
        setStrains([]);
      }
    };
    fetchFullCategory();
  }, [type]);

  return (
    <div className="explorer-page">
      <div className="explorer-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back to Garden</button>
        <h1>All {type.charAt(0).toUpperCase() + type.slice(1)} Strains</h1>
      </div>

      <div className="explorer-grid">
        {strains.map(strain => (
          <div key={strain.id} className="explorer-card">
            <img src={strain.image_url} alt={strain.name} />
            <div className="explorer-card-info">
              <h3>{strain.name}</h3>
              <p>🧬 {strain.primary_terpene}</p>
              <div className="rating">⭐ {strain.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryExplorer;
