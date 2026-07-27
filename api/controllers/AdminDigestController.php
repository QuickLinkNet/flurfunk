<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\MailService;
use App\Core\Response;
use App\Core\TrashReminderService;
use App\Core\WeeklyDigestService;
use App\Models\User;

final class AdminDigestController
{
    public function preview(): void
    {
        $this->requireAdmin();
        Response::json(WeeklyDigestService::build());
    }

    public function sendTest(): void
    {
        $userId = $this->requireAdmin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Admin-Nutzer nicht gefunden.', 404);
        }

        $digest = WeeklyDigestService::build();
        $sent = MailService::sendWeeklyDigest(
            (string) $user['email'],
            (string) $user['display_name'],
            $digest
        );
        if (!$sent) {
            Response::error('Digest-Test konnte nicht gesendet werden.', 500);
        }

        Response::json([
            'sentTo' => (string) $user['email'],
            'digest' => $digest,
        ]);
    }

    public function sendAll(): void
    {
        $this->requireAdmin();
        Response::json(WeeklyDigestService::sendToAllRecipients(($_GET['force'] ?? '') === '1'));
    }

    public function cronSend(): void
    {
        $this->requireCronToken();
        Response::json(WeeklyDigestService::sendToAllRecipients(false));
    }

    public function trashReminderPreview(): void
    {
        $this->requireAdmin();
        Response::json(TrashReminderService::previewForTomorrow());
    }

    public function sendTrashReminderNow(): void
    {
        $this->requireAdmin();
        Response::json(TrashReminderService::sendForTomorrow());
    }

    public function cronSendTrashReminder(): void
    {
        $this->requireCronToken();
        Response::json(TrashReminderService::sendForTomorrow());
    }

    private function requireCronToken(): void
    {
        $config = require __DIR__ . '/../config.php';
        $configuredToken = trim((string) ($config['cron']['token'] ?? ''));
        $requestToken = trim((string) ($_GET['token'] ?? ($_SERVER['HTTP_X_CRON_TOKEN'] ?? '')));

        if ($configuredToken === '') {
            Response::error('Cron-Token ist nicht konfiguriert.', 503);
        }
        if (!hash_equals($configuredToken, $requestToken)) {
            Response::error('Cron-Token ungültig.', 403);
        }
    }

    private function requireAdmin(): int
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['role'] !== 'admin') {
            Response::error('Nur Admins dürfen diese Funktion nutzen.', 403);
        }
        return $userId;
    }
}
