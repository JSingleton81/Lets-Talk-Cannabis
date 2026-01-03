importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyD7oUH4V3kX0TgGVxMJyckrgw-G6sBZMRk",
  authDomain: "let-talk-cannabis.firebaseapp.com",
  projectId: "let-talk-cannabis",
  storageBucket: "let-talk-cannabis.firebasestorage.app",
  messagingSenderId: "120291030560",
  appId: "1:120291030560:web:32544aa5fb386e3c1bae45",
  measurementId: "G-9VBHPGJ9J4"
});

const messaging = firebase.messaging();

/**
 * Handle background messages
 * This runs when the app is closed or in the background
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background Message received:', payload);

  const notificationTitle = payload.notification?.title || '🌿 Let\'s Talk Cannabis';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'fcm-notification',
    data: payload.data || {},
    requireInteraction: false, // Auto-dismiss after a few seconds
    silent: false,
    vibrate: [200, 100, 200] // Vibration pattern
  };

  // Show the notification to the user
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification clicks
 * When user clicks the notification, bring the app to focus or open Feed
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event.notification);

  event.notification.close();

  // Determine where to navigate based on notification data
  const urlToOpen = event.notification.data?.clickAction || '/feed';

  // Try to focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.focus();
          return client.navigate(urlToOpen);
        }
      }
      // No window open, create a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
