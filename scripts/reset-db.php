<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Dieses Script darf nur per CLI laufen.\n");
    exit(1);
}

if (!in_array('--yes', $argv, true)) {
    fwrite(STDERR, "Destruktiver Reset. Aufruf: php scripts/reset-db.php --yes\n");
    exit(1);
}

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $parts = explode('\\', $relative);
    $parts[0] = strtolower($parts[0]);
    $path = __DIR__ . '/../api/' . implode('/', $parts) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

use App\Core\Database;

$dbPath = __DIR__ . '/../api/data/database.sqlite';
if (is_file($dbPath)) {
    unlink($dbPath);
}

$pdo = Database::pdo();
$pdo->beginTransaction();

try {
    seedDemoData($pdo);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}

echo "DB zurückgesetzt und Demo-Daten eingespielt.\n";
echo "Login Admin: lisa@example.test / Flurfunk2026!\n";
echo "Login Mitglied: weber@example.test / Flurfunk2026!\n";

function seedDemoData(PDO $pdo): void
{
    $pdo->exec("DELETE FROM household_invites WHERE code = 'ADMIN001'");
    $pdo->exec("DELETE FROM households WHERE name = 'Erster Haushalt' AND address_line = 'bitte in der Verwaltung anpassen'");

    $streetId = (int) $pdo->query('SELECT id FROM streets ORDER BY id LIMIT 1')->fetchColumn();
    $pdo->prepare('UPDATE streets SET name = ? WHERE id = ?')->execute(['Musterstraße 12', $streetId]);

    $households = [
        'muster' => insertHousehold($pdo, $streetId, 'Familie Muster', 'Hausnummer 12', '🏠', 'zuhause'),
        'weber' => insertHousehold($pdo, $streetId, 'Familie Weber', 'Hausnummer 8', '🏖️', 'im Urlaub'),
        'schmidt' => insertHousehold($pdo, $streetId, 'Familie Schmidt', 'Hausnummer 16', '🚲', 'unterwegs'),
        'mueller' => insertHousehold($pdo, $streetId, 'Familie Müller', 'Hausnummer 20', '🆘', 'braucht Hilfe'),
        'richter' => insertHousehold($pdo, $streetId, 'Familie Richter', 'Hausnummer 4', '🏠', 'zuhause'),
    ];

    insertUser($pdo, $households['muster'], 'lisa@example.test', 'Lisa Muster', 'admin');
    insertUser($pdo, $households['weber'], 'weber@example.test', 'Thomas Weber', 'member');
    insertUser($pdo, $households['schmidt'], 'schmidt@example.test', 'Nora Schmidt', 'member');
    insertUser($pdo, $households['mueller'], 'mueller@example.test', 'Mara Müller', 'member');
    insertUser($pdo, $households['richter'], 'richter@example.test', 'Jonas Richter', 'member');

    insertChildren($pdo, $households);
    insertPets($pdo, $households);
    insertFeed($pdo, $households);
    insertEvents($pdo, $households);
    insertCalendar($pdo, $households);
    insertInvites($pdo, $households);
    insertFeatureFlags($pdo, $streetId);
}

