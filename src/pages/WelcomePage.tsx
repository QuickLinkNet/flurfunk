import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { Button } from '../components/atoms/Button';
import { UserAvatar } from '../components/atoms/UserAvatar';
import { WelcomeStreetMap } from '../components/organisms/WelcomeStreetMap';
import { fetchNeighborHouseholds } from '../api/householdsApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { useAuth } from '../hooks/useAuth';
import type { NeighborHousehold } from '../types/neighbor';

export function WelcomePage() {
  const navigate = useNavigate();
  const { user, uploadAvatarPhoto } = useAuth();
  const [households, setHouseholds] = useState<NeighborHousehold[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNeighborHouseholds()
      .then(setHouseholds)
      .catch(() => setHouseholds([]));
  }, []);

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    setPhotoMessage(null);
    setIsUploadingPhoto(true);
    try {
      await uploadAvatarPhoto(file);
      setPhotoMessage('Profilbild gespeichert.');
    } catch (err) {
      setPhotoMessage(err instanceof Error ? err.message : 'Foto konnte nicht hochgeladen werden.');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  const otherNeighborsCount = households.filter((household) => !household.isOwnHousehold).length;

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.welcome.title} pageSubtitle={PAGE_HEADERS.welcome.subtitle}>
      <section className="welcome-reveal">
        <div className="welcome-reveal-intro">
          <span className="welcome-reveal-emoji" aria-hidden="true">🎉</span>
          <h2>Willkommen in eurer Nachbarschaft!</h2>
          <p>
            {otherNeighborsCount > 0
              ? `Schon ${otherNeighborsCount} weitere${otherNeighborsCount === 1 ? 'r Haushalt ist' : ' Haushalte sind'} dabei - das ist eure Straße:`
              : 'Ihr seid der erste Haushalt in der Straße - bald kommen mehr dazu.'}
          </p>
        </div>

        <WelcomeStreetMap households={households} />

        <div className="welcome-reveal-photo">
          <UserAvatar photoUrl={user?.avatarPhotoUrl} avatarUrl={user?.avatarUrl} fallback={user?.displayName ?? 'Profil'} size={64} />
          <div className="welcome-reveal-photo-copy">
            <strong>Noch ein Foto von dir?</strong>
            <p>Macht es persönlicher - kannst du auch jederzeit später in den Einstellungen ändern.</p>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelected} />
            <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
              {isUploadingPhoto ? 'Lädt...' : user?.avatarPhotoUrl ? 'Foto ändern' : 'Foto hochladen'}
            </Button>
            {photoMessage && <p className="welcome-reveal-photo-message">{photoMessage}</p>}
          </div>
        </div>

        <Button type="button" className="welcome-reveal-cta" onClick={() => navigate('/dashboard', { replace: true })}>
          Los geht's!
        </Button>
      </section>
    </DashboardTemplate>
  );
}
