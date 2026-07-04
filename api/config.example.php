<?php
// Kopieren nach config.php und mit echten Zugangsdaten füllen.
// config.php wird NICHT versioniert (siehe .gitignore).
return [
    'db' => [
        'host' => '127.0.0.1',
        'name' => 'nachbarn',
        'user' => 'nachbarn_user',
        'pass' => 'change-me',
        'charset' => 'utf8mb4',
    ],
    'session_name' => 'nachbarn_session',
    'cors_origin' => null, // null = gleiche Domain, kein CORS nötig
];
