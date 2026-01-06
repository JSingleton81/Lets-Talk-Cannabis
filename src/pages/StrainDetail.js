import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StorageBanner from '../components/StorageBanner';
import '../styles/StrainDetail.css';

/**
 * StrainDetail Page Component
 * ============================
 * Displays comprehensive information about a single strain including:
 * - High-res image, name, and type badge
 * - Detailed description and terpene profile
 * - Effects and flavor notes
 * - Recommended storage (via StorageBanner sidebar)
 * - Favorite and Share actions
 */
const StrainDetail = () => {
  const { strainId } = useParams();
  const navigate = useNavigate();
  const [strain, setStrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch strain by ID
    // const fetchStrain = async () => {
    //   try {
    //     const res = await fetch(`/api/strains/${strainId}`);
    //     const data = await res.json();
    //     setStrain(data);
    //   } catch (err) {
    //     setError('Failed to load strain details');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchStrain();

    // Mock data for demonstration
    const mockStrain = {
      id: strainId,
      name: 'OG Kush',
      type: 'Hybrid',
      description: 'OG Kush is a legendary strain known for its pungent aroma and powerful effects. With roots in California, this hybrid combines the best of both worlds.',
      image_url: '/strain-og-kush.jpg',
      primary_terpene: 'Myrcene',
      terpene_profile: {
        myrcene: 'Earthy, herbal notes with musky undertones',
        limonene: 'Subtle citrus hints for balance',
        pinene: 'Fresh, piney character',
      },
      effects: ['Relaxed', 'Happy', 'Euphoric'],
      flavor_notes: ['Pine', 'Earthy', 'Spicy'],
      thc_content: '20-25%',
      cbd_content: '<1%',
    };

    setStrain(mockStrain);
    setLoading(false);
  }, [strainId]);

  const handleFavorite = async () => {
    try {
      // TODO: Replace with actual API call
      // const res = await fetch('/api/favorites/toggle', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ strain_id: strainId }),
      // });
      // const data = await res.json();
      // setIsFavorited(data.isFavorite);

      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share && strain) {
      navigator.share({
        title: strain.name,
        text: `Check out this strain: ${strain.name}`,
        url: window.location.href,
      });
    } else {
      alert('Sharing is not supported on this device.');
    }
  };

  if (loading) return <div className="strain-detail-loading">Loading strain details...</div>;
  if (error) return <div className="strain-detail-error">{error}</div>;
  if (!strain) return <div className="strain-detail-notfound">Strain not found</div>;

  return (
    <div className="strain-detail-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="strain-detail-layout">
        {/* MAIN CONTENT COLUMN */}
        <div className="strain-detail-main">
          {/* Strain Image and Header */}
          <div className="strain-hero">
            <img
              src={strain.image_url || '/default-strain.jpg'}
              alt={strain.name}
              className="strain-detail-image"
            />
            <div className="strain-header-overlay">
              <h1 className="strain-name">{strain.name}</h1>
              <span className={`strain-type-badge ${strain.type.toLowerCase()}`}>
                {strain.type}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="strain-section description-section">
            <h2>About This Strain</h2>
            <p>{strain.description}</p>
          </div>

          {/* Terpene Profile Chart */}
          <div className="strain-section terpene-section">
            <h2>🧬 Terpene Profile</h2>
            <div className="terpene-chart">
              {Object.entries(strain.terpene_profile || {}).map(([terpene, profile]) => (
                <div key={terpene} className="terpene-item">
                  <div className="terpene-name">{terpene.charAt(0).toUpperCase() + terpene.slice(1)}</div>
                  <div className="terpene-bar">
                    <div
                      className="terpene-fill"
                      style={{
                        width: `${Math.random() * 60 + 40}%`,
                        backgroundColor: getTerpeneColor(terpene),
                      }}
                    ></div>
                  </div>
                  <p className="terpene-notes">{profile}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Effects and Flavor */}
          <div className="strain-section effects-flavor-section">
            <div className="effects-column">
              <h3>✨ Effects</h3>
              <div className="tags-list">
                {(strain.effects || []).map((effect, idx) => (
                  <span key={idx} className="tag-effect">
                    {effect}
                  </span>
                ))}
              </div>
            </div>
            <div className="flavor-column">
              <h3>🍋 Flavor Notes</h3>
              <div className="tags-list">
                {(strain.flavor_notes || []).map((flavor, idx) => (
                  <span key={idx} className="tag-flavor">
                    {flavor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Cannabinoid Content */}
          <div className="strain-section cannabinoid-section">
            <h2>📊 Cannabinoid Content</h2>
            <div className="cannabinoid-row">
              <div className="cannabinoid-item">
                <span className="cbd-label">THC</span>
                <span className="cbd-value">{strain.thc_content}</span>
              </div>
              <div className="cannabinoid-item">
                <span className="cbd-label">CBD</span>
                <span className="cbd-value">{strain.cbd_content}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-row">
            <button
              className={`action-btn favorite-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavorite}
            >
              {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              📤 Share
            </button>
          </div>
        </div>

        {/* SIDEBAR COLUMN (Storage Recommendations) */}
        <aside className="strain-detail-sidebar">
          <StorageBanner
            layout="sidebar"
            strainType={strain.type.toLowerCase()}
            dominantTerpene={strain.primary_terpene}
          />
        </aside>
      </div>
    </div>
  );
};

// Helper function to get terpene bar colors
const getTerpeneColor = (terpene) => {
  const colors = {
    myrcene: '#8B4513',    // Brown
    limonene: '#FFD700',   // Gold
    pinene: '#228B22',     // Forest Green
    linalool: '#DDA0DD',   // Plum
    humulene: '#8B7355',   // Tan
    caryophyllene: '#DC143C', // Crimson
  };
  return colors[terpene.toLowerCase()] || '#2a5c2a';
};

export default StrainDetail;
