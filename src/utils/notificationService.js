/**
 * notificationService.js
 * Handles FCM token registration and syncing with the backend
 */

import { messaging, getToken, auth } from '../firebase';

/**
 * Request browser notification permission and sync FCM token with backend
 * @param {string} firebaseUid - User's Firebase UID
 * @param {string} apiBase - Base URL for the backend API
 * @returns {Promise<boolean>} - True if token was synced, false otherwise
 */
export const requestPermissionAndSyncToken = async (firebaseUid, apiBase) => {
  try {
    // 1. Request browser notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // 2. Get Web Push Token using VAPID Key from Firebase Console
      // Note: You need to add REACT_APP_VAPID_KEY to your .env file
      const vapidKey = process.env.REACT_APP_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('⚠️ REACT_APP_VAPID_KEY not set in .env');
        return false;
      }

      const token = await getToken(messaging, { vapidKey });

      if (token) {
        console.log('[Notification] FCM Token:', token.substring(0, 20) + '...');
        
        // 🔐 Get fresh Firebase ID token for authentication
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('❌ No authenticated user found');
          return false;
        }
        
        const idToken = await currentUser.getIdToken(true);
        
        // 3. Send token to your Node.js/MySQL backend
        const response = await fetch(`${apiBase}/auth/update-fcm-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`, // 🔐 Include auth token
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            firebaseUid: firebaseUid,
            fcmToken: token
          })
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('❌ Backend error:', response.status, error);
          return false;
        }

        const data = await response.json();
        console.log('✅ Web Push Token synced with backend!', data);
        return true;
      } else {
        console.warn('⚠️ Failed to get FCM token');
        return false;
      }
    } else if (permission === 'denied') {
      console.log('🔔 User denied notification permission');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Register service worker for background messages
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.warn('⚠️ Service Worker registration failed:', error);
      return null;
    }
  }
};
