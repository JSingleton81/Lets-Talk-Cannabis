/**
 * Persona Webhook Handler for Let's Talk Cannabis
 * 
 * This endpoint receives verification webhooks from Persona and:
 * 1. Verifies the webhook signature for security
 * 2. Updates user verification status in MySQL
 * 3. Sends a custom push notification via Firebase Cloud Messaging
 * 
 * Setup:
 * - Add to your Express backend routes
 * - Configure environment variables (see .env.example below)
 * - Install dependencies: npm install express mysql2 crypto firebase-admin
 */

const express = require('express');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (do this once in your main server file)
// admin.initializeApp({
//   credential: admin.credential.cert(require('./path-to-firebase-service-account.json'))
// });

const router = express.Router();

/**
 * Verify Persona Webhook Signature
 * Prevents unauthorized requests from fake webhooks
 */
function verifyWebhookSignature(req) {
  const signature = req.headers['persona-signature'];
  const webhookSecret = process.env.PERSONA_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return false;
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Main Webhook Handler
 * POST /verify/webhook
 */
router.post('/verify/webhook', async (req, res) => {
  try {
    console.log('[Persona Webhook] Received:', req.body.data?.attributes?.status);

    // 1️⃣ Verify webhook signature
    if (!verifyWebhookSignature(req)) {
      console.error('[Persona Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { data } = req.body;
    const inquiryStatus = data?.attributes?.status;
    const referenceId = data?.attributes?.['reference-id']; // This is the firebaseUid

    if (!referenceId) {
      console.error('[Persona Webhook] No reference-id found');
      return res.status(400).json({ error: 'Missing reference-id' });
    }

    // 2️⃣ Only process approved inquiries
    if (inquiryStatus !== 'approved') {
      console.log(`[Persona Webhook] Status: ${inquiryStatus}, skipping notification`);
      return res.status(200).json({ message: 'Webhook received but not approved' });
    }

    // 3️⃣ Get database connection (adjust to your setup)
    const db = req.app.locals.db; // Or however you access your MySQL connection

    // 4️⃣ Update user verification status
    const updateQuery = `
      UPDATE users 
      SET is_verified_21 = 1, 
          persona_inquiry_id = ?,
          verified_at = NOW()
      WHERE firebase_uid = ?
    `;
    
    await db.promise().query(updateQuery, [data.id, referenceId]);
    console.log(`[Persona Webhook] ✅ User ${referenceId} verified in database`);

    // 5️⃣ Fetch user data for personalized notification
    const [users] = await db.promise().query(
      'SELECT username, email, fcm_token FROM users WHERE firebase_uid = ?',
      [referenceId]
    );

    if (users.length === 0) {
      console.error('[Persona Webhook] User not found:', referenceId);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // 6️⃣ Send custom push notification
    if (user.fcm_token) {
      const notificationPayload = {
        token: user.fcm_token,
        notification: {
          title: '🌿 Welcome to the Community!',
          body: `Hey ${user.username || 'friend'}! Your verification is complete. Your feed is now unlocked.`,
          imageUrl: 'https://your-domain.com/welcome-image.png' // Optional
        },
        data: {
          type: 'verification_approved',
          firebaseUid: referenceId,
          timestamp: new Date().toISOString(),
          clickAction: '/feed'
        },
        webpush: {
          fcmOptions: {
            link: `${process.env.FRONTEND_URL}/feed` // Opens Feed page on click
          },
          notification: {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            requireInteraction: false // Auto-dismiss after a few seconds
          }
        }
      };

      try {
        const response = await admin.messaging().send(notificationPayload);
        console.log(`[Persona Webhook] ✅ Push notification sent:`, response);
      } catch (fcmError) {
        console.error('[Persona Webhook] ❌ FCM Error:', fcmError);
        // Don't fail the webhook if notification fails
      }
    } else {
      console.warn('[Persona Webhook] ⚠️ No FCM token for user:', referenceId);
    }

    // 7️⃣ Success response
    return res.status(200).json({
      message: 'Verification processed successfully',
      firebaseUid: referenceId,
      verified: true
    });

  } catch (error) {
    console.error('[Persona Webhook] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Test Endpoint (optional - for debugging)
 * GET /verify/test-notification/:firebaseUid
 */
router.get('/test-notification/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const db = req.app.locals.db;

    const [users] = await db.promise().query(
      'SELECT username, fcm_token FROM users WHERE firebase_uid = ?',
      [firebaseUid]
    );

    if (users.length === 0 || !users[0].fcm_token) {
      return res.status(404).json({ error: 'User or FCM token not found' });
    }

    const user = users[0];
    const testPayload = {
      token: user.fcm_token,
      notification: {
        title: '🧪 Test Notification',
        body: 'If you see this, push notifications are working!'
      },
      webpush: {
        fcmOptions: {
          link: `${process.env.FRONTEND_URL}/dashboard`
        }
      }
    };

    const response = await admin.messaging().send(testPayload);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('[Test Notification] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
