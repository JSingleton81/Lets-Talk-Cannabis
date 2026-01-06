# Storage Guide Integration - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Let's Talk Cannabis Platform                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   React Frontend (Port 3000)              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  App.js                                                    │   │
│  │  ├── Routes                                               │   │
│  │  │   ├── / ────────────────→ Home.js                     │   │
│  │  │   │                       ├── StorageBanner (Full)     │   │
│  │  │   │                       └── StrainExplorer           │   │
│  │  │   │                                                    │   │
│  │  │   └── /strain/:strainId ─→ StrainDetail.js           │   │
│  │  │                           ├── StrainDetail Section     │   │
│  │  │                           └── StorageBanner (Sidebar)  │   │
│  │  │                                                        │   │
│  │  └── Components                                           │   │
│  │      ├── StorageBanner (Reusable)                       │   │
│  │      │   ├── Layout: 'full' | 'sidebar'                │   │
│  │      │   ├── getTerpeneRecommendation()                 │   │
│  │      │   └── Terpene Mapping Logic                      │   │
│  │      │                                                    │   │
│  │      └── StrainExplorer                                 │   │
│  │          ├── Search/Filter                              │   │
│  │          ├── Pagination                                 │   │
│  │          └── Navigate → /strain/:id                     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ HTTP Requests                      │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express Backend (Port 5000)                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Routes                                                    │   │
│  │  ├── GET  /api/strains           ← Fetch all strains     │   │
│  │  ├── GET  /api/strains/:id       ← Fetch single strain   │   │
│  │  ├── POST /api/favorites/toggle  ← Toggle favorite       │   │
│  │  ├── GET  /api/favorites/my-stash ← Get user's favorites│   │
│  │  └── ...                         ← Other endpoints       │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ Database Queries                   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MySQL Database                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Tables                                                    │   │
│  │  ├── strains       ← Strain data (name, type, etc)      │   │
│  │  ├── terpenes      ← Terpene profiles per strain        │   │
│  │  ├── users         ← User accounts                       │   │
│  │  └── favorites     ← User favorite strains              │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.js
├── Navbar
├── Routes
│   ├── / (Home)
│   │   └── Home.js
│   │       ├── Hero Section
│   │       ├── StorageBanner (Full Layout)
│   │       │   ├── ProductCard (Tightvac)
│   │       │   ├── ProductCard (Boveda)
│   │       │   └── ProductCard (Herb Guard)
│   │       └── StrainExplorer
│   │           ├── SearchInput
│   │           ├── FilterButtons
│   │           ├── StrainCard (Map)
│   │           │   ├── Image
│   │           │   ├── Name
│   │           │   ├── Terpenes
│   │           │   ├── Effects
│   │           │   └── [View Details] ← Navigates to /strain/:id
│   │           └── Pagination
│   │
│   └── /strain/:strainId (StrainDetail)
│       └── StrainDetail.js
│           ├── BackButton
│           ├── Hero
│           │   ├── Image
│           │   ├── Name
│           │   └── TypeBadge
│           ├── Description
│           ├── TerpeneChart
│           ├── EffectsAndFlavors
│           ├── CannabinoidContent
│           ├── ActionButtons
│           │   ├── FavoriteButton
│           │   └── ShareButton
│           └── StorageBanner (Sidebar Layout)
│               ├── TerpeneRecommendation
│               └── ProductInfo
```

---

## Data Flow: Home Page to Strain Detail

```
1. USER VISITS HOME PAGE (/)
   │
   ├─→ Home.js mounts
   │   └─→ StorageBanner (layout="full") renders
   │       ├─→ Fetches getTerpeneRecommendation() for each terpene
   │       └─→ Displays 3-column product grid
   │
   └─→ StrainExplorer component mounts
       ├─→ useEffect: Fetch strains from /api/strains
       │
       ├─→ Display StrainCards in grid
       │   └─→ Each card has [View Details] button
       │
       └─→ USER CLICKS [View Details]
           │
           ├─→ useNavigate(`/strain/${strain.id}`)
           │
           └─→ NAVIGATE TO STRAIN DETAIL PAGE (/strain/:id)

