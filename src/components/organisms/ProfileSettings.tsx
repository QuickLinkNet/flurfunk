import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { UserAvatar } from '../atoms/UserAvatar';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { exportMe } from '../../api/authApi';
import { HOUSEHOLD_AVATARS } from '../../utils/householdAvatar';

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export function ProfileSettings() {
  const { user, updateProfile, uploadAvatarPhoto, deleteAvatarPhoto, updatePassword, deleteMe } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? 'home');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setAvatarUrl(user?.avatarUrl ?? 'home');
  }, [user?.avatarUrl, user?.displayName]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    const normalizedName = displayName.trim();
    setProfileMessage(null);
    if (!normalizedName) {
      setProfileMessage('Name darf nicht leer sein.');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(normalizedName, avatarUrl);
      setProfileMessage('Profil gespeichert.');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Profil konnte nicht gespeichert werden.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);
    if (!currentPassword) {
      setPasswordMessage('Bitte aktuelles Passwort eingeben.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('Neues Passwort muss mindestens 8 Zeichen haben.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Passwort geändert.');
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : 'Passwort konnte nicht geändert werden.');
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteMe() {
    setDeleteMessage(null);
    setIsDeleting(true);
    try {
      await deleteMe();
      navigate('/login', { replace: true });
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : 'Konto konnte nicht gelöscht werden.');
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    setPhotoMessage(null);
    if (!file.type.startsWith('image/')) {
      setPhotoMessage('Bitte eine Bilddatei auswählen.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoMessage('Bild ist zu groß (max. 4 MB).');
      return;
    }
    setIsUploadingPhoto(true);
    try {
      await uploadAvatarPhoto(file);
      setPhotoMessage('Profilbild aktualisiert.');
    } catch (error) {
      setPhotoMessage(error instanceof Error ? error.message : 'Foto konnte nicht hochgeladen werden.');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handlePhotoDelete() {
    setPhotoMessage(null);
    setIsUploadingPhoto(true);
    try {
      await deleteAvatarPhoto();
      setPhotoMessage('Profilbild entfernt.');
    } catch (error) {
      setPhotoMessage(error instanceof Error ? error.message : 'Foto konnte nicht entfernt werden.');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleExport() {
    setExportMessage(null);
    try {
      const data = await exportMe();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `flurfunk-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportMessage('Export erstellt.');
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : 'Export konnte nicht erstellt werden.');
    }
  }

  return (
    <div className="profile-settings">
      <form className="profile-settings-card profile-settings-card--featured" onSubmit={handleProfileSubmit}>
        <div className="profile-settings-card-header">
          <UserAvatar avatarUrl={avatarUrl} photoUrl={user?.avatarPhotoUrl} fallback={displayName || user?.email || 'Profil'} size={56} />
          <div>
            <h3>Profil</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-settings-field">
          <span>Profilfoto</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoSelected}
          />
          <div className="profile-photo-actions">
            <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
              {isUploadingPhoto ? 'Lädt...' : user?.avatarPhotoUrl ? 'Foto ändern' : 'Foto hochladen'}
            </Button>
            {user?.avatarPhotoUrl && (
              <Button type="button" variant="ghost" onClick={handlePhotoDelete} disabled={isUploadingPhoto}>
                Foto entfernen
              </Button>
            )}
          </div>
          {photoMessage && <p className="profile-settings-message">{photoMessage}</p>}
        </div>

        <label className="profile-settings-field">
          <span>Anzeigename</span>
          <Input
            autoComplete="name"
            placeholder="Anzeigename"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>

        <div className="profile-settings-field">
          <span>Profilbild</span>
          <div className="profile-avatar-picker" role="radiogroup" aria-label="Profilbild auswählen">
            {HOUSEHOLD_AVATARS.map((avatar) => (
              <button
                key={avatar.key}
                type="button"
                data-active={avatarUrl === avatar.key}
                onClick={() => setAvatarUrl(avatar.key)}
              >
                <span style={{ background: avatar.background }}>{avatar.emoji}</span>
                {avatar.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isSavingProfile}>
          {isSavingProfile ? 'Speichert...' : 'Profil speichern'}
        </Button>
        {profileMessage && <p className="profile-settings-message">{profileMessage}</p>}
      </form>

      <form className="profile-settings-card" onSubmit={handlePasswordSubmit}>
        <div>
          <h3>Passwort</h3>
          <p>Ändere dein Passwort für dieses Konto.</p>
        </div>
        <label className="profile-settings-field">
          <span>Aktuelles Passwort</span>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Aktuelles Passwort"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>
        <label className="profile-settings-field">
          <span>Neues Passwort</span>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Mindestens 8 Zeichen"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={isSavingPassword}>
          {isSavingPassword ? 'Speichert...' : 'Passwort ändern'}
        </Button>
        {passwordMessage && <p className="profile-settings-message">{passwordMessage}</p>}
      </form>

      <section className="profile-settings-card">
        <div>
          <h3>Datenauskunft</h3>
          <p>Lade deine gespeicherten Konto-, Haushalts- und Aktivitätsdaten als JSON herunter.</p>
        </div>
        <Button type="button" variant="ghost" onClick={handleExport}>
          Daten exportieren
        </Button>
        {exportMessage && <p className="profile-settings-message">{exportMessage}</p>}
      </section>

      <section className="profile-settings-card profile-settings-danger">
        <div>
          <h3>Konto löschen</h3>
          <p>Dein Nutzerkonto, Push-Abos, Kommentare und Reaktionen werden entfernt. Haushaltsdaten bleiben bestehen.</p>
        </div>
        <Button type="button" variant="ghost" onClick={() => setConfirmDeleteOpen(true)}>
          Konto löschen
        </Button>
        {deleteMessage && <p className="profile-settings-message">{deleteMessage}</p>}
      </section>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Konto wirklich löschen?"
        description="Diese Aktion entfernt deinen Nutzeraccount dauerhaft. Der letzte Admin kann sein Konto aus Sicherheitsgründen nicht selbst löschen."
        confirmLabel="Konto löschen"
        loading={isDeleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteMe}
      />
    </div>
  );
}
