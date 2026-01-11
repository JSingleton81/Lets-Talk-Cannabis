import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CategoryRow.css";
import TerpeneLegend from "./TerpeneLegend";

/**
 * CategoryRow
 * - Shows a horizontal row of strain cards
 * - Images:
 *   - REAL Leafly URLs -> go through backend proxy: /api/img?url=...
 *   - Local paths -> /path
 *   - Missing/placeholder -> fallback icon (ONLY when truly missing/placeholder)
 *
 * IMPORTANT:
 * - Do NOT add cache-busters to Leafly URLs unless we confirm Leafly requires it.
 * - Fallback should only happen when:
 *    (A) image_url is missing/placeholder, OR
 *    (B) the image request fails (onError)
 */

const FALLBACK_IMG = "https://img.icons8.com/color/96/marijuana-leaf.png";

// ✅ Only treat these as placeholders (do NOT match generic "leaf")
const isPlaceholderImage = (url) => {
  if (!url || typeof url !== "string") return true;

  const u = url.toLowerCase();
  return (
    u.includes("default-leaf") ||
    u.includes("/flower-images/default") ||
    u.includes("placeholder") ||
    u.includes("no-image")
  );
};

const CategoryRow = ({ title, strains = [], onFindMatches }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTerpene, setSelectedTerpene] = useState(null);

  /**
   * ✅ API_BASE
   * - In local dev, set REACT_APP_API_BASE=http://localhost:5000
   * - On GitHub Pages, you typically also set it to your deployed backend URL
   * - If it's empty, it will try same-origin (not what you want on GH pages)
   */
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const categoryType = useMemo(() => {
    const lastWord = (title || "").trim().split(/\s+/).pop()?.toLowerCase();
    if (lastWord === "sativas" || lastWord === "sativa") return "Sativa";
    if (lastWord === "indicas" || lastWord === "indica") return "Indica";
    if (lastWord === "hybrids" || lastWord === "hybrid") return "Hybrid";
    return "Hybrid";
  }, [title]);

  // Dev log once
  const didLogRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (didLogRef.current) return;
    didLogRef.current = true;

    console.log(
      `[CategoryRow] ${title}: ${strains.length} strains (type=${categoryType})`
    );
  }, [title, strains.length, categoryType]);

  const handleViewAll = () => navigate(`/category/${categoryType}`);

  const handleTerpeneClick = (terpene) => {
    const t = (terpene || "").trim();
    if (t && t !== "Unknown Terpene") {
      setSelectedTerpene(t);
      setModalOpen(true);
    }
  };

  const formatRating = (rating) => {
    const n = Number(rating);
    if (!Number.isFinite(n) || n <= 0) return "N/A";
    return n.toFixed(1);
  };

  /**
   * ✅ Image resolver (single source of truth)
   * - placeholder/missing => fallback
   * - http(s) => backend proxy (NO cache-buster)
   * - local path => normalized
   */
  const getImageSrc = (imageUrl) => {
    if (isPlaceholderImage(imageUrl)) return FALLBACK_IMG;

    if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      return `${API_BASE}/api/img?url=${encodeURIComponent(imageUrl)}`;
    }

    return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  };

  return (
    <div className="category-section">
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        <button className="view-all-btn" onClick={handleViewAll}>
          View All
        </button>
      </div>

      <div className="horizontal-scroll-container">
        {strains.map((strain) => (
          <div
            key={strain.id}
            className="strain-card-mini"
            onClick={() => navigate(`/strain/${strain.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="strain-image-wrapper">
              <img
                src={getImageSrc(strain.image_url)}
                alt={strain.name}
                className="strain-card-img"
                onError={(e) => {
                  // ✅ Fallback ONLY when the request actually fails
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />

              <span className={`type-tag ${strain.type?.toLowerCase()}`}>
                {strain.type}
              </span>
            </div>

            <div className="strain-card-details">
              <h4>{strain.name}</h4>

              <p
                className="terpene-detail-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTerpeneClick(strain.primary_terpene);
                }}
                style={{
                  cursor: strain.primary_terpene ? "pointer" : "default",
                }}
              >
                {strain.primary_terpene || "Unknown Terpene"}
              </p>

              <div className="rating-pill">⭐ {formatRating(strain.rating)}</div>
            </div>
          </div>
        ))}
      </div>

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
