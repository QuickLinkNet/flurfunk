import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Deployment-Basis: https://www.red-it.org/apps/neighborhood/
export default defineConfig({
  base: '/apps/neighborhood/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // nutzt public/manifest.json
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png']
    })
  ]
});