2. USER ARRIVES AT STRAIN DETAIL PAGE
   │
   ├─→ StrainDetail.js mounts
   │   │
   │   ├─→ Extract strainId from URL params
   │   │
   │   ├─→ useEffect: Fetch strain from /api/strains/:id
   │   │   └─→ Set strain state with data
   │   │
   │   ├─→ Render strain information
   │   │   ├─→ Hero section with image
   │   │   ├─→ Description
   │   │   ├─→ Terpene chart (color-coded bars)
   │   │   ├─→ Effects tags
   │   │   ├─→ Flavor tags
   │   │   └─→ Cannabinoid content
   │   │
   │   ├─→ Render action buttons
   │   │   ├─→ Favorite (onClick → POST /api/favorites/toggle)
   │   │   └─→ Share (onClick → navigator.share || copy-to-clipboard)
   │   │
   │   └─→ Render StorageBanner sidebar
       └─→ Props: layout="sidebar", strainType={strain.type}, 
                  dominantTerpene={strain.primary_terpene}
           │
           └─→ StorageBanner.getTerpeneRecommendation(strain.primary_terpene)
               └─→ Display relevant storage product + reason

3. USER INTERACTS WITH PAGE
   │
   ├─→ Click Favorite button
   │   ├─→ POST /api/favorites/toggle { strainId: 1 }
   │   ├─→ Backend adds/removes from favorites table
   │   └─→ Update isFavorited state
   │
   ├─→ Click Share button
   │   ├─→ Share current strain URL
   │   └─→ Show share dialog or copy-to-clipboard
   │
   └─→ Click Back button
       └─→ navigate(-1) → Return to previous page
```

---

## Storage Recommendation Engine

```
User views Strain Detail Page
│
├─→ Strain data includes primary_terpene: "myrcene"
│
├─→ StorageBanner sidebar renders with props:
│   ├── layout="sidebar"
│   ├── strainType="Hybrid"
│   └── dominantTerpene="myrcene"
│
├─→ Call getTerpeneRecommendation("myrcene")
│
├─→ TERPENE_MAP returns:
│   {
│     product: "Vacuum Container",
│     reason: "Preserves delicate flavor notes"
│   }
│
└─→ Display recommendation to user:
    "Store this strain in a Vacuum Container
     to preserve its delicate flavor notes"

TERPENE MAPPING LOGIC:
─────────────────────

limonene → UV Glass Jars
  Because: "Protects from degrading light"
  
myrcene → Vacuum Container
  Because: "Preserves delicate flavor notes"
  
pinene → Humidity Control (Boveda)
  Because: "Maintains freshness & terpenes"
  
linalool → Cool & Dark Storage
  Because: "Retains psychoactive effects"
  
humulene → Airtight Container
  Because: "Prevents oxidation & degradation"
```

---

## State Management Flow

```
Home.js
├── State: isMenuOpen (boolean)
│   └── Controls mobile menu visibility
│
└── Renders:
    ├── StorageBanner (props: layout="full")
    │   └── No state needed (stateless component)
    │
    └── StrainExplorer
        ├── State: strains (array)
        │   └── Loaded from /api/strains
        │
        ├── State: search (string)
        │   └── User's search input
        │
        ├── State: type (string)
        │   └── Selected strain type filter
        │
        ├── State: page (number)
        │   └── Current pagination page
        │
        ├── State: loading (boolean)
        │   └── API request in progress
        │
        └── State: totalPages (number)
            └── Total pages for pagination


StrainDetail.js
├── State: strain (object | null)
│   ├── Fetched from /api/strains/:id
│   ├── Contains: name, type, description, terpenes[], effects[], flavors[], thc, cbd
│   └── Passed to StorageBanner as props
│
├── State: loading (boolean)
│   ├── Show loading spinner
│   └── Disable buttons during load
│
├── State: isFavorited (boolean)
│   ├── Toggle on favorite button click
│   └── POST /api/favorites/toggle
│
├── State: error (string | null)
│   ├── Display error message if fetch fails
│   └── Show fallback UI
│
└── Effects:
    └── useEffect: Fetch strain when strainId changes
        └── setStrain(data)


StorageBanner.js (Stateless Component)
├── Props:
│   ├── layout: 'full' | 'sidebar' (default: 'full')
│   ├── strainType: 'Sativa' | 'Indica' | 'Hybrid' (optional)
│   └── dominantTerpene: string (optional)
│
└── Functions:
    └── getTerpeneRecommendation(terpene)
        └── Returns { product, reason }
