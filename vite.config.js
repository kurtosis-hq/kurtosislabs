import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createSiteResearchFiles } from './scripts/site-research.mjs';

function researchDownloads() {
  return {
    name: 'ratings-research-downloads',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith('/ratings-data/')) return next();
        if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; return res.end(); }
        const file = createSiteResearchFiles().get(url.pathname);
        if (!file) { res.statusCode = 404; return res.end('Research file not found.'); }
        res.setHeader('Content-Type', file.type);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
        res.end(req.method === 'HEAD' ? '' : file.content);
      });
    },
  };
}

export default defineConfig({
  root: resolve(__dirname, 'kurtosis-website'),
  appType: 'mpa',
  plugins: [researchDownloads()],
  build: {
    outDir: resolve(__dirname, 'dist')
  }
});