function insertHousehold(PDO $pdo, int $streetId, string $name, string $address, string $emoji, string $label): int
{
    $stmt = $pdo->prepare(
        'INSERT INTO households (street_id, name, address_line, status_emoji, status_label, status_updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    );
    $stmt->execute([$streetId, $name, $address, $emoji, $label]);
    return (int) $pdo->lastInsertId();
}

function insertUser(PDO $pdo, int $householdId, string $email, string $name, string $role): int
{
    $stmt = $pdo->prepare(
        'INSERT INTO users (household_id, email, password_hash, display_name, role, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    );
    $stmt->execute([$householdId, $email, password_hash('Flurfunk2026!', PASSWORD_DEFAULT), $name, $role]);
    return (int) $pdo->lastInsertId();
}

function insertChildren(PDO $pdo, array $households): void
{
    $rows = [
        [$households['muster'], 'Mia', 'grandparents', 'bei Oma'],
        [$households['weber'], 'Ben', 'other', 'Fußballtraining 17:00-18:30'],
        [$households['schmidt'], 'Lena', 'both', 'zuhause'],
        [$households['richter'], 'Jonas', 'other', 'Schwimmkurs 16:15-17:00'],
    ];
    $stmt = $pdo->prepare('INSERT INTO children (household_id, name, current_location, location_note) VALUES (?, ?, ?, ?)');
    foreach ($rows as $row) {
        $stmt->execute($row);
    }
}

function insertPets(PDO $pdo, array $households): void
{
    $stmt = $pdo->prepare('INSERT INTO pets (household_id, name, type) VALUES (?, ?, ?)');
    $stmt->execute([$households['richter'], 'Frieda', 'dog']);
    $stmt->execute([$households['muster'], 'Momo', 'cat']);
}

function insertFeed(PDO $pdo, array $households): void
{
    $rows = [
        [$households['weber'], 'tool_available', 'Werkzeug verfügbar: Akkuschrauber kann heute abgeholt werden.', 'neighbors'],
        [$households['schmidt'], 'babysitter_needed', 'Babysitter für Samstagabend gesucht.', 'neighbors'],
        [$households['mueller'], 'street_closed', 'Straße am Freitag zwischen 9 und 12 Uhr gesperrt.', 'neighbors'],
        [$households['richter'], 'package_received', 'Paket für Familie Weber wurde angenommen.', 'neighbors'],
        [$households['weber'], 'vacation', 'Wir sind bis 22.05. im Urlaub.', 'neighbors'],
    ];
    $stmt = $pdo->prepare('INSERT INTO feed_items (household_id, type, message, visibility, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)');
    foreach ($rows as $row) {
        $stmt->execute($row);
    }
}

function insertEvents(PDO $pdo, array $households): void
{
    $rows = [
        [$households['richter'], 'Paketstation im Hof', 'other', 'Innenhof', '+2 hour', '+3 hour'],
        [$households['muster'], 'Grillabend im Innenhof', 'bbq', 'Innenhof', '+1 day 18:00', '+1 day 21:00'],
        [$households['schmidt'], 'Lagerfeuer am Spielplatz', 'campfire', 'Spielplatz', '+1 day 20:00', '+1 day 22:00'],
        [$households['richter'], 'Vatertag-Ausflug', 'other', 'Treffpunkt 10:00 Uhr', '+7 day 10:00', '+7 day 16:00'],
    ];
    $stmt = $pdo->prepare(
        'INSERT INTO events (creator_household_id, title, type, location, starts_at, ends_at, visibility, created_at)
         VALUES (?, ?, ?, ?, ?, ?, "neighbors", CURRENT_TIMESTAMP)'
    );
    foreach ($rows as $row) {
        $stmt->execute([$row[0], $row[1], $row[2], $row[3], date('Y-m-d H:i:s', strtotime($row[4])), date('Y-m-d H:i:s', strtotime($row[5]))]);
    }
}

function insertCalendar(PDO $pdo, array $households): void
{
    $rows = [
        ['street_action', null, 'Kanalreinigung', '+3 day 08:00', '+3 day 12:00', 0],
        ['trash', null, 'Bioabfall', '+1 day 06:00', null, 1],
        ['trash', null, 'Gelber Sack', '+4 day 06:00', null, 1],
        ['trash', null, 'Altpapier', '+8 day 06:00', null, 1],
        ['trash', null, 'Restmüll', '+12 day 06:00', null, 1],
        ['trash', null, 'Altglas', '+15 day 06:00', null, 1],
        ['vacation', $households['weber'], 'Urlaub Familie Weber', 'now', '+12 day 23:59', 1],
    ];
    $stmt = $pdo->prepare(
        'INSERT INTO calendar_entries (type, household_id, title, starts_at, ends_at, all_day, visibility)
         VALUES (?, ?, ?, ?, ?, ?, "neighbors")'
    );
    foreach ($rows as $row) {
        $stmt->execute([
            $row[0],
            $row[1],
            $row[2],
            date('Y-m-d H:i:s', strtotime($row[3])),
            $row[4] !== null ? date('Y-m-d H:i:s', strtotime($row[4])) : null,
            $row[5],
        ]);
    }
}

function insertInvites(PDO $pdo, array $households): void
{
    $rows = [
        [$households['muster'], 'LISA2026', 'Lisa', 'Muster'],
        [$households['richter'], 'JONAS026', 'Jonas', 'Richter'],
    ];
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO household_invites (household_id, code, first_name, last_name) VALUES (?, ?, ?, ?)');
    foreach ($rows as $row) {
        $stmt->execute($row);
    }
}

function insertFeatureFlags(PDO $pdo, int $streetId): void
{
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO feature_flags (street_id, feature_key, enabled) VALUES (?, ?, 1)');
    foreach (['feed', 'events', 'calendar', 'children', 'pets'] as $feature) {
        $stmt->execute([$streetId, $feature]);
    }
}
