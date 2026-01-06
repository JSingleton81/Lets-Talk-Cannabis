# Storage Guide Integration - Developer Guide

## Quick Start

### 1. Import StorageBanner in Your Page

```javascript
import StorageBanner from '../components/StorageBanner';
```

### 2. Use Full-Width Layout (Home Page)

```javascript
<StorageBanner layout="full" />
```

### 3. Use Sidebar Layout (Strain Detail)

```javascript
<StorageBanner 
  layout="sidebar" 
  strainType="Hybrid"
  dominantTerpene="myrcene"
/>
```

---

## Component API Reference

### StorageBanner Props

```typescript
interface StorageBannerProps {
  layout?: 'full' | 'sidebar';        // Default: 'full'
  strainType?: 'Sativa' | 'Indica' | 'Hybrid';
  dominantTerpene?: string;            // e.g., 'myrcene', 'limonene', 'pinene'
}
```

### Available Terpenes for Recommendations

```javascript
const TERPENE_MAP = {
  'limonene': { 
    product: 'UV Glass Jars',
    reason: 'Protects from degrading light'
  },
  'myrcene': { 
    product: 'Vacuum Container',
    reason: 'Preserves delicate flavor notes'
  },
  'pinene': { 
    product: 'Humidity Control (Boveda)',
    reason: 'Maintains freshness & terpenes'
  },
  'linalool': { 
    product: 'Cool & Dark Storage',
    reason: 'Retains psychoactive effects'
  },
  'humulene': { 
    product: 'Airtight Container',
    reason: 'Prevents oxidation'
  }
};
```

---

## Usage Examples

### Example 1: Simple Full-Width on Home

```javascript
import React from 'react';
import StorageBanner from '../components/StorageBanner';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Cannabis Community</h1>
      <p>Discover, preserve, and share strains.</p>
      
      {/* Full-width storage guide */}
      <StorageBanner layout="full" />
    </div>
  );
};

export default Home;
```

### Example 2: Sidebar on Strain Detail

```javascript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StorageBanner from '../components/StorageBanner';

const StrainDetail = () => {
  const { strainId } = useParams();
  const [strain, setStrain] = useState(null);

  useEffect(() => {
    // Fetch strain data
    const fetchStrain = async () => {
      const res = await fetch(`/api/strains/${strainId}`);
      const data = await res.json();
      setStrain(data);
    };
    fetchStrain();
  }, [strainId]);

  if (!strain) return <div>Loading...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px' }}>
      <div>
        <h1>{strain.name}</h1>
        <p>{strain.description}</p>
        {/* ... more strain details ... */}
      </div>
      
      {/* Sidebar with personalized recommendations */}
      <StorageBanner 
        layout="sidebar"
        strainType={strain.type}
        dominantTerpene={strain.primary_terpene}
      />
    </div>
  );
};

export default StrainDetail;
```

### Example 3: Using getTerpeneRecommendation Function

```javascript
import React from 'react';
import StorageBanner from '../components/StorageBanner';

const MyComponent = () => {
  // Get recommendation for a specific terpene
  const recommendation = StorageBanner.getTerpeneRecommendation('myrcene');
  
  return (
    <div>
      <h3>Recommended Storage</h3>
      <p>Product: {recommendation.product}</p>
      <p>Why: {recommendation.reason}</p>
    </div>
  );
};

export default MyComponent;
```

---

## Styling & CSS

### StorageBanner CSS Classes

```css
/* Full Layout Classes */
.storage-banner-full { ... }
.storage-card { ... }
.card-border { ... }
.card-content { ... }
.card-header { ... }
.card-benefits { ... }
.benefit-tag { ... }

/* Sidebar Layout Classes */
.storage-banner-sidebar { ... }
.terpene-recommendation { ... }
.recommendation-header { ... }
.recommendation-product { ... }
.recommendation-reason { ... }
```

### Custom Styling Example

```javascript
const MyStyledStorageBanner = styled(StorageBanner)`
  .storage-banner-full {
    background-color: #f5f5f5;
    border-radius: 12px;
    padding: 2rem;
  }
`;
```