```

---

## API Contract

```
1. GET /api/strains
   Query Params:
   ├── page: number (default: 1)
   ├── limit: number (default: 20)
   ├── search: string (optional)
   └── type: 'Sativa' | 'Indica' | 'Hybrid' (optional)
   
   Response:
   {
     "strains": [
       {
         "id": 1,
         "name": "Blue Dream",
         "type": "Hybrid",
         "primary_terpene": "myrcene",
         "image_url": "https://...",
         "effects": ["Uplifting", "Creative"],
         "description": "..."
       },
       ...
     ],
     "totalPages": 5,
     "currentPage": 1
   }


2. GET /api/strains/:id
   Params:
   └── id: number (strain ID)
   
   Response:
   {
     "id": 1,
     "name": "Blue Dream",
     "type": "Hybrid",
     "image_url": "https://...",
     "description": "...",
     "primary_terpene": "myrcene",
     "terpenes": [
       { "name": "Myrcene", "percentage": 40 },
       { "name": "Limonene", "percentage": 30 },
       ...
     ],
     "effects": ["Uplifting", "Creative", "Focused"],
     "flavors": ["Citrus", "Berry", "Sweet"],
     "thc": 21.5,
     "cbd": 0.5
   }


3. POST /api/favorites/toggle
   Body:
   {
     "strainId": 1
   }
   
   Response:
   {
     "success": true,
     "favorited": true,
     "message": "Strain added to favorites"
   }


4. GET /api/favorites/my-stash
   Response:
   {
     "favorites": [
       { "id": 1, "name": "Blue Dream", ... },
       { "id": 2, "name": "OG Kush", ... },
       ...
     ]
   }
```

---

## Database Schema (Simplified)

```
strains table
├── id (PK)
├── name
├── type (ENUM: 'Sativa', 'Indica', 'Hybrid')
├── description
├── image_url
├── primary_terpene
└── created_at


terpenes table
├── id (PK)
├── strain_id (FK → strains.id)
├── name
└── percentage


effects table
├── id (PK)
├── strain_id (FK → strains.id)
└── effect_name


flavors table
├── id (PK)
├── strain_id (FK → strains.id)
└── flavor_name


cannabinoids table
├── id (PK)
├── strain_id (FK → strains.id)
├── type (ENUM: 'THC', 'CBD')
└── percentage


users table
├── id (PK)
├── email
├── password
├── created_at
└── ...


favorites table
├── id (PK)
├── user_id (FK → users.id)
├── strain_id (FK → strains.id)
├── created_at
└── UNIQUE(user_id, strain_id)
```

---

## File Structure

```
src/
├── App.js
│   └── Routes (includes /strain/:strainId)
│
├── components/
│   ├── Navbar.js
│   ├── StorageBanner.js          ← NEW
│   ├── StrainExplorer.js         ← MODIFIED (navigation)
│   └── ...
│
├── pages/
│   ├── Home.js                   ← MODIFIED (StorageBanner)
│   ├── StrainDetail.js           ← NEW
│   ├── Feed.js
│   ├── Profile.js
│   └── ...
│
└── styles/
    ├── Home.css
    ├── StorageBanner.css         ← NEW
    ├── StrainDetail.css          ← NEW
    ├── global.css
    └── ...
```

---

## Browser Rendering Pipeline

```
1. USER LOADS WEBSITE
   └─→ Browser downloads HTML (index.html)
       └─→ index.html loads React app bundle
           └─→ App.js mounts at #root

2. APP ROUTING (React Router)
   └─→ Navigate to /
       └─→ Renders Home.js component

3. HOME.JS RENDERS
   ├─→ Render Navbar
   ├─→ Render Hero section
   ├─→ Render StorageBanner (layout="full")
   │   ├─→ Import StorageBanner.css (if not already)
   │   ├─→ Render 3-column grid
   │   └─→ Display product cards
   │
   └─→ Render StrainExplorer
       ├─→ useEffect runs: fetch /api/strains
       ├─→ Render strain cards in grid
       └─→ Attach click handlers to buttons

