<?php

// Wird ganz normal mit deployed. Enthält seit SQLite keine Zugangsdaten mehr.

// Cron-Token bevorzugt aus einer lokalen, nicht versionierten Datei lesen
// (api/cron-token.local.php, wird vom Deploy-Skript wie jede andere Datei
// mit hochgeladen). Das ist zuverlässiger als eine Server-Umgebungsvariable,
// die bei PHP-FPM auf Shared-Hosting nicht immer ankommt. Fällt sonst auf
// FLURFUNK_CRON_TOKEN zurück, falls die Umgebungsvariable doch gesetzt ist.
$cronTokenFile = __DIR__ . '/cron-token.local.php';
$cronToken = is_file($cronTokenFile) ? trim((string) require $cronTokenFile) : '';
if ($cronToken === '') {
    $cronToken = getenv('FLURFUNK_CRON_TOKEN') ?: '';
}

return [
    'db' => [
        // Liegt unter api/data/, das per .htaccess vor direktem Web-Zugriff
        // geschützt ist.
        'path' => __DIR__ . '/data/database.sqlite',
    ],
    'session_name' => 'nachbarn_session',
    'cron' => [
        // /api/cron/weekly-digest?token=... und /api/cron/trash-reminder?token=...
        // per Plesk "Geplante Aufgabe" (URL abrufen) aufrufen lassen.
        'token' => $cronToken,
    ],
];