---

## StrainDetail Page Integration

### Basic Route Setup

```javascript
// In App.js
import StrainDetail from './pages/StrainDetail';

<Routes>
  {/* ... other routes ... */}
  <Route path="/strain/:strainId" element={<StrainDetail />} />
</Routes>
```

### StrainDetail Component Structure

```javascript
const StrainDetail = () => {
  const { strainId } = useParams();
  const navigate = useNavigate();
  const [strain, setStrain] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch strain by ID
  useEffect(() => {
    const fetchStrain = async () => {
      try {
        const res = await fetch(`/api/strains/${strainId}`);
        const data = await res.json();
        setStrain(data);
      } catch (error) {
        console.error('Error fetching strain:', error);
      }
    };
    fetchStrain();
  }, [strainId]);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strainId })
      });
      if (res.ok) setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: strain.name,
        text: `Check out ${strain.name}!`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="strain-detail-container">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      {/* Main layout with sidebar */}
      <div className="strain-detail-layout">
        <div className="strain-detail-main">
          {/* Hero section */}
          <div className="strain-hero">
            <img src={strain.image_url} alt={strain.name} />
            <div className="strain-header-overlay">
              <h1 className="strain-name">{strain.name}</h1>
              <span className={`strain-type-badge ${strain.type.toLowerCase()}`}>
                {strain.type}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="strain-section description-section">
            <h2>About</h2>
            <p>{strain.description}</p>
          </div>

          {/* Terpene profile */}
          <div className="strain-section terpene-section">
            <h2>Terpene Profile</h2>
            <div className="terpene-chart">
              {strain.terpenes.map((terpene) => (
                <div key={terpene.name} className="terpene-item">
                  <span className="terpene-name">{terpene.name}</span>
                  <div className="terpene-bar">
                    <div 
                      className="terpene-fill" 
                      style={{ width: `${terpene.percentage}%`, background: terpene.color }}
                    />
                  </div>
                  <p className="terpene-notes">{terpene.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Effects & Flavors */}
          <div className="strain-section">
            <div className="effects-flavor-section">
              <div>
                <h3>Effects</h3>
                <div className="tags-list">
                  {strain.effects.map((effect) => (
                    <span key={effect} className="tag-effect">{effect}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3>Flavors</h3>
                <div className="tags-list">
                  {strain.flavors.map((flavor) => (
                    <span key={flavor} className="tag-flavor">{flavor}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cannabinoids */}
          <div className="strain-section cannabinoid-section">
            <h2>Cannabinoid Content</h2>
            <div className="cannabinoid-row">
              <div className="cannabinoid-item">
                <span className="cbd-label">THC</span>
                <span className="cbd-value">{strain.thc}%</span>
              </div>
              <div className="cannabinoid-item">
                <span className="cbd-label">CBD</span>
                <span className="cbd-value">{strain.cbd}%</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="strain-section">
            <div className="action-row">
              <button 
                className={`action-btn favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={handleToggleFavorite}
              >
                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
              <button className="action-btn share-btn" onClick={handleShare}>
                📤 Share Strain
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar with storage recommendations */}
        <div className="strain-detail-sidebar">
          <StorageBanner 
            layout="sidebar"
            strainType={strain.type}
            dominantTerpene={strain.primary_terpene}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## API Integration Checklist

### Strain Endpoint

Your backend should implement:

```
GET /api/strains/:id
Response:
{
  "id": 1,
  "name": "Blue Dream",
  "type": "Hybrid",
  "description": "...",
  "image_url": "https://...",
  "primary_terpene": "myrcene",
  "terpenes": [
    { "name": "Myrcene", "percentage": 40, "color": "#FFB84D" },
    { "name": "Limonene", "percentage": 30, "color": "#FF6B6B" },
    ...
  ],
  "effects": ["Uplifting", "Creative", "Focused"],
  "flavors": ["Citrus", "Berry", "Sweet"],
  "thc": 21.5,
  "cbd": 0.5
}
```

### Favorite Toggle Endpoint

```
POST /api/favorites/toggle
Body:
{
  "strainId": 1
}
Response:
{
  "success": true,
  "favorited": true
}
```

