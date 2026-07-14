/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const APP_SHELL_URL = '/apps/neighborhood/';
const OFFLINE_HTML = [
  '<!doctype html>',
  '<html lang="de">',
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Flurfunk offline</title></head>',
  '<body><main style="font-family:system-ui,sans-serif;padding:24px"><h1>Flurfunk ist offline</h1><p>Bitte stelle eine Verbindung her und lade die App erneut.</p></main></body>',
  '</html>'
].join('');

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedShell = await caches.match(APP_SHELL_URL);
      if (cachedShell) return cachedShell;

      return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    })
  );
});

// Bewusst payload-lose Pushes (siehe api/core/WebPush.php): Der Server
// verschickt keinen verschlüsselten Inhalt, nur ein Weck-Signal. Der Text
// hier ist deshalb generisch, bis echte Ereignisse unterschiedliche Inhalte
// brauchen.
self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Flurfunk', {
      body: 'Neue Aktivität im Flurfunk.',
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
