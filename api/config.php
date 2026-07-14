<?php

// Wird ganz normal mit deployed. Enthält seit SQLite keine Zugangsdaten mehr.
return [
    'db' => [
        // Liegt unter api/data/, das per .htaccess vor direktem Web-Zugriff
        // geschützt ist.
        'path' => __DIR__ . '/data/database.sqlite',
    ],
    'session_name' => 'nachbarn_session',
];
