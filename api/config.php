<?php

// Wird ganz normal mit deployed. Enthält seit SQLite keine Zugangsdaten mehr.
return [
    'db' => [
        // Liegt unter api/data/, das per .htaccess vor direktem Web-Zugriff
        // geschützt ist.
        'path' => __DIR__ . '/data/database.sqlite',
    ],
    'session_name' => 'nachbarn_session',
    'cron' => [
        // Optional: FLURFUNK_CRON_TOKEN serverseitig setzen und dann
        // /api/cron/weekly-digest?token=... per Web-Cron aufrufen.
        'token' => getenv('FLURFUNK_CRON_TOKEN') ?: '',
    ],
];
