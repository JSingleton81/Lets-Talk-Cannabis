# Storage Guide Integration Guide

## Overview
This document outlines the integration of the Storage Guide component across the Let's Talk Cannabis platform. The Storage Guide educates users about proper cannabis preservation through a reusable `StorageBanner` component that appears on both the Home Page and Individual Strain Pages.

## Components Created

### 1. **StorageBanner.js** (`src/components/StorageBanner.js`)
A reusable, responsive React component that provides storage guidance and product recommendations.

**Key Features:**
- Two layout modes: `full` (Home Page) and `sidebar` (Strain Detail)
- Intelligent terpene-to-gear mapping function
- Responsive design (desktop, tablet, mobile)
- Exports `getTerpeneRecommendation()` for external use

**Props:**
```javascript
{
  layout: 'full' | 'sidebar',        // Default: 'full'
  strainType: 'Sativa' | 'Indica' | 'Hybrid',  // Optional, for sidebar mode
  dominantTerpene: string            // Optional, for personalized recommendations
}
```

**Terpene Recommendations:**
- **Limonene** → UV Glass Jars (protects from light)
- **Myrcene** → Vacuum Storage (preserves flavor)
- **Pinene** → Humidity Control (maintains freshness)
- **Linalool** → Cool & Dark Storage (retains effects)
- **Humulene** → Airtight Containers (prevents oxidation)

### 2. **StorageBanner.css** (`src/styles/StorageBanner.css`)
Professional styling for both layout modes with:
- Gradient backgrounds and hover effects
- Responsive grid layout (full mode)
- Mobile breakpoints at 768px and 480px
- Color-coded product cards (air/humidity/light control)

### 3. **StrainDetail.js** (`src/pages/StrainDetail.js`)
Individual strain page showing:
- Large hero image with name and type badge
- Detailed description
- Terpene profile chart with color-coded bars
- Effects and flavor tags
- Cannabinoid content (THC/CBD %)
- Favorite toggle and Share button
- **Integrated StorageBanner sidebar** with strain-specific recommendations

**Route:** `/strain/:strainId`

**Props to StorageBanner:**
```javascript
<StorageBanner 
  layout="sidebar" 
  strainType={strain.type}
  dominantTerpene={strain.primary_terpene}
/>
```

### 4. **StrainDetail.css** (`src/styles/StrainDetail.css`)
Comprehensive styling including:
- Hero section with overlay
- Type badges with colors
- Terpene chart visualization
- Effects/flavor tags
- Action buttons (favorite/share)
- Responsive grid layout for layout shift at breakpoints
- Mobile-first responsive design

## Page Integration

### Home Page (`src/pages/Home.js`)
**Integration Point:** After hero section, before category browsing

```javascript
<section className="hero">
  <h1>🌿 Welcome to the Community</h1>
  <p>Discover, preserve, and share your favorite strains.</p>
</section>

{/* Full-width Storage Guide */}
<div className="home-content-wrapper">
  <StorageBanner layout="full" />
</div>
```

**Benefits:**
- Educates new users about preservation before strain discovery
- Increases engagement through interactive product recommendations
- Provides value-add content that's not available elsewhere

### Strain Detail Page
**Route:** `/strain/:strainId`

**Layout:**
```
[Back Button]
┌─────────────────────────────────┬──────────────┐
│                                 │              │
│  Hero Image with Name/Badge     │  Storage     │
│                                 │  Banner      │
├─────────────────────────────────┤  (Sidebar)   │
│                                 │              │
│  Description Section            │              │
│  - Full text                    │              │
│                                 │              │
├─────────────────────────────────┤              │
│                                 │              │
│  Terpene Profile Section        │              │
│  - Chart with colors            │              │
│  - Description                  │              │
│                                 │              │
├─────────────────────────────────┤              │
│                                 │              │
│  Effects & Flavor Tags          │              │
│  - Effects (green)              │              │
│  - Flavors (golden)             │              │
│                                 │              │
├─────────────────────────────────┤              │
│                                 │              │
│  Cannabinoid Content            │              │
│  - THC %                        │              │
│  - CBD %                        │              │
│                                 │              │
├─────────────────────────────────┤              │
│                                 │              │
│  Actions (Favorite/Share)       │              │
│                                 │              │
└─────────────────────────────────┴──────────────┘
```

**Responsive Behavior:**
- **Desktop (1024px+):** Two-column layout (main + sidebar)
- **Tablet (768px-1024px):** Single column, sidebar moves above main
- **Mobile (< 768px):** Full-width stacked layout

## Routing Configuration

**App.js** has been updated with the new route:

```javascript
<Route path="/strain/:strainId" element={<StrainDetail />} />
```

## Navigation Flow

### From Home Page
1. User views StorageBanner on Home Page
2. (Future) User discovers strains via StrainExplorer
3. User clicks "View Details" on a strain card
4. Navigates to `/strain/{strainId}`

