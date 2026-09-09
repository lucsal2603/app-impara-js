import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  server: { host: true, port: 8080, strictPort: true },
  build: { rollupOptions: { input: { index: resolve(__dirname, 'index.html'), home: resolve(__dirname, 'home.html'), lezione: resolve(__dirname, 'lezione.html'), palestra: resolve(__dirname, 'palestra.html') } } },
});