4. USER CLICKS [VIEW DETAILS]
   ├─→ onClick handler calls navigate(`/strain/1`)
   ├─→ React Router updates URL to /strain/1
   ├─→ StrainDetail.js component mounts
   │
   └─→ BROWSER NAVIGATES TO /strain/1

5. STRAINDETAIL.JS RENDERS
   ├─→ Extract strainId from URL params
   ├─→ useEffect runs: fetch /api/strains/1
   ├─→ Render back button
   ├─→ Render hero section with image
   ├─→ Render description
   ├─→ Render terpene chart
   ├─→ Render effects/flavors
   ├─→ Render cannabinoids
   ├─→ Render action buttons
   │
   └─→ Render StorageBanner sidebar
       ├─→ Calculate getTerpeneRecommendation(primary_terpene)
       ├─→ Render relevant product recommendation
       └─→ Display reason for recommendation

6. USER INTERACTS
   ├─→ Click Favorite button
   │   └─→ POST /api/favorites/toggle
   │       └─→ Update isFavorited state
   │
   ├─→ Click Share button
   │   └─→ navigator.share() or copy URL
   │
   └─→ Click Back button
       └─→ navigate(-1)
           └─→ Return to previous page

7. PAGE UNMOUNTS
   └─→ useEffect cleanup
       └─→ Cancel any pending API requests
           └─→ Free memory
```

---

## Responsive Layout Transformation

```
DESKTOP (1024px+)
─────────────────
┌─────────────────────────────────────┬──────────┐
│                                     │ Storage  │
│           Strain Details            │ Banner   │
│                                     │ Sidebar  │
│                                     │          │
│ Hero Image (400px)                  │          │
│ Description                         │          │
│ Terpene Chart                       │          │
│ Effects & Flavors                   │          │
│ Cannabinoids                        │          │
│ Action Buttons                      │          │
│                                     │          │
└─────────────────────────────────────┴──────────┘


TABLET (768px - 1024px)
──────────────────────
┌────────────────────────────────────┐
│     Storage Banner Sidebar         │
│ (Moved above main content)         │
├────────────────────────────────────┤
│                                    │
│ Hero Image (350px)                 │
│ Description                        │
│ Terpene Chart                      │
│ Effects & Flavors                  │
│ Cannabinoids                       │
│ Action Buttons                     │
│                                    │
└────────────────────────────────────┘


MOBILE (< 768px)
────────────────
┌────────────────────────────────────┐
│ Hero Image (300px)                 │
│ Description                        │
│ Terpene Chart                      │
│ Effects & Flavors                  │
│ Cannabinoids                       │
│ Action Buttons                     │
│                                    │
├────────────────────────────────────┤
│  Storage Banner Sidebar            │
│  (Full width on mobile)            │
│  Compact terpene recommendation    │
└────────────────────────────────────┘
```

---

## Event Flow: Favorite Button

```
User Clicks Favorite Button
│
├─→ onClick handler triggered
│   └─→ handleToggleFavorite() called
│
├─→ Button disabled (loading state)
│
├─→ POST /api/favorites/toggle
│   └─→ Request body: { strainId: 1 }
│
├─→ Backend processes request
│   ├─→ Check user authentication
│   ├─→ Check if strain exists
│   └─→ Add/remove from favorites table
│
├─→ Backend returns response
│   └─→ { success: true, favorited: true }
│
├─→ Frontend receives response
│   ├─→ setIsFavorited(!isFavorited)
│   └─→ Re-render button with new state
│
├─→ Button enabled
│   ├─→ If favorited: Show "❤️ Favorited"
│   └─→ If not favorited: Show "🤍 Add to Favorites"
│
└─→ Success! User sees updated button state
```

---

## CSS Media Query Cascade

```
CSS Mobile-First Approach:
1. Write styles for smallest screen (mobile)
2. Use @media to add rules for larger screens
3. Ensures performance on mobile devices

Example:
────────
.strain-detail-layout {
  /* Mobile: Single column (default) */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .strain-detail-layout {
    /* Tablet: Single column */
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .strain-detail-layout {
    /* Desktop: Two columns */
    grid-template-columns: 1fr 350px;
  }
}
```

---

This comprehensive architecture ensures scalability, maintainability, and a seamless user experience across all devices!
