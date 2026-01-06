# Quick Reference Card - Storage Guide Integration

## 🚀 Quick Start

```bash
# 1. Start the app
npm start

# 2. Visit Home Page
http://localhost:3000/

# 3. View Storage Guide (Full Width)
# Should see Tightvac/Boveda/Herb Guard cards

# 4. Click "View Details" on any strain card
# Or navigate directly to:
http://localhost:3000/strain/1

# 5. View Storage Guide (Sidebar)
# Should see personalized recommendation based on terpene
```

---

## 📁 Key Files

| File | Purpose | Location |
|------|---------|----------|
| StorageBanner.js | Reusable component | `src/components/` |
| StorageBanner.css | Component styles | `src/styles/` |
| StrainDetail.js | Strain page | `src/pages/` |
| StrainDetail.css | Page styles | `src/styles/` |
| Home.js | Home page (updated) | `src/pages/` |
| StrainExplorer.js | Strain search (updated) | `src/components/` |
| App.js | Routes (updated) | `src/` |

---

## 🎯 Component Props

### StorageBanner
```javascript
<StorageBanner 
  layout="full"                    // 'full' or 'sidebar'
  strainType="Hybrid"              // Optional
  dominantTerpene="myrcene"        // Optional
/>
```

---

## 🧬 Terpene Mapping

```javascript
limonene   → UV Glass Jars
myrcene    → Vacuum Container
pinene     → Humidity Control
linalool   → Cool & Dark Storage
humulene   → Airtight Container
```

---

## 🛣️ Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page with StorageBanner |
| `/strain/:strainId` | StrainDetail | Individual strain page |

---

## 📡 API Endpoints (When Ready)

```
GET  /api/strains           → Fetch all strains
GET  /api/strains/:id       → Fetch single strain
POST /api/favorites/toggle  → Add/remove favorite
GET  /api/favorites/my-stash → Get user's favorites
```

---

## 💻 Browser Sizes

```
Desktop:  1024px+  → Two-column layout
Tablet:   768px    → Single column
Mobile:   480px    → Full-width stacked
```

---

## 🎨 Color Palette

```
Primary:    #2a5c2a    (Cannabis green)
Accent:     #FFD700    (Golden yellow)
Sativa:     Orange
Indica:     Blue
Hybrid:     Green
```

---

## ✅ Testing Checklist

- [ ] Home page loads (StorageBanner visible)
- [ ] Responsive design at 1024px/768px/480px
- [ ] Click "View Details" → navigates to /strain/1
- [ ] StrainDetail page loads with mock data
- [ ] Sidebar StorageBanner displays recommendation
- [ ] Favorite button works
- [ ] Share button works
- [ ] Back button returns to previous page
- [ ] No console errors

---

## 🐛 Common Issues & Fixes

**Issue: StorageBanner not showing**
```javascript
// ✅ Correct import
import StorageBanner from '../components/StorageBanner';

// ❌ Wrong
import StorageBanner from './StorageBanner';  // Wrong path
```

**Issue: StrainDetail not routing**
```javascript
// ✅ Route must exist in App.js
<Route path="/strain/:strainId" element={<StrainDetail />} />

// ✅ Navigation must use useNavigate
const navigate = useNavigate();
navigate(`/strain/${id}`);
```

**Issue: Responsive not working**
```html
<!-- ✅ Viewport meta tag required in index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Clear cache and rebuild -->
rm -rf node_modules/.cache && npm start
```

---

## 📊 Responsive Behavior

### Full Layout (Home Page)
- **Desktop**: 3 columns (Tightvac | Boveda | Herb Guard)
- **Tablet**: 2 columns
- **Mobile**: 1 column (full width)

### Sidebar Layout (StrainDetail)
- **Desktop**: Grid → Sidebar (2 columns)
- **Tablet**: Sidebar above main (1 column)
- **Mobile**: Full width stacked (1 column)

---

## 🔄 Navigation Flow

```
Home Page
  ↓
StrainExplorer
  ↓
Click [View Details]
  ↓
/strain/:strainId
  ↓
StrainDetail Page (with Sidebar StorageBanner)
```

---

## 📦 Component Structure

```
StorageBanner (Reusable)
├── Full Layout
│   ├── ProductCard (Tightvac)
│   ├── ProductCard (Boveda)
│   └── ProductCard (Herb Guard)
│
└── Sidebar Layout
    └── TerpeneRecommendation
        ├── Product Name
        └── Reason

StrainDetail (Page)
├── Hero Section
├── Description
├── Terpene Chart
├── Effects & Flavors
├── Cannabinoids
├── Action Buttons
└── StorageBanner Sidebar
```

---

## 🎯 Key Functions

### StorageBanner
```javascript
getTerpeneRecommendation(terpene)
  → Returns { product: string, reason: string }
```

### StrainDetail
```javascript
handleToggleFavorite()
  → POST /api/favorites/toggle
  → Updates isFavorited state

handleShare()
  → navigator.share() or copy URL
```

---

## 📱 Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { ... }

/* Tablet */
@media (min-width: 481px) and (max-width: 768px) { ... }

/* Desktop */
@media (min-width: 769px) { ... }
```

---

## 🔐 Future API Integration

```javascript
// In StrainDetail.js useEffect
const fetchStrain = async () => {
  const res = await fetch(`/api/strains/${strainId}`);
  const data = await res.json();
  setStrain(data);
};

// Replace mock data with real API calls
```

---

## 📚 Documentation Files

- **STORAGE_GUIDE_INTEGRATION.md** - Detailed technical guide
- **STORAGE_INTEGRATION_SUMMARY.md** - Visual overview
- **DEVELOPER_GUIDE.md** - Code examples
- **IMPLEMENTATION_CHECKLIST.md** - Testing checklist
- **ARCHITECTURE_DIAGRAMS.md** - System architecture
- **QUICK_REFERENCE.md** - This file

---

## 🎓 Learning Resources

- [React Router Docs](https://reactrouter.com)
- [CSS Grid Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [React Hooks](https://react.dev/reference/react)

---

## 👥 Team Contacts

**Frontend Lead**: [Your Name]
**Backend Lead**: [Your Name]
**Design Lead**: [Your Name]
**QA Lead**: [Your Name]

---

## 🚨 Emergency Contacts

- React Error: Check browser console (F12)
- CSS Issues: Check browser DevTools Styles panel
- Routing Issues: Verify route in App.js
- API Issues: Check network tab (F12) and backend logs

---

## 📝 Notes

- All components are functional components with hooks
- CSS uses mobile-first responsive design
- No external UI libraries (vanilla CSS)
- Mock data available for testing
- Ready for API integration when backend is ready

---

## ✨ Success Indicators

✅ StorageBanner displays on Home page
✅ StrainDetail page navigates from explorer
✅ Responsive design works at all breakpoints
✅ No console errors or warnings
✅ UI matches design mockups
✅ Terpene recommendations are intelligent
✅ Navigation is smooth and fast

---

**Ready to Launch! 🚀**

For detailed information, see the other documentation files in the repo.