### From Search Results
1. User searches for a specific strain
2. Results displayed in StrainExplorer
3. Click "View Details" → `/strain/{strainId}`
4. StorageBanner sidebar provides personalized recommendations based on terpene profile

## API Integration

### Current State (Mock Data)
Both StrainDetail.js pages use mock data for development:

```javascript
const mockStrain = {
  id: 1,
  name: 'Blue Dream',
  type: 'Hybrid',
  image_url: '/images/blue-dream.jpg',
  description: '...',
  terpenes: { ... },
  effects: [...],
  flavors: [...],
  thc: 21.5,
  cbd: 0.5,
  primary_terpene: 'myrcene'
};
```

### Future Integration (TODO)
Replace with actual API calls:

```javascript
// In StrainDetail.js useEffect
const fetchStrain = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/strains/${strainId}`);
    const data = await res.json();
    setStrain(data);
  } catch (error) {
    setError(error.message);
  }
};
```

## Styling Features

### StorageBanner (Full Layout)
- **3-Column Grid** on desktop
- **Product Cards:**
  - Tightvac (Air Control) - Teal border
  - Boveda (Humidity) - Gold border
  - Herb Guard (Light) - Green border
- Hover effects: Scale, shadow, color transitions
- Benefit tags with light backgrounds

### StorageBanner (Sidebar Layout)
- **Vertical Stack** for mobile/sidebar viewing
- **Compact terpene recommendations**
- Footer separator for visual clarity
- Responsive padding adjustments

### StrainDetail
- **Hero Image:** 400px tall (desktop), scales down on mobile
- **Type Badges:** Color-coded (Sativa: orange, Indica: blue, Hybrid: green)
- **Terpene Chart:** Visual bar representation with colors
- **Tags:** Semantic coloring (effects: green, flavors: golden)

## Responsive Breakpoints

### Desktop (1024px+)
- Two-column layout with sidebar
- Large hero image (400px)
- Full grid layout for StorageBanner

### Tablet (768px - 1024px)
- Single column, sidebar above main
- Medium hero image (350px)
- StorageBanner adjusts column count

### Mobile (480px - 768px)
- Full-width stacked layout
- Medium hero image (300px)
- Single-column StorageBanner

### Small Mobile (< 480px)
- Compressed padding and fonts
- Hero image (250px)
- Minimal spacing

## Future Enhancements

1. **Strain Database Integration**
   - Connect to MySQL backend `/api/strains/:id` endpoint
   - Load real strain data with terpene profiles

2. **User Interaction Tracking**
   - Track which storage recommendations users click
   - Analytics on product preferences by strain type

3. **Product Affiliate Links**
   - Add affiliate links to recommended products
   - Monetization opportunity for the platform

4. **Favorites Integration**
   - Mark favorite strains
   - Personalized storage recommendations dashboard

5. **Social Sharing**
   - Share strain details with other users
   - Public sharing of favorite storage setups

6. **Storage Equipment Marketplace**
   - Partner with storage vendors
   - In-platform purchasing recommendations

## Testing Checklist

- [ ] StrainDetail page loads at `/strain/1` (mock data)
- [ ] StorageBanner displays on Home page
- [ ] StorageBanner sidebar appears on StrainDetail page
- [ ] Responsive design works on desktop (1024px+)
- [ ] Responsive design works on tablet (768px)
- [ ] Responsive design works on mobile (480px)
- [ ] Terpene recommendations display correctly
- [ ] Favorite button works
- [ ] Share button works
- [ ] Navigation from Home to StrainDetail works
- [ ] Back button returns to previous page
- [ ] No console errors or warnings

## Files Modified

1. **src/components/StorageBanner.js** - NEW
2. **src/styles/StorageBanner.css** - NEW
3. **src/pages/StrainDetail.js** - NEW
4. **src/styles/StrainDetail.css** - NEW
5. **src/pages/Home.js** - MODIFIED (added StorageBanner import and usage)
6. **src/components/StrainExplorer.js** - MODIFIED (added navigation to StrainDetail)
7. **src/App.js** - MODIFIED (added StrainDetail route)
8. **public/index.html** - MODIFIED (updated Persona script URL)

## Live Testing

To test the integration:

1. Start the frontend: `npm start` (port 3000)
2. Navigate to `http://localhost:3000/`
3. View StorageBanner on Home page
4. Click any strain's "View Details" (or navigate directly to `/strain/1`)
5. View StrainDetail page with sidebar StorageBanner
6. Test responsive behavior by resizing browser window

## Troubleshooting

**Issue:** StorageBanner not displaying
- Check that CSS file is imported correctly
- Verify component is rendered in JSX
- Check browser console for errors

**Issue:** StrainDetail page not found
- Verify route is added to App.js
- Check that component is imported
- Ensure param is `:strainId` not `:id`

**Issue:** Responsive design not working
- Check CSS media queries
- Verify viewport meta tag in index.html
- Clear browser cache and rebuild

**Issue:** Navigation not working
- Verify React Router is set up
- Check that useNavigate hook is imported
- Verify route path matches component