---

## Testing Checklist

### Unit Tests

```javascript
// StorageBanner.test.js
describe('StorageBanner', () => {
  it('renders full layout', () => {
    const { getByText } = render(<StorageBanner layout="full" />);
    expect(getByText('Preserve Your Garden')).toBeInTheDocument();
  });

  it('renders sidebar layout', () => {
    const { container } = render(
      <StorageBanner layout="sidebar" dominantTerpene="myrcene" />
    );
    expect(container.querySelector('.storage-banner-sidebar')).toBeInTheDocument();
  });

  it('provides correct terpene recommendation', () => {
    const recommendation = StorageBanner.getTerpeneRecommendation('myrcene');
    expect(recommendation.product).toBe('Vacuum Container');
  });
});
```

### Integration Tests

```javascript
// StrainDetail.integration.test.js
describe('StrainDetail Integration', () => {
  it('loads strain and displays storage recommendations', async () => {
    const { getByText } = render(<StrainDetail strainId="1" />);
    
    await waitFor(() => {
      expect(getByText('Blue Dream')).toBeInTheDocument();
    });
    
    expect(getByText(/storage recommendations/i)).toBeInTheDocument();
  });

  it('navigates to strain detail from explorer', async () => {
    const { getByText } = render(<StrainExplorer />);
    
    const viewButton = getByText('View Details');
    fireEvent.click(viewButton);
    
    expect(window.location.pathname).toContain('/strain/');
  });
});
```

### Manual Testing

- [ ] Load Home page, verify StorageBanner displays
- [ ] Verify responsive design at 1024px, 768px, 480px
- [ ] Click "View Details" on a strain
- [ ] Verify StrainDetail page loads with correct data
- [ ] Verify sidebar StorageBanner appears
- [ ] Click favorite button, verify state changes
- [ ] Click share button, verify share dialog appears
- [ ] Test back button, verify navigation
- [ ] Test on mobile device (or Chrome DevTools)

---

## Performance Optimization

### Code Splitting

```javascript
// App.js
import { lazy, Suspense } from 'react';

const StrainDetail = lazy(() => import('./pages/StrainDetail'));

<Suspense fallback={<div>Loading...</div>}>
  <Route path="/strain/:strainId" element={<StrainDetail />} />
</Suspense>
```

### Image Optimization

```javascript
// Use responsive images
<img 
  src={strain.image_url}
  srcSet={`
    ${strain.image_url}?w=400 400w,
    ${strain.image_url}?w=800 800w,
    ${strain.image_url}?w=1200 1200w
  `}
  sizes="(max-width: 768px) 100vw, 800px"
  alt={strain.name}
/>
```

### Caching

```javascript
// Cache strain data
const cache = new Map();

const fetchStrain = async (strainId) => {
  if (cache.has(strainId)) {
    return cache.get(strainId);
  }
  
  const data = await fetch(`/api/strains/${strainId}`).then(r => r.json());
  cache.set(strainId, data);
  return data;
};
```

---

## Troubleshooting

### StorageBanner Not Appearing

```javascript
// ✅ Correct
import StorageBanner from '../components/StorageBanner';
<StorageBanner layout="full" />

// ❌ Wrong
import StorageBanner from './StorageBanner';  // Wrong path
<StorageBanner />  // Missing layout prop
```

### StrainDetail Page Not Routing

```javascript
// ✅ Make sure route is defined
<Route path="/strain/:strainId" element={<StrainDetail />} />

// ✅ Make sure navigation uses correct path
navigate(`/strain/${strain.id}`)

// ✅ Make sure component imports useParams
import { useParams } from 'react-router-dom';
```

### Responsive Design Not Working

```javascript
// ✅ Ensure viewport meta tag exists
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

// ✅ Check CSS media queries
@media (max-width: 768px) {
  .strain-detail-layout {
    grid-template-columns: 1fr;  // Single column
  }
}

// ✅ Clear browser cache and rebuild
rm -rf node_modules/.cache
npm start
```

---

## Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

**Happy Coding! 🚀**
