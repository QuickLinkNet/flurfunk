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

// Server verschickt jetzt echte, verschlüsselte Payloads (siehe
// api/core/WebPush.php, RFC 8291). Fällt auf generischen Text zurück,
// falls doch mal ein payload-loser Push ankommt (z. B. altes Verhalten
// oder fehlende p256dh/auth-Werte).
self.addEventListener('push', (event) => {
  let title = 'Flurfunk';
  let body = 'Neue Aktivität im Flurfunk.';
  let url = '/apps/neighborhood/';

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title ?? title;
      body = data.body ?? body;
      url = data.url ?? url;
    } catch {
      body = event.data.text() || body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/apps/neighborhood/icons/icon-192.png',
      badge: '/apps/neighborhood/icons/icon-192.png',
      data: { url }
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
