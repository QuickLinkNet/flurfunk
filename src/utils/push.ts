export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

async function serviceWorkerReady(): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Service Worker ist noch nicht aktiv. Seite neu laden und erneut versuchen.')), 8000);
    })
  ]);
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await serviceWorkerReady();
  return registration.pushManager.getSubscription();
}

export async function enablePush(vapidPublicKey: string): Promise<PushSubscriptionJSON> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Berechtigung für Benachrichtigungen wurde nicht erteilt.');
  }
  const registration = await serviceWorkerReady();
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription.toJSON();
  }
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });
  return subscription.toJSON();
}

// Gibt den Endpoint des soeben gekündigten Abos zurück, damit der Server die
// Subscription löschen kann. Wenn kein Abo aktiv war, kommt null zurück.
export async function disablePush(): Promise<string | null> {
  const registration = await serviceWorkerReady();
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
