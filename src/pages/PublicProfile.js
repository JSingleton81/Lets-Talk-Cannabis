import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Your existing auth hook
import axios from 'axios';
import '../styles/PublicProfile.css';

const TERPENE_META = {
  Myrcene: { aroma: 'Earthy, Musky', effect: 'Relaxing, Sedative' },
  Limonene: { aroma: 'Citrus, Zesty', effect: 'Uplifting, Mood Boost' },
  Caryophyllene: { aroma: 'Spicy, Peppery', effect: 'Anti-inflammatory, Balanced' },
};

const PublicProfile = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [stash, setStash] = useState([]);
  const [stashLoading, setStashLoading] = useState(false);

  // Check if the page being viewed is the current user's own profile
  const isOwnProfile = user?.uid === uid;

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile/${uid}`);
        setMember(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchMember();
  }, [uid]);

  // Fetch public stash for this user (if endpoint exists)
  useEffect(() => {
    const fetchStash = async () => {
      try {
        setStashLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/stash/${uid}`);
        setStash(res.data || []);
      } catch (err) {
        console.error("Error loading stash:", err);
      } finally {
        setStashLoading(false);
      }
    };
    fetchStash();
  }, [uid]);

  // Compute terpene profile
  const terpeneProfile = useMemo(() => {
    const counts = {};
    stash.forEach((strain) => {
      const terp = strain.primary_terpene || 'Unknown';
      counts[terp] = (counts[terp] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stash]);

  if (!member) return <div className="spinner">Loading Member...</div>;

  return (
    <div className="public-profile-card">
      <div className="profile-header">
        {/* If it's the user's own profile, show a badge or edit option */}
        {isOwnProfile && <span className="own-profile-tag">This is You</span>}
        
        <div className="avatar-container">
          <img src={member.profile_photo_url || '/default-avatar.png'} alt="Member" />
        </div>
        
        <h2>{member.username || 'Anonymous Gardener'}</h2>
        {member.is_verified_21 && <span className="verified-seal">🌿 Verified 21+</span>}
      </div>

      <div className="profile-body">
        <section className="about-section">
          <h3>About Me</h3>
          <p>{member.bio || "No bio shared yet."}</p>
        </section>

        <section className="location-info">
          <p>📍 {member.city}, {member.state}</p>
          <p>📅 Joined: {new Date(member.created_at).toLocaleDateString()}</p>
        </section>

        {/* Public stash preview */}
        <section className="stash-section">
          <h3>🌿 Public Stash</h3>
          {stashLoading ? (
            <div className="loader">Loading stash...</div>
          ) : stash.length === 0 ? (
            <p className="stash-empty">No public favorites yet.</p>
          ) : (
            <div className="stash-grid">
              {stash.map((strain) => (
                <div key={strain.id} className="mini-strain-card">
                  <span className={`dot ${strain.type?.toLowerCase()}`}></span>
                  <strong>{strain.name}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Taste profile from stash */}
        {stash.length > 0 && (
          <section className="terpene-profile">
            <h3>🧬 Taste Profile</h3>
            <div className="terpene-list">
              {terpeneProfile.map(([terpene, count]) => {
                const max = terpeneProfile[0]?.[1] || 1;
                const width = Math.round((count / max) * 100);
                return (
                  <div key={terpene} className="terpene-row">
                    <span className="terpene-name">{terpene}</span>
                    <div className="terpene-bar">
                      <div className="terpene-fill" style={{ width: `${width}%` }} />
                    </div>
                    <span className="terpene-count">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="terpene-toplist">
              <h4>Top 3 Terpenes</h4>
              {terpeneProfile.slice(0, 3).map(([terpene, count]) => {
                const meta = TERPENE_META[terpene] || { aroma: 'Unknown', effect: 'Unknown' };
                return (
                  <div key={terpene} className="terpene-top-item">
                    <div className="terpene-top-name">{terpene} <span className="terpene-top-count">({count})</span></div>
                    <div className="terpene-top-meta">Aroma: {meta.aroma} · Typical Effect: {meta.effect}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- NEW: Actions for the Member's own view --- */}
        {isOwnProfile && (
          <div className="member-actions">
            <button onClick={() => navigate('/settings/profile')} className="edit-btn">
              Edit My About Me
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
