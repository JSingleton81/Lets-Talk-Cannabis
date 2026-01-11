import React, { useMemo, useState } from "react";
import "../styles/PostCard.css";

/**
 * PostCard
 * ==========================================================
 * Works for BOTH:
 *  1) Strain cards (CategoryExplorer / CategoryRow / Strain pages)
 *  2) Feed posts (community posts)
 *
 * IMAGE RULES (VERY IMPORTANT)
 * ----------------------------------------------------------
 * STRAIN PAGES (isStrainView=true)
 *  ✅ Always render an image block
 *  ✅ If DB image is missing/placeholder/broken → show FALLBACK leaf
 *
 * FEED POSTS (isStrainView=false)
 *  ✅ Only render image block if a strain is tagged AND has a REAL image
 *  ✅ Never show fallback leaf on the feed (prevents “green leaf takeover”)
 */

const FALLBACK_IMG = "https://img.icons8.com/color/96/marijuana-leaf.png";

/**
 * Placeholder detector
 * - If the image_url contains these patterns, we treat it as NOT a real image.
 * - DO NOT use generic "leaf" matching because it will nuke valid Leafly URLs.
 */
const isPlaceholderImage = (url) => {
  if (!url || typeof url !== "string") return true;
  const u = url.toLowerCase();

  return (
    u.includes("default-leaf") ||
    u.includes("/flower-images/default") ||
    u.includes("placeholder") ||
    u.includes("no-image") ||
    // treat icons8 fallback as placeholder too
    u.includes("img.icons8.com") ||
    u.includes("marijuana-leaf")
  );
};

const PostCard = ({ post, isStrainView = false, onFavorite }) => {
  // ✅ Use whichever env var exists, default to localhost:5000
  const API_BASE =
    (process.env.REACT_APP_API_BASE ||
      process.env.REACT_APP_API_URL ||
      "http://localhost:5000").replace(/\/+$/, "");

  // 🕒 Safe date display (prevents "Invalid Date")
  const dateObj = post?.created_at ? new Date(post.created_at) : null;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());
  const formattedDate = isValidDate ? dateObj.toLocaleDateString() : "";

  // ⭐ Top pick only makes sense for strain cards
  const isTopPick = isStrainView && Number(post?.rating) >= 5;

  /**
   * ✅ Choose the correct image source depending on context:
   * - Strain cards use: post.image_url
   * - Feed posts use:  post.strain_image_url  (from JOIN in backend)
   */
  const rawImageUrl = useMemo(() => {
    if (isStrainView) return post?.image_url || "";
    return post?.strain_image_url || "";
  }, [isStrainView, post?.image_url, post?.strain_image_url]);

  /**
   * ✅ Determine whether we render the image section at all.
   * - Strains: ALWAYS render (fallback allowed)
   * - Feed: only render if it’s a real image (no fallback)
   */
  const shouldRenderImage = useMemo(() => {
    if (isStrainView) return true; // always show image block on strains
    if (!rawImageUrl) return false; // no tagged strain image
    if (isPlaceholderImage(rawImageUrl)) return false; // fake/placeholder
    return true;
  }, [isStrainView, rawImageUrl]);

  /**
   * ✅ Resolve image URL:
   * - Leafly absolute URL -> proxy through backend /api/img?url=...
   * - Local path -> normalize to /path
   */
  const resolvedImageSrc = useMemo(() => {
    if (!rawImageUrl) return "";

    if (rawImageUrl.startsWith("http")) {
      return `${API_BASE}/api/img?url=${encodeURIComponent(rawImageUrl)}`;
    }

    return rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
  }, [rawImageUrl, API_BASE]);

  /**
   * ✅ Feed only: if the image fails, we hide the entire image block
   * ✅ Strain view: if it fails, fallback leaf
   *
   * We do this with state so React re-renders cleanly.
   */
  const [hideImage, setHideImage] = useState(false);

  // Card title
  const titleText = isStrainView
    ? post?.name
    : post?.username || "Community Member";

  return (
    <div className={`post-card ${isTopPick ? "top-pick-border" : ""}`}>
      {isTopPick && (
        <div className="top-pick-badge">
          <span>⭐ TOP PICK</span>
        </div>
      )}

      {/* Header */}
      <div className="post-header">
        <span className="post-username">{titleText}</span>
        {isValidDate && <span className="post-timestamp">{formattedDate}</span>}
      </div>

      {/* Image (only if allowed, and not hidden due to error) */}
      {shouldRenderImage && !hideImage && (
        <div className="post-image-wrapper">
          <img
            src={resolvedImageSrc}
            className="post-main-img"
            alt={post?.name || post?.strain_name || "Cannabis"}
            onError={(e) => {
              e.currentTarget.onerror = null;

              // ✅ Strain cards: fallback allowed
              if (isStrainView) {
                e.currentTarget.src = FALLBACK_IMG;
                return;
              }

              // ✅ Feed posts: never show fallback leaf
              // Hide the whole image block instead
              setHideImage(true);
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="post-content">
        <p className="type-text">
          {isStrainView ? `Type: ${post?.type || "Hybrid"}` : post?.content}
        </p>

        {/* Strain meta only on strain cards */}
        {isStrainView && (
          <div className="strain-meta">
            <p>
              🧬 Terpene: <strong>{post?.primary_terpene || "Natural"}</strong>
            </p>
            {post?.rating && (
              <p className="rating-pill">
                ⭐ {Number(post.rating).toFixed(1)}/5.0
              </p>
            )}
          </div>
        )}

        {/* Feed: show tagged strain info if present */}
        {!isStrainView && post?.strain_name && (
          <div className="strain-meta" style={{ marginTop: 10 }}>
            <p>
              🌿 Tagged: <strong>{post.strain_name}</strong>
              {post?.strain_type ? ` (${post.strain_type})` : ""}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="post-footer">
        <button
          className="footer-action-btn"
          onClick={() => onFavorite && onFavorite(post?.id)}
        >
          ❤️ {post?.likes_count || 0}
        </button>

        {post?.is_verified_21 && (
          <div className="verified-badge" title="Verified 21+">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
