<?php
// Wird ganz normal mit deployed (kein Geheimnis mehr enthalten, da SQLite
// keine Zugangsdaten braucht). Nur ändern, falls du den DB-Dateipfad,
// den Session-Namen oder eine andere Domain für CORS brauchst.
return [
    'db' => [
        // Pfad zur SQLite-Datei. Liegt unter api/data/, das per .htaccess
        // vor direktem Web-Zugriff geschützt ist (siehe api/data/.htaccess).
        'path' => __DIR__ . '/data/database.sqlite',
    ],
    'session_name' => 'nachbarn_session',
    'cors_origin' => null, // null = gleiche Domain, kein CORS nötig
];
