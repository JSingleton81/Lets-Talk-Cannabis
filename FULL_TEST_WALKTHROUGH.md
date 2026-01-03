# 🧪 Complete Sign Up → Verification Test
## Let's Talk Cannabis - Full End-to-End Testing Guide

---

## 📋 **Prerequisites**

Before you start, make sure these are running:

```bash
# Terminal 1: React Frontend
npm start
# Should show: http://localhost:3003

# Terminal 2: Node.js Backend (in your backend directory)
npm install
node server.js
# Should show: Server running on port 5000

# Terminal 3: Ngrok (in another directory)
ngrok http 5000
# Copy the URL like: https://wary-elfishly-gino.ngrok-free.dev
```

---

## 🧑‍💻 **Test Flow**

### **STEP 1: Sign Up**

1. Open browser: **http://localhost:3003**
2. Click **"Sign Up"** link in navbar
3. Fill out the form:
   ```
   Username: testuser2024
   Email: test@example.com (unique email each test)
   Password: TestPass123! (strong password)
   Date of Birth: 01/01/1995 (21+ years old)
   ```
4. Click **"Create Account"**

**What should happen:**
- ✅ Loading spinner: "🌿 Setting up your garden..."
- ✅ Browser asks: "Allow notifications?" → Click **"Allow"**
- ✅ Console should show:
  ```
  ✅ Notification permission granted
  [Notification] FCM Token: BFJNyZVp...
  ✅ Web Push Token synced with backend!
  ```
- ✅ Redirects to Dashboard

**If stuck:**
- Check browser console (F12 → Console tab) for errors
- Check backend terminal for "auth/register" logs
- Verify MySQL has the user: `SELECT * FROM users WHERE email = 'test@example.com'`

---

### **STEP 2: Check FCM Token in Database**

In MySQL terminal, run:
```sql
SELECT firebase_uid, email, fcm_token, is_verified_21 
FROM users 
WHERE email = 'test@example.com';
```

**Expected output:**
```
| firebase_uid          | email               | fcm_token                     | is_verified_21 |
|-----------------------|---------------------|-------------------------------|----------------|
| uuid-from-firebase    | test@example.com    | BFJNyZVp... (long string)    | 0              |
```

**If `fcm_token` is NULL:**
- ❌ Backend `/auth/update-fcm-token` endpoint not receiving token
- Check backend logs for errors
- Verify `REACT_APP_VAPID_KEY` is set in `.env`

---

### **STEP 3: Navigate to Feed (Locked State)**

