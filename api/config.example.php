<?php
// Kopieren nach config.php. Die Standardwerte funktionieren ohne Änderung,
// da SQLite keine separaten Zugangsdaten braucht (siehe README).
// config.php wird NICHT versioniert (siehe .gitignore).
return [
    'db' => [
        // Pfad zur SQLite-Datei. Liegt unter api/data/, das per .htaccess
        // vor direktem Web-Zugriff geschützt ist (siehe api/data/.htaccess).
        'path' => __DIR__ . '/data/database.sqlite',
    ],
    'session_name' => 'nachbarn_session',
    'cors_origin' => null, // null = gleiche Domain, kein CORS nötig
];
