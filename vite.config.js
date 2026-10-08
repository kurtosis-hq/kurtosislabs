import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        concept: resolve(__dirname, 'concept-85.html'),
        ratings: resolve(__dirname, 'ratings.html'),
        horizon: resolve(__dirname, 'horizon.html'),
        horizon01: resolve(__dirname, 'horizon-01.html'),
        methodology: resolve(__dirname, 'ratings-methodology.html'),
        methodologyRedirect: resolve(__dirname, 'methodology.html')
      }
    }
  }
});