1. Click **"Feed"** in navbar (or go directly to http://localhost:3003/feed)
2. You should see:
   ```
   🌿 Community Feed
   🌿 Members Only
   To keep our community safe and compliant, you must be 21+ 
   to view these posts. Please verify your ID below.
   [PersonaInquiry Modal/Button]
   ```

**What's happening:**
- Backend is returning 403 status (user not verified)
- `isLocked` state is `true`
- Lock screen is showing

---

### **STEP 4: Complete Persona Verification**

1. Click the **PersonaInquiry button** in the lock screen
2. Persona modal opens
3. Fill in **Sandbox Test Data:**
   ```
   First Name: Jane
   Last Name: Doe
   Date of Birth: 01/01/1990
   Document Type: Passport (or ID)
   Document Images: Upload test images (any images work in sandbox)
   ```
4. Click **"Submit"**
5. Wait for: **"Inquiry Complete"** screen

**What's happening in background:**
- Persona creates an inquiry
- Frontend captures the `inquiryId` and `status`
- Persona sends webhook to your backend

**Check Backend Terminal:**
```
[Persona Webhook] Received: approved
[Persona Webhook] ✅ User xxx-firebase-uuid verified in database
[Persona Webhook] ✅ Push notification sent: projects/.../messages/...
```

---

### **STEP 5: Auto-Unlock Magic** ✨

**While Feed page is still open:**

1. **Push notification appears** in browser:
   ```
   🌿 Welcome to the Community!
   Hey testuser2024! Your verification is complete. 
   Your feed is now unlocked.
   ```

2. **Browser console shows:**
   ```
   ✅ Message received in foreground: {notification: {...}}
   🔓 Verification detected, refreshing feed...
   ```

3. **Feed refreshes automatically** (no page reload needed!)

4. **Lock screen disappears** and you see:
   ```
   🌿 Community Feed
   Welcome! Stay lifted and enjoy the conversations.
   [List of posts if they exist]
   ```

**Success! 🎉**

---

### **STEP 6: Verify Database Update**

Check MySQL again:
```sql
SELECT firebase_uid, email, fcm_token, is_verified_21, verified_at
FROM users 
WHERE email = 'test@example.com';
```

**Expected output:**
```
| firebase_uid          | email               | fcm_token        | is_verified_21 | verified_at         |
|-----------------------|---------------------|------------------|----------------|---------------------|
| uuid-from-firebase    | test@example.com    | BFJNyZVp...     | 1              | 2025-12-26 12:34:56 |
```

✅ `is_verified_21 = 1` (verified!)
✅ `verified_at` has timestamp

---

## 🐛 **Troubleshooting**

### **Issue: FCM Token Not Synced**

```
Expected: fcm_token = "BFJNyZVp..."
Got: fcm_token = NULL
```

**Solutions:**
1. Check VAPID key: `echo $REACT_APP_VAPID_KEY` (should not be empty)
2. Verify Firebase is initialized: Check browser console for Firebase warnings
3. Check if permission was granted: Browser should show notification permission prompt
4. Restart browser and clear cache: Hard refresh (Ctrl+Shift+R)

---

### **Issue: Webhook Not Firing**

```
Backend shows: [Persona Webhook] No requests received
```

**Solutions:**
1. **Is ngrok running?**
   - Open another terminal
   - Run: `ngrok http 5000`
   - Copy the URL: `https://xxxxxx.ngrok-free.dev`

2. **Is webhook configured in Persona?**
   - Persona Dashboard → Webhooks → Add Endpoint
   - URL: `https://YOUR-NGROK-URL/verify/webhook`
   - Secret: Copy from Persona, paste in backend `.env` as `PERSONA_WEBHOOK_SECRET`
   - Events: `inquiry.approved`, `inquiry.failed`

3. **Check webhook delivery in Persona:**
   - Persona Dashboard → Webhooks → Recent Deliveries
   - Should see attempts with status (200 = success, other = error)

---

### **Issue: Feed Still Locked After Verification**

```
Problem: User verifies but lock screen remains
```

**Solutions:**
1. Check `is_verified_21` in MySQL:
   ```sql
   SELECT is_verified_21 FROM users WHERE email = 'test@example.com';
   ```
   Should be `1`, if not → webhook didn't update DB

2. Check browser console for `onMessage` listener:
   ```
   Should see: ✅ Message received in foreground
   Should see: 🔓 Verification detected, refreshing feed...
   ```
   If not → notification not received

3. Check notification permission:
   - Browser address bar → Settings → Notifications → Allow

---

### **Issue: Blank Page or Error**

```
Frontend shows blank screen or "Cannot GET /feed"
```

**Solutions:**
1. Check browser console (F12 → Console):
   - Any red errors?
   - Firebase errors?
   - Network errors (failed API calls)?

2. Check if you're logged in:
   - Try going to `/login` manually
   - Should show login form

3. Clear cache and reload:
   - Ctrl+Shift+Delete → Clear browsing data
   - Hard refresh: Ctrl+Shift+R

---

## ✅ **Success Criteria**

You've completed the test when:

- [x] Sign up succeeds
- [x] Notification permission granted
- [x] FCM token appears in MySQL `fcm_token` column
- [x] Feed page shows locked state (403)
- [x] PersonaInquiry modal opens and accepts input
- [x] Persona returns "Inquiry Complete"
- [x] Backend webhook fires (`[Persona Webhook] Received: approved`)
- [x] MySQL updates `is_verified_21 = 1`
- [x] Push notification appears in browser
- [x] Feed auto-refreshes without page reload
- [x] Lock screen disappears
- [x] Posts appear (if they exist in database)

---

## 📝 **Test Data to Use**

Each test, use a **different email** to avoid conflicts:

```
Test 1:
  Email: test.run1@example.com
  Username: testuser_run1

Test 2:
  Email: test.run2@example.com
  Username: testuser_run2

Test 3:
  Email: test.run3@example.com
  Username: testuser_run3
```

**Always use:**
- DOB: 01/01/1995 (21+ years old)
- Password: TestPass123! (strong)
- First name: Jane (for Persona)
- Last name: Doe (for Persona)

---

## 📊 **Logging Summary**

### **Browser Console (F12)**
```
[useAuth] Auth state changed: test@example.com
[Navbar] Auth state changed: test@example.com
✅ Notification permission granted
[Notification] FCM Token: BFJN...
✅ Web Push Token synced with backend!
✅ Message received in foreground: {notification: {...}}
🔓 Verification detected, refreshing feed...
```

### **Backend Terminal**
```
✅ MySQL Connected
POST /auth/register - User created
POST /auth/update-fcm-token - Token synced
[Persona Webhook] Received: approved
[Persona Webhook] ✅ User xxx verified in database
[Persona Webhook] ✅ Push notification sent
```

### **MySQL Updates**
```
Before: is_verified_21 = 0, fcm_token = NULL
After:  is_verified_21 = 1, fcm_token = "BFJNyZVp..."
```

---

**Ready to test? Start with STEP 1!** 🚀

Let me know if you hit any issues during the test!
