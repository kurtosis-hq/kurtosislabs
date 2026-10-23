import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createResearchFiles } from './src/ratings/lib/downloads.ts';

function researchDownloads() {
  return {
    name: 'ratings-research-downloads',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith('/ratings-data/')) return next();
        if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; return res.end(); }
        const file = createResearchFiles().get(url.pathname);
        if (!file) { res.statusCode = 404; return res.end('Research file not found.'); }
        res.setHeader('Content-Type', file.type);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
        res.end(req.method === 'HEAD' ? '' : file.content);
      });
    },
    generateBundle() {
      for (const [url, file] of createResearchFiles()) this.emitFile({
        type: 'asset', fileName: url.slice(1), source: file.content,
      });
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [researchDownloads()],
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
