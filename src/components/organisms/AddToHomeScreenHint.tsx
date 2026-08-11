import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'flurfunk.a2hs.dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

export function AddToHomeScreenHint() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const [installed, setInstalled] = useState(() => isStandalone());
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  async function handleInstallClick() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallEvent(null);
    }
  }

  const ios = isIOS();

  if (installed || dismissed || (!ios && !installEvent)) {
    return null;
  }

  return (
    <div className="a2hs-hint">
      <span className="a2hs-hint-icon" aria-hidden="true">📲</span>
      <div className="a2hs-hint-body">
        <strong>Flurfunk zum Home-Bildschirm hinzufügen</strong>
        {ios ? (
          <p>
            Tippe unten auf <strong>Teilen</strong> und dann auf <strong>„Zum Home-Bildschirm“</strong> - sonst kommen
            auf dem iPhone keine Push-Benachrichtigungen an.
          </p>
        ) : (
          <p>Installiere Flurfunk als App für schnelleren Zugriff und zuverlässige Push-Benachrichtigungen.</p>
        )}
      </div>
      <div className="a2hs-hint-actions">
        {!ios && installEvent && (
          <button type="button" className="a2hs-hint-install" onClick={handleInstallClick}>
            Installieren
          </button>
        )}
        <button type="button" className="a2hs-hint-dismiss" onClick={dismiss} aria-label="Hinweis schließen">
          ✕
        </button>
      </div>
    </div>
  );
}
