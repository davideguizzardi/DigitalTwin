import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import i18n from 'laravel-react-i18n/vite';
import path from 'path';

export default defineConfig({
  root: 'resources/js',  // oppure 'src' se sposti i file

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js')
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    origin: 'http://rasp-cogno:5173',
  },

  plugins: [
    react(),
    i18n(),
  ],

  build: {
    outDir: path.resolve(__dirname, 'public/dist'),
    emptyOutDir: true,
  }
});