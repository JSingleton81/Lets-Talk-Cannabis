import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ShareStash from "../components/ShareStash";
import { useAuth } from "../hooks/useAuth";
import "../styles/AboutMe.css";

const AboutMe = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [stash, setStash] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStash, setLoadingStash] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data || {});
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch stash
  useEffect(() => {
    const fetchStash = async () => {
      if (!user) return;
      setLoadingStash(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/my-stash`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setStash(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Stash fetch error", err);
        setStash([]);
      } finally {
        setLoadingStash(false);
      }
    };
    fetchStash();
  }, [user]);

  const displayName = profile.display_name || user?.displayName || profile.email?.split("@")[0] || "Gardener";
  const memberSince = useMemo(() => {
    const created = user?.metadata?.creationTime;
    if (!created) return "—";
    const d = new Date(created);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  }, [user]);

  const terpeneProfile = useMemo(() => {
    if (!Array.isArray(stash)) return [];
    const counts = stash.reduce((acc, strain) => {
      const key = strain?.primary_terpene || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stash]);

  const TERPENE_META = {
    Myrcene: { aroma: "Earthy, Musky", effect: "Relaxing" },
    Limonene: { aroma: "Citrus, Zesty", effect: "Uplifting" },
    Caryophyllene: { aroma: "Spicy, Peppery", effect: "Balanced" },
  };

  const dominantTerpene = terpeneProfile[0]?.[0] || "—";
  const gardenLevel = useMemo(() => {
    const count = stash.length;
    if (count >= 20) return "Master Grower";
    if (count >= 10) return "Cultivator";
    if (count >= 5) return "Enthusiast";
    if (count >= 1) return "Sprout";
    return "New Seedling";
  }, [stash]);

  if (!user) return <div className="profile-page">Please sign in to view your profile.</div>;
  if (loadingProfile) return <div className="profile-page">Loading profile...</div>;

  return (
    <div className="profile-page">
      {/* Header */}
      <section className="profile-header">
        <div className="avatar-circle">
          {user.photoURL ? <img src={user.photoURL} alt="Profile" /> : displayName.charAt(0).toUpperCase()}
        </div>
        <div className="header-info">
          <h1>
            {displayName} {profile.is_verified_21 === 1 && <span className="v-badge">✓ Verified 21+</span>}
          </h1>
          <p className="member-date">Cultivating since {memberSince}</p>
          <p className="member-date">Garden Level: {gardenLevel}</p>
        </div>
        <ShareStash userUid={user.uid} />
      </section>

      <hr className="divider" />

      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="bio-card">
            <h3>About Me</h3>
            <p>{profile.bio || "Just another gardener in the community. Let's talk terpenes!"}</p>
            <p className="location-line">{[profile.city, profile.state].filter(Boolean).join(", ") || "Add your city and state"}</p>
          </div>

          <div className="taste-card">
            <div className="section-head">
              <h3>Top Terpenes</h3>
              <span className="pill">{terpeneProfile.length > 0 ? "Top 3" : "None yet"}</span>
            </div>
            {terpeneProfile.length === 0 ? (
              <p className="muted">Add favorites to see your terpene profile.</p>
            ) : (
              <div className="terpene-list">
                {terpeneProfile.slice(0, 3).map(([terp, count]) => {
                  const meta = TERPENE_META[terp] || { aroma: "—", effect: "—" };
                  const max = terpeneProfile[0]?.[1] || 1;
                  const width = Math.round((count / max) * 100);
                  return (
                    <div key={terp} className="terpene-row">
                      <div className="terpene-row-top">
                        <span className="terp-name">{terp}</span>
                        <span className="terp-count">{count}</span>
                      </div>
                      <div className="terp-bar">
                        <div className="terp-fill" style={{ width: `${width}%` }} />
                      </div>
                      <div className="terp-meta">Aroma: {meta.aroma} · Effect: {meta.effect}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="stats-row">
              <div className="stat">
                <span className="stat-label">Dominant Terpene</span>
                <span className="stat-value">{dominantTerpene}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Favorites</span>
                <span className="stat-value">{stash.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="profile-main">
          <div className="stash-card">
            <div className="section-head">
              <h3>My Stash</h3>
              <span className="pill">{stash.length} saved</span>
            </div>
            {loadingStash ? (
              <div className="muted">Loading stash...</div>
            ) : stash.length === 0 ? (
              <div className="muted">No favorites yet.</div>
            ) : (
              <div className="stash-grid">
                {stash.map((strain) => (
                  <div key={strain.id} className="stash-item">
                    <div className="stash-top">
                      <span className={`type-chip ${strain.type?.toLowerCase()}`}>{strain.type || "Unknown"}</span>
                      <span className="terp-chip">{strain.primary_terpene || "Unknown terpene"}</span>
                    </div>
                    <div className="stash-name">{strain.name}</div>
                    <div className="stash-meta">{strain.effects || "Effects not specified"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutMe;
