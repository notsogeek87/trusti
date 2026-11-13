// Serveur de production (Hyperfluid / conteneur) : sert le build Vite (dist/)
// et monte les mêmes handlers api/*.js que Vercel (source unique de vérité).
import * as dotenv from 'dotenv';
dotenv.config();

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { pickDriver, resolveDatabaseUrl } from './database/sql.js';
import { createRateLimiter, createApiCache } from './protection.js';
import { mountMcp } from './mcp.js';
import pg from 'pg';

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
// Derrière le proxy d'entrée Hyperfluid : req.ip = adresse du visiteur (dernier saut ajouté).
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// Anciens domaines : renvoyés vers l'adresse officielle, en gardant le chemin et
// les paramètres (liens de partage ?app=...). 301 pour la lecture, 308 sinon
// (garde la méthode et le corps d'un POST).
const CANONICAL_ORIGIN = 'https://app.trusti-score.eu';
const LEGACY_HOSTS = new Set(['trusti.lielu.eu', 'app.trustiscore.eu']);
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (!LEGACY_HOSTS.has(host)) return next();
  const code = req.method === 'GET' || req.method === 'HEAD' ? 301 : 308;
  return res.redirect(code, CANONICAL_ORIGIN + req.originalUrl);
});

// Administration de la base depuis Claude (connecteur MCP). Inactif sans MCP_TOKEN.
let mcpPool;
const mcpLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
app.use('/mcp', mcpLimiter.middleware);
if (mountMcp(app, {
  getPool: () => (mcpPool ??= new pg.Pool({ connectionString: resolveDatabaseUrl(), max: 2 })),
})) {
  console.log('Point d\'accès MCP actif sur /mcp');
}

// Limites de débit par IP : générale, puis plus strictes pour les routes coûteuses ou ouvertes.
const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
const suggestLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 5 });
const lookupLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 20 });
app.use('/api', apiLimiter.middleware);
app.post('/api/suggest-tool', suggestLimiter.middleware);
app.use('/api/lookup-playstore', lookupLimiter.middleware);

// Micro-cache des lectures publiques (30 s), vidé à chaque écriture.
const apiCache = createApiCache({ ttlMs: 30_000 });
for (const route of ['/api/apps', '/api/trusti-apps', '/api/top-apps', '/api/star-apps', '/api/custom-trusti-apps']) {
  app.use(route, apiCache.middleware);
}

app.all('/api/apps', appsHandler);
app.all('/api/custom-trusti-apps', customTrustiAppsHandler);
app.all('/api/star-apps', starAppsHandler);
app.all('/api/trusti-apps', trustiAppsHandler);
app.all('/api/top-apps', topAppsHandler);
app.all('/api/suggest-tool', suggestToolHandler);
app.all('/api/clean-duplicates', cleanDuplicatesHandler);
app.all('/api/lookup-playstore', lookupPlayStoreHandler);

// Noms des champs d'un bloc JSON ou KEY=valeur, sans jamais afficher les valeurs.
function listFieldNames(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') return Object.keys(parsed).join(', ');
  } catch {}
  return text
    .split(/\r?\n|&/)
    .map((line) => line.match(/^\s*([A-Za-z0-9_.-]{1,60})\s*[=:]/)?.[1])
    .filter(Boolean)
    .join(', ') || 'format inconnu';
}

// Diagnostic sans secret : seulement protocole et nom d'hôte, jamais les identifiants.
function describeDbUrl(url) {
  if (!url) return 'absente';
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return `invalide (${String(url).length} caractères) ; champs : ${listFieldNames(String(url))}`;
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: pickDriver(resolveDatabaseUrl(), process.env.DB_DRIVER),
    dbHost: describeDbUrl(resolveDatabaseUrl()),
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
