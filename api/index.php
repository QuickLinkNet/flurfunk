<?php

declare(strict_types=1);

// Front-Controller: einziger Einstiegspunkt der API (siehe .htaccess).
// Kein Composer, kein Framework – schlanker eigener Autoloader reicht,
// da wir nur eine Handvoll Klassen pro Ordner haben.
spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\HouseholdController;
use App\Controllers\ChildController;
use App\Controllers\FeedController;
use App\Controllers\CalendarController;
use App\Controllers\VisibilityController;
use App\Controllers\EventController;

error_reporting(E_ALL);
ini_set('display_errors', '0'); // Fehler nie roh an den Client durchreichen

Auth::start();

$router = new Router();

$router->post('/auth/register', [new AuthController(), 'register']);
$router->post('/auth/login', [new AuthController(), 'login']);
$router->post('/auth/logout', [new AuthController(), 'logout']);
$router->get('/auth/me', [new AuthController(), 'me']);

$router->get('/households', [new HouseholdController(), 'index']);
$router->get('/households/me', [new HouseholdController(), 'me']);
$router->put('/households/me', [new HouseholdController(), 'updateMe']);

$router->get('/children', [new ChildController(), 'index']);
$router->post('/children', [new ChildController(), 'store']);
$router->put('/children/{id}', [new ChildController(), 'updateLocation']);

$router->get('/feed', [new FeedController(), 'index']);
$router->post('/feed', [new FeedController(), 'store']);

$router->get('/calendar', [new CalendarController(), 'index']);
$router->post('/calendar', [new CalendarController(), 'store']);

$router->get('/events', [new EventController(), 'index']);
$router->post('/events', [new EventController(), 'store']);
$router->get('/events/{id}', [new EventController(), 'show']);
$router->post('/events/{id}/rsvp', [new EventController(), 'rsvp']);

$router->get('/households/me/visibility', [new VisibilityController(), 'me']);
$router->put('/households/me/visibility', [new VisibilityController(), 'updateMe']);

try {
    $router->dispatch(Request::method(), Request::path());
} catch (Throwable $e) {
    error_log($e->getMessage());
    Response::error('Interner Serverfehler.', 500);
}
