/* Firebase Cloud Messaging service worker - background web push only */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBQL_RnE6MSZFO07LBL9__FSbGOPZk_wK4',
  authDomain: 'meoo-tech.firebaseapp.com',
  projectId: 'meoo-tech',
  storageBucket: 'meoo-tech.firebasestorage.app',
  messagingSenderId: '632657114689',
  appId: '1:632657114689:web:ac8fe713b915b2d34f38c0',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'CORE';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/app-icon.png',
    badge: '/app-icon.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          w.navigate(url);
          return w.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// No fetch handler — this worker is messaging-only.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
