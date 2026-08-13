<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\MailService;
use App\Core\Request;
use App\Core\Response;
use App\Models\Household;
use App\Models\HouseholdInvite;
use App\Models\LoginAttempt;
use App\Models\PasswordReset;
use App\Models\User;

final class AuthController
{
    private const AVATAR_KEYS = ['home', 'garden', 'family', 'bike', 'coffee', 'star', 'heart', 'tree'];

    // Öffentlich: zeigt vor der eigentlichen Registrierung, für wen der Code
    // gedacht ist (Name + Haushalt), ohne dass man sich schon einloggen muss.
    public function invitePreview(array $params): void
    {
        $invite = HouseholdInvite::findByCode((string) ($params['code'] ?? ''));
        if ($invite === null || $invite['used_at'] !== null || ($invite['revoked_at'] ?? null) !== null) {
            Response::error('Einladungscode ungültig oder bereits verwendet.', 404);
        }
        $household = Household::findById((int) $invite['household_id']);
        Response::json([
            'firstName' => $invite['first_name'],
            'lastName' => $invite['last_name'],
            'householdName' => $household['name'] ?? null,
        ]);
    }

    public function register(): void
    {
        $body = Request::json();
        $email = strtolower(trim($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $code = strtoupper(preg_replace('/\s+/', '', (string) ($body['code'] ?? '')));

        if ($email === '' || strlen($password) < 8 || $code === '') {
            Response::error('Bitte alle Felder ausfüllen (Passwort mind. 8 Zeichen).', 422);
        }
        $pdo = Database::pdo();
        $role = User::adminExists() ? 'member' : 'admin';
        $userId = 0;

        $pdo->beginTransaction();
        try {
            if (User::findByEmail($email) !== null) {
                $pdo->rollBack();
                Response::error('Diese E-Mail ist bereits registriert.', 409);
            }

            $freshInvite = HouseholdInvite::findByCode($code);
            if ($freshInvite === null || $freshInvite['used_at'] !== null || ($freshInvite['revoked_at'] ?? null) !== null) {
                $pdo->rollBack();
                Response::error('Einladungscode ungültig oder bereits verwendet.', 422);
            }

            $displayName = trim($freshInvite['first_name'] . ' ' . $freshInvite['last_name']);
            $userId = User::create($email, password_hash($password, PASSWORD_DEFAULT), $displayName, $role);
            User::attachHousehold($userId, (int) $freshInvite['household_id']);
            if (!HouseholdInvite::markUsed((int) $freshInvite['id'], $userId)) {
                $pdo->rollBack();
                Response::error('Einladungscode wurde gerade verwendet. Bitte neuen Code anfordern.', 409);
            }
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        Auth::login($userId);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function login(): void
    {
        $body = Request::json();
        $email = trim($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        if (LoginAttempt::isBlocked($email, $ip)) {
            Response::error('Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.', 429);
        }

        $user = User::findByEmail($email);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            LoginAttempt::recordFailure($email, $ip);
            Response::error('E-Mail oder Passwort ist falsch.', 401);
        }

        LoginAttempt::clear($email);
        $remember = !array_key_exists('remember', $body) || (bool) $body['remember'];
        Auth::login((int) $user['id'], $remember);
        Response::json($this->toPublicUser($user));
    }

    public function logout(): void
    {
        Auth::logout();
        Response::json(null);
    }

    public function requestPasswordReset(): void
    {
        $body = Request::json();
        $email = strtolower(trim($body['email'] ?? ''));
        if ($email === '') {
            Response::error('Bitte E-Mail-Adresse angeben.', 422);
        }

        $user = User::findByEmail($email);
        if ($user !== null) {
            $token = PasswordReset::create((int) $user['id']);
            MailService::sendPasswordReset($email, (string) $user['display_name'], $token);
        }

        // Bewusst immer dieselbe Antwort, egal ob die E-Mail existiert -
        // sonst liesse sich damit erraten, wer registriert ist.
        Response::json(['message' => 'Falls diese E-Mail-Adresse registriert ist, haben wir einen Link zum Zurücksetzen geschickt.']);
    }

    public function confirmPasswordReset(): void
    {
        $body = Request::json();
        $token = trim((string) ($body['token'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($token === '' || strlen($password) < 8) {
            Response::error('Bitte einen gültigen Link verwenden und ein Passwort mit mind. 8 Zeichen wählen.', 422);
        }

        $reset = PasswordReset::findValidByToken($token);
        if ($reset === null) {
            Response::error('Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.', 422);
        }

        User::updatePassword((int) $reset['user_id'], password_hash($password, PASSWORD_DEFAULT));
        PasswordReset::markUsed((int) $reset['id']);

        Response::json(['message' => 'Passwort wurde geändert. Du kannst dich jetzt anmelden.']);
    }

    public function completeOnboarding(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 422);
        }
        $household = Household::findById((int) $user['household_id']);
        if ($household === null) {
            Response::error('Haushalt nicht gefunden.', 404);
        }
        $missing = [];
        if (trim((string) ($household['name'] ?? '')) === '') {
            $missing[] = 'Haushaltsname';
        }
        if (trim((string) ($household['address_line'] ?? '')) === '') {
            $missing[] = 'Adresse';
        }
        if ($missing !== []) {
            Response::error('Bitte ergänze zuerst: ' . implode(', ', $missing) . '.', 422);
        }
        User::completeOnboarding($userId);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function saveOnboardingProgress(): void
    {
        $userId = Auth::requireLogin();
        $body = Request::json();
        $step = (string) ($body['step'] ?? '');
        if (!in_array($step, ['household', 'family', 'privacy', 'push'], true)) {
            Response::error('Ungültiger Onboarding-Schritt.', 422);
        }
        User::updateOnboardingProgress($userId, $step);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function me(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }
        Response::json($this->toPublicUser($user));
    }

    public function updateProfile(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $body = Request::json();
        $displayName = trim((string) ($body['displayName'] ?? ''));
        if ($displayName === '') {
            Response::error('Name darf nicht leer sein.', 422);
        }
        if ((function_exists('mb_strlen') ? mb_strlen($displayName) : strlen($displayName)) > 120) {
            Response::error('Name ist zu lang.', 422);
        }
        $avatarUrl = isset($body['avatarUrl']) ? trim((string) $body['avatarUrl']) : ($user['avatar_url'] ?? null);
        if ($avatarUrl !== null && $avatarUrl !== '' && !in_array($avatarUrl, self::AVATAR_KEYS, true)) {
            Response::error('Ungültiges Profilbild.', 422);
        }

        [$birthdayMonth, $birthdayDay] = $this->normalizeBirthday($body['birthdayMonth'] ?? null, $body['birthdayDay'] ?? null);

        User::updateProfile($userId, $displayName, $avatarUrl !== '' ? $avatarUrl : null);
        User::updateBirthday($userId, $birthdayMonth, $birthdayDay);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    private function normalizeBirthday(mixed $month, mixed $day): array
    {
        $month = $month !== null && $month !== '' ? (int) $month : null;
        $day = $day !== null && $day !== '' ? (int) $day : null;
        if ($month === null || $day === null) {
            return [null, null];
        }
        if ($month < 1 || $month > 12 || $day < 1 || $day > 31) {
            Response::error('Ungültiges Geburtsdatum.', 422);
        }
        return [$month, $day];
    }

    // Echtes Foto statt nur der festen Icon-Auswahl (AVATAR_KEYS). Getrennt
    // gespeichert (users.avatar_photo_path) - ein Foto hat beim Anzeigen
    // Vorrang, die Icon-Auswahl bleibt als Fallback erhalten.
    public function uploadAvatarPhoto(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $file = $_FILES['photo'] ?? null;
        if ($file === null || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            Response::error('Bitte ein Bild auswählen.', 422);
        }
        if ($file['size'] > 4 * 1024 * 1024) {
            Response::error('Bild ist zu groß (max. 4 MB).', 422);
        }

        $info = @getimagesize($file['tmp_name']);
        $creators = ['image/jpeg' => 'imagecreatefromjpeg', 'image/png' => 'imagecreatefrompng', 'image/webp' => 'imagecreatefromwebp'];
        if ($info === false || !isset($creators[$info['mime']])) {
            Response::error('Bitte ein JPG-, PNG- oder WebP-Bild hochladen.', 422);
        }

        $creator = $creators[$info['mime']];
        $source = @$creator($file['tmp_name']);
        if ($source === false) {
            Response::error('Bild konnte nicht gelesen werden.', 422);
        }

        // Mittig auf Quadrat zuschneiden, dann auf einheitliche Avatar-Größe
        // bringen - kein manuelles Zuschneiden im Frontend nötig.
        $srcWidth = imagesx($source);
        $srcHeight = imagesy($source);
        $side = min($srcWidth, $srcHeight);
        $srcX = (int) (($srcWidth - $side) / 2);
        $srcY = (int) (($srcHeight - $side) / 2);

        $size = 320;
        $dest = imagecreatetruecolor($size, $size);
        imagecopyresampled($dest, $source, 0, 0, $srcX, $srcY, $size, $size, $side, $side);
        imagedestroy($source);

        $dir = dirname(User::avatarPhotoFilePath('x'));
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            imagedestroy($dest);
            Response::error('Speicherordner konnte nicht angelegt werden.', 500);
        }

        $filename = $userId . '-' . bin2hex(random_bytes(8)) . '.jpg';
        $saved = imagejpeg($dest, User::avatarPhotoFilePath($filename), 85);
        imagedestroy($dest);
        if (!$saved) {
            Response::error('Bild konnte nicht gespeichert werden.', 500);
        }

        $this->deleteOldAvatarPhotoFile($user);
        User::updateAvatarPhoto($userId, $filename);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function deleteAvatarPhoto(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $this->deleteOldAvatarPhotoFile($user);
        User::updateAvatarPhoto($userId, null);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    private function deleteOldAvatarPhotoFile(array $user): void
    {
        $existing = $user['avatar_photo_path'] ?? null;
        if ($existing === null) {
            return;
        }
        $path = User::avatarPhotoFilePath($existing);
        if (is_file($path)) {
            @unlink($path);
        }
    }

    public function updatePassword(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $body = Request::json();
        $currentPassword = (string) ($body['currentPassword'] ?? '');
        $newPassword = (string) ($body['newPassword'] ?? '');
        if (!password_verify($currentPassword, $user['password_hash'])) {
            Response::error('Aktuelles Passwort ist falsch.', 401);
        }
        if (strlen($newPassword) < 8) {
            Response::error('Neues Passwort muss mindestens 8 Zeichen haben.', 422);
        }

        User::updatePassword($userId, password_hash($newPassword, PASSWORD_DEFAULT));
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function updateDigestPreference(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $body = Request::json();
        User::updateDigestPreference($userId, (bool) ($body['weeklyDigestEnabled'] ?? false));
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function deleteMe(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }
        if (($user['role'] ?? '') === 'admin' && User::adminCount() <= 1) {
            Response::error('Der letzte Admin kann sein Konto nicht selbst löschen. Ernennen Sie zuerst einen weiteren Admin.', 422);
        }

        User::delete($userId);
        Auth::logout();
        Response::json(null);
    }

    public function exportMe(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }
        $householdId = $user['household_id'] !== null ? (int) $user['household_id'] : null;
        $pdo = Database::pdo();

        Response::json([
            'exportedAt' => gmdate('c'),
            'user' => $this->toPublicUser($user),
            'household' => $householdId !== null ? Household::findById($householdId) : null,
            'visibilitySettings' => $householdId !== null ? $this->rows('SELECT field_key, visibility FROM household_visibility_settings WHERE household_id = ?', [$householdId]) : [],
            'children' => $householdId !== null ? $this->rows('SELECT name, birthdate, current_location, location_note, updated_at FROM children WHERE household_id = ?', [$householdId]) : [],
            'pets' => $householdId !== null ? $this->rows('SELECT name, type FROM pets WHERE household_id = ?', [$householdId]) : [],
            'feedItems' => $householdId !== null ? $this->rows('SELECT type, message, visibility, expires_at, created_at FROM feed_items WHERE household_id = ?', [$householdId]) : [],
            'feedComments' => $this->rows('SELECT message, created_at FROM feed_comments WHERE user_id = ?', [$userId]),
            'feedReactions' => $this->rows('SELECT feed_item_id, created_at FROM feed_reactions WHERE user_id = ?', [$userId]),
            'events' => $householdId !== null ? $this->rows('SELECT title, type, description, location, starts_at, ends_at, visibility, created_at FROM events WHERE creator_household_id = ?', [$householdId]) : [],
            'eventResponses' => $this->rows('SELECT event_id, response, adults_count, children_count, note, updated_at FROM event_responses WHERE responded_by_user_id = ?', [$userId]),
            'calendarEntries' => $householdId !== null ? $this->rows('SELECT type, title, starts_at, ends_at, all_day, visibility, recurrence_rule, recurrence_until FROM calendar_entries WHERE household_id = ?', [$householdId]) : [],
            'pushSubscriptions' => $this->rows('SELECT endpoint, created_at FROM push_subscriptions WHERE user_id = ?', [$userId]),
        ]);
    }

    private function rows(string $sql, array $params): array
    {
        $stmt = Database::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    private function toPublicUser(array $user): array
    {
        return User::toPublic($user);
    }
}
