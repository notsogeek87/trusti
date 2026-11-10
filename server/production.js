// Serveur de production (Hyperfluid / conteneur) : sert le build Vite (dist/)
// et monte les mêmes handlers api/*.js que Vercel (source unique de vérité).
import * as dotenv from 'dotenv';
dotenv.config();

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { pickDriver } from './database/sql.js';

import appsHandler from '../api/apps.js';
import customTrustiAppsHandler from '../api/custom-trusti-apps.js';
import starAppsHandler from '../api/star-apps.js';
import trustiAppsHandler from '../api/trusti-apps.js';
import topAppsHandler from '../api/top-apps.js';
import suggestToolHandler from '../api/suggest-tool.js';
import cleanDuplicatesHandler from '../api/clean-duplicates.js';
import lookupPlayStoreHandler from '../api/lookup-playstore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.all('/api/apps', appsHandler);
app.all('/api/custom-trusti-apps', customTrustiAppsHandler);
app.all('/api/star-apps', starAppsHandler);
app.all('/api/trusti-apps', trustiAppsHandler);
app.all('/api/top-apps', topAppsHandler);
app.all('/api/suggest-tool', suggestToolHandler);
app.all('/api/clean-duplicates', cleanDuplicatesHandler);
app.all('/api/lookup-playstore', lookupPlayStoreHandler);

// Diagnostic sans secret : seulement protocole et nom d'hôte, jamais les identifiants.
function describeDbUrl(url) {
  if (!url) return 'absente';
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return `invalide (${String(url).length} caractères)`;
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: pickDriver(process.env.DATABASE_URL, process.env.DB_DRIVER),
    dbHost: describeDbUrl(process.env.DATABASE_URL),
    timestamp: new Date().toISOString(),
  });
});

// Une route /api inconnue renvoie 404 JSON, jamais la page HTML.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Fichiers statiques : assets hachés mis en cache longtemps, le reste non.
app.use(
  express.static(distDir, {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// Fallback SPA : toute autre route renvoie index.html.
app.use((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Trusti en production sur le port ${PORT}`);
});
