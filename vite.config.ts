import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Deployment-Basis: https://www.red-it.org/apps/neighborhood/
export default defineConfig({
  base: '/apps/neighborhood/',
  server: {
    // Respektiert PORT, falls von außen vorgegeben (z.B. Preview-Tooling),
    // sonst Vites üblicher Default 5173.
    port: process.env.PORT ? Number(process.env.PORT) : 5173
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // nutzt public/manifest.json
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      // injectManifest statt generateSW, da wir einen eigenen push-Event-Handler
      // brauchen (Web-Push-Benachrichtigungen) - siehe src/sw.ts.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // Kein automatisch injiziertes <script>-Tag - wir registrieren selbst
      // über virtual:pwa-register (src/pwaUpdate.ts), damit ein bereits
      // offener Tab eine neue Version zuverlässig aktiviert UND neu lädt,
      // statt auf unbestimmte Zeit die alte Version aus dem Cache zu zeigen.
      injectRegister: false,
      devOptions: {
        enabled: true, // Service Worker auch im Dev-Server aktiv, zum Testen von Push
        type: 'module'
      }
    })
  ]
});
