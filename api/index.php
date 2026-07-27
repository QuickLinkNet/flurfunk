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
    $parts = explode('\\', $relative);
    // Ordner liegen bewusst lowercase (core/controllers/models), Namespaces
    // aber PascalCase (App\Core\...) - auf Windows (case-insensitiv) fällt
    // das nicht auf, auf Linux-Servern (case-sensitiv) schon.
    $parts[0] = strtolower($parts[0]);
    $path = __DIR__ . '/' . implode('/', $parts) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

use App\Core\Auth;
use App\Core\Cors;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\HouseholdController;
use App\Controllers\ChildController;
use App\Controllers\PetController;
use App\Controllers\FeedController;
use App\Controllers\CalendarController;
use App\Controllers\DashboardController;
use App\Controllers\VisibilityController;
use App\Controllers\EventController;
use App\Controllers\AdminController;
use App\Controllers\AdminDigestController;
use App\Controllers\AdminPushController;
use App\Controllers\FeatureFlagController;
use App\Controllers\PushController;

error_reporting(E_ALL);
ini_set('display_errors', '0'); // Fehler nie roh an den Client durchreichen

Cors::handlePreflight();
Cors::apply();
Auth::start();

$router = new Router();

$router->get('/invites/{code}', [new AuthController(), 'invitePreview']);
$router->post('/auth/register', [new AuthController(), 'register']);
$router->post('/auth/login', [new AuthController(), 'login']);
$router->post('/auth/logout', [new AuthController(), 'logout']);
$router->post('/auth/password-reset/request', [new AuthController(), 'requestPasswordReset']);
$router->post('/auth/password-reset/confirm', [new AuthController(), 'confirmPasswordReset']);
$router->post('/auth/onboarding/complete', [new AuthController(), 'completeOnboarding']);
$router->post('/auth/onboarding/progress', [new AuthController(), 'saveOnboardingProgress']);
$router->get('/auth/me', [new AuthController(), 'me']);
$router->get('/auth/me/export', [new AuthController(), 'exportMe']);
$router->put('/auth/me/profile', [new AuthController(), 'updateProfile']);
$router->put('/auth/me/password', [new AuthController(), 'updatePassword']);
$router->put('/auth/me/digest-preference', [new AuthController(), 'updateDigestPreference']);
$router->delete('/auth/me', [new AuthController(), 'deleteMe']);

$router->get('/dashboard', [new DashboardController(), 'index']);

$router->get('/households', [new HouseholdController(), 'index']);
$router->get('/households/neighbors', [new HouseholdController(), 'neighbors']);
$router->get('/households/me', [new HouseholdController(), 'me']);
$router->put('/households/me', [new HouseholdController(), 'updateMe']);
$router->post('/neighbors/invite', [new HouseholdController(), 'inviteNeighbor']);

$router->get('/children', [new ChildController(), 'index']);
$router->post('/children', [new ChildController(), 'store']);
$router->put('/children/{id}', [new ChildController(), 'updateLocation']);
$router->delete('/children/{id}', [new ChildController(), 'destroy']);

$router->get('/pets', [new PetController(), 'index']);
$router->post('/pets', [new PetController(), 'store']);
$router->put('/pets/{id}', [new PetController(), 'update']);
$router->delete('/pets/{id}', [new PetController(), 'destroy']);

$router->get('/feed', [new FeedController(), 'index']);
$router->post('/feed', [new FeedController(), 'store']);
$router->post('/feed/{id}/reaction', [new FeedController(), 'toggleReaction']);
$router->post('/feed/{id}/comments', [new FeedController(), 'addComment']);
$router->put('/feed/{id}/status', [new FeedController(), 'updateStatus']);
$router->post('/feed/{id}/helpers', [new FeedController(), 'toggleHelper']);
$router->post('/feed/{id}/loan', [new FeedController(), 'borrowItem']);
$router->post('/feed/{id}/loan/return', [new FeedController(), 'returnItem']);

$router->get('/calendar', [new CalendarController(), 'index']);
$router->post('/calendar', [new CalendarController(), 'store']);
$router->put('/calendar/{id}', [new CalendarController(), 'update']);
$router->delete('/calendar/{id}', [new CalendarController(), 'destroy']);

$router->get('/events', [new EventController(), 'index']);
$router->post('/events', [new EventController(), 'store']);
$router->get('/events/{id}', [new EventController(), 'show']);
$router->put('/events/{id}', [new EventController(), 'update']);
$router->delete('/events/{id}', [new EventController(), 'destroy']);
$router->post('/events/{id}/rsvp', [new EventController(), 'rsvp']);

$router->get('/households/me/visibility', [new VisibilityController(), 'me']);
$router->put('/households/me/visibility', [new VisibilityController(), 'updateMe']);

$router->get('/feature-flags', [new FeatureFlagController(), 'index']);
$router->put('/admin/feature-flags', [new FeatureFlagController(), 'update']);

$router->get('/push/vapid-public-key', [new PushController(), 'vapidPublicKey']);
$router->get('/push/status', [new PushController(), 'status']);
$router->post('/push/subscribe', [new PushController(), 'subscribe']);
$router->post('/push/unsubscribe', [new PushController(), 'unsubscribe']);
$router->post('/push/test', [new PushController(), 'test']);

$router->get('/admin/households', [new AdminController(), 'households']);
$router->post('/admin/households', [new AdminController(), 'createHousehold']);
$router->put('/admin/households/{id}', [new AdminController(), 'updateHousehold']);
$router->post('/admin/households/{id}/invites', [new AdminController(), 'addInvite']);
$router->delete('/admin/households/{id}', [new AdminController(), 'deleteHousehold']);
$router->post('/admin/invites/{id}/send-email', [new AdminController(), 'sendInviteEmail']);
$router->delete('/admin/invites/{id}', [new AdminController(), 'revokeInvite']);
$router->get('/admin/users', [new AdminController(), 'users']);
$router->put('/admin/users/{id}/role', [new AdminController(), 'updateUserRole']);
$router->delete('/admin/users/{id}', [new AdminController(), 'deleteUser']);
$router->post('/admin/users/{id}/push-test', [new AdminPushController(), 'sendUserPushTest']);
$router->get('/admin/feed', [new AdminController(), 'feed']);
$router->delete('/admin/feed/{id}', [new AdminController(), 'deleteFeedItem']);
$router->get('/admin/events', [new AdminController(), 'events']);
$router->delete('/admin/events/{id}', [new AdminController(), 'deleteEvent']);
$router->get('/admin/calendar', [new AdminController(), 'calendar']);
$router->delete('/admin/calendar/{id}', [new AdminController(), 'deleteCalendarEntry']);
$router->get('/admin/notices', [new AdminController(), 'notices']);
$router->post('/admin/notices', [new AdminController(), 'createNotice']);
$router->delete('/admin/notices/{id}', [new AdminController(), 'deleteNotice']);
$router->get('/admin/system-status', [new AdminController(), 'systemStatus']);
$router->get('/admin/digest/preview', [new AdminDigestController(), 'preview']);
$router->post('/admin/digest/test', [new AdminDigestController(), 'sendTest']);
$router->post('/admin/digest/send-all', [new AdminDigestController(), 'sendAll']);
$router->get('/cron/weekly-digest', [new AdminDigestController(), 'cronSend']);

try {
    $router->dispatch(Request::method(), Request::path());
} catch (Throwable $e) {
    error_log($e->getMessage());
    Response::error('Interner Serverfehler.', 500);
}
