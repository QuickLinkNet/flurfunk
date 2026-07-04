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
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png']
    })
  ]
});
