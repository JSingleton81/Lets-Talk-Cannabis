/**
 * Terpene Legend Data Structure
 * ==============================
 * Scientific metadata for major cannabis terpenes.
 * Used across the app for Terpene Spotlight, Legend Modal, and strain details.
 */

export const TERPENE_DATA = {
  Limonene: {
    aroma: "Citrus, Lemon, Orange",
    effects: "Uplifting, Stress Relief, Mood Boost",
    foundIn: "Citrus rinds, Rosemary, Juniper",
    color: "#FFD700", // Golden Yellow
    icon: "🍋",
    description: "The citrus powerhouse that elevates mood and reduces stress. Commonly found in lemon and orange peels."
  },
  Myrcene: {
    aroma: "Earthy, Musky, Herbal",
    effects: "Relaxing, Sedative, 'Couch-lock'",
    foundIn: "Mango, Thyme, Lemongrass",
    color: "#556B2F", // Dark Olive Green
    icon: "🥭",
    description: "The most abundant terpene in cannabis. Known for its sedative properties and earthy aroma."
  },
  Caryophyllene: {
    aroma: "Spicy, Peppery, Woody",
    effects: "Anti-inflammatory, Anxiety relief",
    foundIn: "Black pepper, Cloves, Cinnamon",
    color: "#8B4513", // Saddle Brown
    icon: "🌶️",
    description: "Unique terpene that binds to CB2 receptors. Provides anti-inflammatory benefits and spicy notes."
  },
  Pinene: {
    aroma: "Pine, Fresh, Herbal",
    effects: "Alertness, Memory retention, Bronchodilator",
    foundIn: "Pine needles, Rosemary, Basil",
    color: "#228B22", // Forest Green
    icon: "🌲",
    description: "The most common terpene in nature. Promotes alertness and helps counteract short-term memory loss."
  },
  Linalool: {
    aroma: "Floral, Lavender, Sweet",
    effects: "Calming, Anti-anxiety, Sleep aid",
    foundIn: "Lavender, Mint, Coriander",
    color: "#9370DB", // Medium Purple
    icon: "💜",
    description: "The lavender essence. Known for its calming effects and ability to reduce anxiety and promote sleep."
  },
  Humulene: {
    aroma: "Hoppy, Woody, Earthy",
    effects: "Appetite suppressant, Anti-inflammatory",
    foundIn: "Hops, Coriander, Ginseng",
    color: "#CD853F", // Peru Brown
    icon: "🍺",
    description: "Gives beer its distinctive hoppy aroma. Known to suppress appetite and provide anti-inflammatory benefits."
  },
  Terpinolene: {
    aroma: "Piney, Floral, Herbal",
    effects: "Uplifting, Antioxidant, Sedative",
    foundIn: "Nutmeg, Tea tree, Cumin",
    color: "#87CEEB", // Sky Blue
    icon: "🌸",
    description: "Complex terpene with multiple properties. Uplifting yet sedative, with strong antioxidant effects."
  },
  Ocimene: {
    aroma: "Sweet, Herbal, Woody",
    effects: "Uplifting, Anti-inflammatory, Antifungal",
    foundIn: "Mint, Parsley, Orchids",
    color: "#98FB98", // Pale Green
    icon: "🌿",
    description: "Sweet and herbal terpene. Used in perfumes and provides uplifting, anti-inflammatory properties."
  }
};

/**
 * Get terpene data by name (case-insensitive)
 */
export const getTerpeneByName = (name) => {
  if (!name) return null;
  const key = Object.keys(TERPENE_DATA).find(
    k => k.toLowerCase() === name.toLowerCase()
  );
  return key ? { name: key, ...TERPENE_DATA[key] } : null;
};

/**
 * Get all terpene names
 */
export const getAllTerpeneNames = () => Object.keys(TERPENE_DATA);

/**
 * Get color for a terpene (with fallback)
 */
export const getTerpeneColor = (name) => {
  const terpene = getTerpeneByName(name);
  return terpene ? terpene.color : "#22c55e"; // Default green
};
