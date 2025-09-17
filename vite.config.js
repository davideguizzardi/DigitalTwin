import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import i18n from 'laravel-react-i18n/vite';
import path from 'path' 

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js')
    }
  },
  server: {
    host: '0.0.0.0',        // bind to all interfaces inside Docker
    port: 5173,             // must match your compose port mapping
    origin: 'http://digitaltwin.local:5173', // browser HMR
  },
  plugins: [
    laravel({
      input: 'resources/js/app.jsx',
      refresh: true,
    }),
    react(),
    i18n(),
  ],
});
