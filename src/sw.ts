/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Bewusst payload-lose Pushes (siehe api/core/WebPush.php) - der Server
// verschickt keinen verschlüsselten Inhalt, nur ein Weck-Signal. Der Text
// hier ist deshalb generisch, bis eine echte Ereignis-Anbindung (neuer
// Feed-Post etc.) einen Grund für unterschiedliche Inhalte liefert.
self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Nachbarn – Straßenplaner', {
      body: 'Test-Benachrichtigung — Push-Benachrichtigungen funktionieren!',
      icon: '/apps/neighborhood/icons/icon-192.png',
      badge: '/apps/neighborhood/icons/icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/apps/neighborhood/');
    })
  );
});
