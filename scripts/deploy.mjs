import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { Client } from 'basic-ftp';
import { loadEnvFile } from './loadEnv.mjs';

loadEnvFile('.env.deploy');

// Hart verdrahtetes Ziel: darf NUR dieser eine Ordner sein (siehe README).
const remoteBase = process.env.REMOTE_BASE_DIR || '/apps/neighborhood';

function fail(message) {
  console.error(`Deploy abgebrochen: ${message}`);
  process.exit(1);
}

if (!remoteBase.startsWith('/apps/') || remoteBase === '/apps/' || remoteBase.length < 8) {
  fail(`REMOTE_BASE_DIR ("${remoteBase}") sieht nicht sicher aus. Erwartet: /apps/<name>`);
}
for (const key of ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD']) {
  if (!process.env[key]) {
    fail(`${key} fehlt. Bitte .env.deploy anlegen (siehe .env.deploy.example).`);
  }
}
if (!existsSync('dist')) {
  fail('dist/ fehlt. "npm run build" ist Teil von "npm run deploy" – bitte nicht einzeln aufrufen.');
}
if (existsSync('api/config.php')) {
  fail(
    'api/config.php existiert lokal! Diese Datei gehört NUR auf den Server (echte DB-Zugangsdaten) ' +
      'und darf nie mitgebaut/hochgeladen werden. Bitte lokal löschen (siehe README, Abschnitt Konfiguration).'
  );
}

// Lädt NUR Dateien hoch, löscht nie etwas Fremdes. So bleibt z.B.
// api/config.php auf dem Server garantiert unangetastet.
async function uploadContents(client, localDir) {
  for (const entry of readdirSync(localDir, { withFileTypes: true })) {
    const localPath = path.join(localDir, entry.name);
    if (entry.isDirectory()) {
      await client.ensureDir(entry.name);
      await uploadContents(client, localPath);
      await client.cdup();
    } else {
      await client.uploadFrom(localPath, entry.name);
    }
  }
}

const port = Number(process.env.FTP_PORT || 21);
const secure = (process.env.FTP_SECURE ?? 'true') !== 'false';

const client = new Client();
client.ftp.verbose = process.env.DEPLOY_VERBOSE === 'true';

try {
  console.log(`Verbinde mit ${process.env.FTP_HOST}:${port} (secure=${secure}) …`);
  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    port,
    secure
  });

  // ensureDir wandert Segment für Segment vom Login-Root aus in remoteBase
  // und legt fehlende Ordner an – Geschwister-Verzeichnisse bleiben unberührt.
  console.log(`Wechsle/erstelle ${remoteBase} …`);
  await client.ensureDir(remoteBase);

  // Nur der generierte Vite-Assets-Ordner wird vorab geleert (alte Hash-
  // Bundles), da dort garantiert keine Konfiguration/Geheimnisse liegen.
  try {
    await client.removeDir('assets');
  } catch {
    // existiert beim ersten Deploy noch nicht - kein Problem
  }

  console.log('Lade Frontend (dist/) hoch …');
  await uploadContents(client, 'dist');

  console.log('Lade Backend (api/) hoch …');
  await client.ensureDir('api'); // relativ zu remoteBase -> remoteBase/api
  await uploadContents(client, 'api');

  console.log('');
  console.log('Fertig. Erreichbar unter: https://www.red-it.org/apps/neighborhood/');
  console.log('Hinweis: api/config.php wird NIE angefasst - einmalig manuell auf dem Server anlegen.');
} catch (err) {
  fail(err.message ?? String(err));
} finally {
  client.close();
}
