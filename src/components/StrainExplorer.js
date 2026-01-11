import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css";

/**
 * StrainExplorer
 * ============================================================
 * ✅ Uses image proxy for external Leafly URLs:
 *    /api/img?url=https://images.leafly.com/...
 *
 * ✅ Prevents fallback from "taking over" unless the image truly fails.
 *
 * IMPORTANT:
 * - Make sure your backend is running on :5000
 * - And your frontend proxy is set (package.json "proxy": "http://localhost:5000")
 *   so `/api/...` goes to the backend.
 */

const FALLBACK_IMG = "https://img.icons8.com/color/96/marijuana-leaf.png";

const StrainExplorer = () => {
  const [strains, setStrains] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState(""); // Sativa, Indica, or Hybrid
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // If you use CRA proxy, API_BASE can be "" and axios hits /api/... correctly.
  // If you ever deploy with separate frontend/backend, set REACT_APP_API_BASE.
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  /**
   * Build image src consistently across the app:
   * - Leafly/external: proxy it through backend
   * - Local path: render as /path
   * - Missing: fallback leaf
   */
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return FALLBACK_IMG;

    const url = String(imageUrl);

    // If it’s a real external URL (Leafly), use proxy
    if (url.startsWith("http")) {
      return `${API_BASE}/api/img?url=${encodeURIComponent(url)}`;
    }

    // Otherwise treat as local path stored in DB
    return url.startsWith("/") ? url : `/${url}`;
  };

  useEffect(() => {
    const fetchStrains = async () => {
      setLoading(true);
      try {
        // ✅ Use your existing API pattern, but keep it consistent
        // If you are using CRA proxy, prefer "/api/strains" (no host needed).
        const response = await axios.get(`${API_BASE}/api/strains`, {
          params: { page, limit: 20, search, type },
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        setStrains(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Error fetching strains:", err);
        setStrains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStrains();
  }, [API_BASE, search, type, page]);

  return (
    <div className="explorer-container">
      <div className="filter-bar">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search strains (e.g. OG Kush)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="strain-search-input"
        />

        {/* Type Filter Buttons */}
        <div className="type-filters">
          {["Sativa", "Indica", "Hybrid"].map((t) => (
            <button
              key={t}
              className={`filter-btn ${type === t ? "active" : ""} ${t.toLowerCase()}`}
              onClick={() => {
                setType(type === t ? "" : t);
                setPage(1);
              }}
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
          {strains.map((strain) => (
            <div key={strain.id} className="strain-card">
              <div className="strain-image-wrapper">
                <img
                  src={getImageSrc(strain.image_url)}
                  alt={strain.name}
                  loading="lazy"
                  onError={(e) => {
                    // ✅ Only fallback when the final requested image fails
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />

                {/* Guard against missing type */}
                <span className={`type-badge ${(strain.type || "Hybrid").toLowerCase()}`}>
                  {strain.type || "Hybrid"}
                </span>
              </div>

              <div className="strain-content">
                <h3>{strain.name}</h3>
                <p className="description-preview">
                  {strain.description ? `${strain.description.substring(0, 100)}...` : "No description yet."}
                </p>
                <div className="card-footer">
                  <span className="rating">⭐ {strain.rating || "N/A"}</span>
                  <button className="learn-more-btn">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button disabled={strains.length < 20} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default StrainExplorer;
