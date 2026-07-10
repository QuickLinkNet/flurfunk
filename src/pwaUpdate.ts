import { registerSW } from 'virtual:pwa-register';

// Registriert den Service Worker und erzwingt bei einer neuen Version sofort
// Aktivierung + Neuladen der Seite - sonst bleibt ein bereits offener Tab
// (bzw. installierte PWA) auf unbestimmte Zeit auf der alten, gecachten
// Version hängen, da ein neuer Service Worker zwar heruntergeladen, aber
// ohne das hier nie aktiv wird.
export function initPwaUpdate(): void {
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateServiceWorker(true);
    }
  });
}
