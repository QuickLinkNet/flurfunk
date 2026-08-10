-- Dateiname des hochgeladenen Profilfotos (server-generiert, siehe
-- AuthController::uploadAvatarPhoto). Getrennt von avatar_url (die
-- vorhandene Icon-Auswahl), damit ein echtes Foto Vorrang hat, aber
-- die Icon-Auswahl als Fallback erhalten bleibt, falls kein Foto gesetzt ist.
ALTER TABLE users ADD COLUMN avatar_photo_path TEXT;
