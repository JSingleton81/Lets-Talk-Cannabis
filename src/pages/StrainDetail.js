import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StorageBanner from "../components/StorageBanner";
import "../styles/StrainDetail.css";

/**
 * 🌿 StrainDetail Page
 * Displays comprehensive information for a unique strain ID.
 *
 * ✅ Image rules (matches CategoryRow/PostCard)
 * - If image_url is an absolute Leafly URL -> proxy it through backend: /api/img?url=...
 * - If image_url is a local path -> render /path
 * - If image_url is missing or is a known placeholder -> fallback leaf icon
 */
const StrainDetail = () => {
  const { strainId } = useParams();
  const navigate = useNavigate();

  const [strain, setStrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState(null);

  // ✅ use the same env var convention as your other files
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const FALLBACK_IMG = "https://img.icons8.com/color/96/marijuana-leaf.png";

  useEffect(() => {
    const fetchStrainDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/strains/${strainId}`);
        setStrain(res.data);
      } catch (err) {
        console.error("Failed to load strain details:", err);
        setError("Could not retrieve strain information.");
      } finally {
        setLoading(false);
      }
    };

    if (strainId) fetchStrainDetails();
  }, [strainId]);

  // ✅ single source of truth for image URL
  const imageSrc = useMemo(() => {
    const imageUrl = strain?.image_url;

    if (!imageUrl) return FALLBACK_IMG;

    // Treat common placeholders as missing
    if (
      typeof imageUrl === "string" &&
      (imageUrl.includes("default-leaf") ||
        imageUrl.includes("/flower-images/default") ||
        imageUrl.includes("placeholder") ||
        imageUrl.includes("no-image"))
    ) {
      return FALLBACK_IMG;
    }

    // Proxy absolute URLs (Leafly/CDN)
    if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      return `${API_BASE}/api/img?url=${encodeURIComponent(imageUrl)}`;
    }

    // Local stored paths
    return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  }, [strain?.image_url, API_BASE]);

  // Helpful: confirm what StrainDetail is trying to load
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && strain?.name) {
      console.log("[StrainDetail] image_url:", strain.image_url);
      console.log("[StrainDetail] resolved src:", imageSrc);
    }
  }, [strain?.name, strain?.image_url, imageSrc]);

  const handleFavorite = async () => {
    try {
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share && strain) {
      navigator.share({
        title: strain.name,
        text: `Check out ${strain.name} on Let's Talk Cannabis!`,
        url: window.location.href,
      });
    } else {
      alert("Sharing is not supported on this device.");
    }
  };

  if (loading) return <div className="strain-detail-loading">Loading HD Details...</div>;
  if (error) return <div className="strain-detail-error">{error}</div>;
  if (!strain) return <div className="strain-detail-notfound">Strain profile not found.</div>;

  return (
    <div className="strain-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="strain-detail-layout">
        <div className="strain-detail-main">
          {/* --- HERO SECTION --- */}
          <div className="strain-hero">
            <img
              src={imageSrc}
              alt={strain.name}
              className="strain-detail-image"
              onError={(e) => {
                // 🛡️ Only fallback if the image truly fails to load
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />

            <div className="strain-header-overlay">
              <h1 className="strain-name">{strain.name}</h1>
              <span className={`strain-type-badge ${strain.type?.toLowerCase()}`}>
                {strain.type}
              </span>
            </div>
          </div>

          {/* --- DESCRIPTION & TERPENES --- */}
          <div className="strain-section description-section">
            <h2>About This Strain</h2>
            <p>{strain.description || "No description provided."}</p>
          </div>

          <div className="strain-section terpene-section">
            <h2>🧬 Primary Terpene: {strain.primary_terpene || "Natural"}</h2>
            <div className="terpene-educational-note">
              <p>
                Strains dominant in <strong>{strain.primary_terpene}</strong> are often sought for their{" "}
                {strain.primary_terpene === "Myrcene"
                  ? " relaxing and sedative effects."
                  : " unique aromatic properties."}
              </p>
            </div>
          </div>

          {/* --- DATA SUMMARY --- */}
          <div className="strain-section stats-section">
            <div className="stat-card">
              <h3>THC</h3>
              <p>{strain.thc_content || "Varies"}</p>
            </div>
            <div className="stat-card">
              <h3>Rating</h3>
              <p>⭐ {Number(strain.rating || 0).toFixed(1)}/5.0</p>
            </div>
          </div>

          <div className="action-row">
            <button
              className={`action-btn favorite-btn ${isFavorited ? "favorited" : ""}`}
              onClick={handleFavorite}
            >
              {isFavorited ? "❤️ Saved" : "🤍 Save Strain"}
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              📤 Share Profile
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="strain-detail-sidebar">
          <StorageBanner
            layout="sidebar"
            strainType={strain.type?.toLowerCase()}
            dominantTerpene={strain.primary_terpene}
          />
        </aside>
      </div>
    </div>
  );
};

export default StrainDetail;
