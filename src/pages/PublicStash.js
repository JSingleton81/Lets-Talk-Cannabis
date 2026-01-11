import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';
import StashFooter from '../components/StashFooter';

const TERPENE_META = {
  Myrcene: { effect: 'relaxing', note: 'earthy/musky' },
  Limonene: { effect: 'uplifting', note: 'citrusy' },
  Caryophyllene: { effect: 'balanced', note: 'spicy/peppery' },
};

const PublicStash = () => {
  const { uid } = useParams();
  const [stash, setStash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const dominantTerpene = useMemo(() => {
    const counts = {};
    stash.forEach((strain) => {
      const terp = strain.primary_terpene || 'Unknown';
      counts[terp] = (counts[terp] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || 'Unknown';
  }, [stash]);

  useEffect(() => {
    const fetchPublicStash = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/share/${uid}`);
        const data = res.data;
        const normalized = Array.isArray(data) ? data : [];
        setStash(normalized);
        setError(normalized.length === 0);
      } catch (err) {
        console.error('Error loading stash', err);
        setStash([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicStash();
  }, [uid]);

  if (loading) return <div className="loader">Loading Garden...</div>;
  if (error) {
    return (
      <div className="public-stash-container">
        <header className="stash-header">
          <h1>🌿 Member Stash</h1>
          <p>Explore this gardener's top-rated strains.</p>
        </header>
        <div className="stash-empty-message">
          <p>Stash not found or is empty.</p>
          <Link className="join-cta" to="/signup">Join the Community</Link>
        </div>
        <StashFooter />
      </div>
    );
  }

  return (
    <div className="public-stash-container">
      <header className="stash-header">
        <h1>🌿 Member Stash</h1>
        <p>Explore this gardener's top-rated strains.</p>
      </header>

      {stash.length > 0 && (
        <div className="stash-summary">
          {(() => {
            const meta = TERPENE_META[dominantTerpene] || { effect: 'unique', note: 'distinctive' };
            return (
              <p>
                This member gravitates toward strains high in <strong>{dominantTerpene}</strong>,
                often associated with <strong>{meta.effect}</strong> vibes and <strong>{meta.note}</strong> notes.
              </p>
            );
          })()}
        </div>
      )}

      <div className="strains-grid">
        {stash.map((strain, index) => (
          <div key={index} className="strain-card">
            <div className="strain-image-wrapper">
              <img
                src={
                  strain.image_url
                    ? (strain.image_url.startsWith('http')
                        ? strain.image_url
                        : `/${strain.image_url}`)
                    : "https://img.icons8.com/color/96/marijuana-leaf.png"
                }
                alt={strain.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://img.icons8.com/color/96/marijuana-leaf.png";
                }}
              />
              <span className={`type-badge ${strain.type?.toLowerCase()}`}>{strain.type}</span>
            </div>
            <div className="strain-info">
              <h3>{strain.name}</h3>
              <p className="terpene">🧬 Primary Terpene: {strain.primary_terpene || 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>

      <StashFooter />
    </div>
  );
};

export default PublicStash;
