import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        concept: resolve(__dirname, 'concept-85.html'),
        ratings: resolve(__dirname, 'ratings-01-pre-scope-backup.html')
      }
    }
  }
});
