# Backend Webhook Integration Guide
## Let's Talk Cannabis - Persona Verification & Push Notifications

### 📦 Installation

```bash
# In your backend directory
npm install express mysql2 firebase-admin crypto body-parser cors
```

### 🔧 Setup Steps

#### 1. Firebase Admin SDK Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-service-account.json` in your backend root
4. **Important:** Add to `.gitignore` to keep it secure

#### 2. Environment Variables
```bash
# Copy the example file
cp backend.env.example .env

# Edit .env with your actual credentials:
# - PERSONA_API_KEY from Persona Dashboard
# - PERSONA_WEBHOOK_SECRET from Persona Webhook settings
# - MySQL credentials
# - FRONTEND_URL (your React app URL)
```

#### 3. Integrate the Webhook Handler

**In your main server file (e.g., `server.js`):**

```javascript
const express = require('express');
const mysql = require('mysql2');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  )
});

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

// Make db available to routes
app.locals.db = db;

// Import webhook handler
const verifyWebhook = require('./backend-webhook-handler');

// Mount routes
app.use('/verify', verifyWebhook);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

#### 4. Configure Persona Webhook

1. Go to **Persona Dashboard** → Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-ngrok-or-domain/verify/webhook`
4. Select events: `inquiry.approved`, `inquiry.failed`, `inquiry.expired`
5. Copy the **Webhook Secret** (starts with `whsec_`)
6. Add to your backend `.env` as `PERSONA_WEBHOOK_SECRET`

#### 5. Database Schema

Ensure your `users` table has these columns:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified_21 TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS persona_inquiry_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS verified_at DATETIME,
ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(512);

-- Add index for faster lookups
CREATE INDEX idx_firebase_uid ON users(firebase_uid);
```

### 🧪 Testing

#### Test 1: Check Webhook Endpoint
```bash
curl -X POST http://localhost:5000/verify/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### Test 2: Test Push Notification
```bash
# Replace with actual firebaseUid
curl http://localhost:5000/verify/test-notification/YOUR_FIREBASE_UID
```

#### Test 3: Full Flow
1. Open React app: http://localhost:3003
2. Sign up/login
3. Go to Feed page (should show locked)
4. Click "Verify ID below"
5. Complete Persona verification in Sandbox mode
6. Watch for:
   - Console logs in backend terminal
   - Push notification in browser
   - Feed unlocking automatically

### 📱 Notification Customization

Edit the notification payload in `backend-webhook-handler.js`:

```javascript
const notificationPayload = {
  notification: {
    title: '🌿 Your Custom Title',
    body: `Personalized message for ${user.username}`,
    imageUrl: 'https://your-cdn.com/welcome-banner.png'
  },
  webpush: {
    fcmOptions: {
      link: '/dashboard' // Where to navigate on click
    },
    notification: {
      icon: '/your-custom-icon.png',
      badge: '/badge-icon.png',
      requireInteraction: true // Keep notification visible
    }
  }
};
```

### 🔒 Security Checklist

- ✅ Webhook signature verification enabled
- ✅ Firebase service account JSON in `.gitignore`
- ✅ Environment variables not hardcoded
- ✅ CORS configured for your frontend domain only
- ✅ HTTPS enabled (use ngrok for development)
- ✅ MySQL connection using prepared statements

### 🐛 Troubleshooting

**Webhook not receiving requests:**
- Check Persona Dashboard → Webhooks → Recent Deliveries
- Verify ngrok tunnel is active: `ngrok http 5000`
- Check webhook URL matches ngrok URL

**Push notification not sending:**
- Check FCM token exists: `SELECT fcm_token FROM users WHERE firebase_uid = 'xxx'`
- Verify Firebase service account JSON is loaded
- Check frontend requested notification permissions

**Database not updating:**
- Check `firebase_uid` matches between Persona `reference-id` and MySQL
- Run test query: `SELECT * FROM users WHERE firebase_uid = 'xxx'`
- Check MySQL logs for connection errors

### 📚 References

- [Persona Webhook Guide](https://docs.withpersona.com/docs/webhooks)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [FCM Send Messages](https://firebase.google.com/docs/cloud-messaging/send-message)

### 🎯 Next Steps

1. Deploy backend to production server
2. Update Persona webhook URL to production domain
3. Test in Persona production mode (live verifications)
4. Monitor webhook delivery rates
5. Set up logging/monitoring (Winston, Sentry, etc.)
