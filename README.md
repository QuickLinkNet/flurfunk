# Flurfunk

Neighborhood planning PWA for a single street or small local community.

Flurfunk is a React/Vite/TypeScript frontend with a small PHP 8 SQLite backend. It is designed for practical neighborhood coordination: registration by invitation code, local news/feed items, events, RSVP flows, child/family management, and a simple admin path for the first user.

Live target:

```text
https://www.red-it.org/apps/neighborhood/
```

The full product concept is documented in `PRD_Nachbarschafts-App.md`.

## Why This Project Matters

This project shows how I build a complete small-business/community web app around realistic constraints:

- no separate database server required
- deployable to common PHP hosting
- SQLite persistence with automatic migrations
- PWA-friendly frontend structure
- clear separation between frontend build and backend API
- careful deployment process that preserves live SQLite data

## Tech Stack

- React + Vite
- TypeScript
- PHP 8.x
- SQLite
- Native PDO
- Atomic Design frontend structure
- Mini-MVC backend structure
- FTP/FTPS deployment script

## Product Scope

Implemented and connected to real API endpoints:

- registration with invitation code
- first user becomes admin automatically
- login
- dashboard
- street/community feed
- calendar list view
- child/family management
- events with RSVP

The planned v1.0 scope is described in `PRD_Nachbarschafts-App.md`, chapter 3. A dedicated settings/privacy page is still open.

## Architecture

```text
src/            React frontend
api/            PHP backend with core/controllers/models/migrations
public/         Static assets, PWA manifest, icons
scripts/        Deployment script and environment loader
.htaccess       SPA fallback for the frontend, excluding api/
```

Frontend structure follows Atomic Design:

```text
atoms -> molecules -> organisms -> templates -> pages
```

The backend is a small PHP Mini-MVC without Composer packages. SQLite is used as a single-file database, which is enough for the intended scope of one street with roughly 5-40 households.

## First-Time Setup

Since the move to SQLite, only the local FTP deployment credentials need to be configured manually:

```bash
cp .env.deploy.example .env.deploy
```

Then set:

```text
FTP_HOST
FTP_USER
FTP_PASSWORD
```

`REMOTE_BASE_DIR` only needs to change if the target folder is different.

No manual database setup is required:

- `api/config.php` is deployed normally and contains no credentials
- `api/core/Database.php` runs pending migrations automatically on the first real request
- the SQLite file is created under `api/data/`
- `api/data/` is protected from direct web access via `.htaccess`

## Local Development

The frontend can run locally while talking to the live API:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

For backend changes:

```bash
php -l path/to/file.php
npm run deploy
```

## Deployment

For regular updates:

```bash
npm install
npm run deploy
```

The deployment script:

- builds the frontend with `npm run build`
- uploads `dist/` to `/apps/neighborhood/`
- uploads `api/` to `/apps/neighborhood/api/`
- only touches the intended app folder
- recreates only the generated `assets/` folder
- never uploads or overwrites local SQLite data

This keeps live data safe during frontend/API deployments.

## Configuration Files

| File | Location | Purpose | Deployed? |
|---|---|---|---|
| `.env.local` | local | frontend dev points to live API | no |
| `.env.local.example` | repo | template for `.env.local` | yes |
| `.env.deploy` | local | FTP credentials for `npm run deploy` | no |
| `.env.deploy.example` | repo | template for `.env.deploy` | yes |
| `api/config.php` | repo | SQLite file path and session name | yes |

## Security Notes

Do not commit:

- `.env.local`
- `.env.deploy`
- SQLite database files under `api/data/`
- generated frontend builds

The deployment flow is intentionally conservative so the live SQLite database is not overwritten during updates.
