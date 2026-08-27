#!/usr/bin/env node
/**
 * Génère la liste des package names Android du catalogue Trusti, utilisée par
 * l'onboarding natif Android (scan des apps installées) :
 *
 *   - android/app/src/main/res/values/trusti_catalog.xml (string-array lue par le plugin)
 *   - android/app/src/main/AndroidManifest.xml (bloc <queries>, entre les marqueurs
 *     TRUSTI_CATALOG_START / TRUSTI_CATALOG_END)
 *
 * Source, par ordre de préférence :
 *   1. La base Postgres (DATABASE_URL), la plus à jour.
 *   2. L'API publique de prod (aucun secret requis — c'est ce qui alimente
 *      la CI GitHub Actions, qui n'a pas DATABASE_URL).
 *   3. server/database/data/apps.json en dernier recours (dev local hors
 *      ligne). Ce fichier contient des entrées JSON malformées par endroits ;
 *      on extrait les playStoreUrl par regex plutôt que par JSON.parse pour
 *      rester tolérant à ça.
 *
 * À relancer (`npm run android:generate-catalog`) après toute mise à jour du
 * catalogue, avant de builder l'app Android.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'android/app/src/main/AndroidManifest.xml');
const RESOURCE_PATH = path.join(ROOT, 'android/app/src/main/res/values/trusti_catalog.xml');
const START_MARKER = '<!-- TRUSTI_CATALOG_START -->';
const END_MARKER = '<!-- TRUSTI_CATALOG_END -->';

function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const match = playStoreUrl.match(/id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

async function getPlayStoreUrlsFromDb() {
  if (!process.env.DATABASE_URL) return null;
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT play_store_url FROM applications WHERE play_store_url IS NOT NULL`;
  return rows.map(r => r.play_store_url);
}

const PROD_API_URL = 'https://trusti-alpha.vercel.app/api/apps?onboarding=true';

async function getPlayStoreUrlsFromPublicApi() {
  const res = await fetch(PROD_API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.apps)) throw new Error('réponse API inattendue');
  return data.apps.map(a => a.playStoreUrl).filter(Boolean);
}

// server/database/data/apps.json contient des entrées JSON malformées par
// endroits (clés dupliquées, virgules manquantes) — on extrait les
// playStoreUrl par regex sur le texte brut plutôt que via JSON.parse, pour
// que ce dernier recours reste utilisable même sans corriger le fichier.
function getPlayStoreUrlsFromJsonFallback() {
  const jsonPath = path.join(ROOT, 'server/database/data/apps.json');
  if (!fs.existsSync(jsonPath)) return [];
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const matches = [...raw.matchAll(/"playStoreUrl"\s*:\s*"([^"]+)"/g)];
  return matches.map(m => m[1]);
}

function xmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  let urls = null;

  try {
    urls = await getPlayStoreUrlsFromDb();
  } catch (err) {
    console.warn(`⚠️  Requête DB échouée (${err.message}).`);
  }

  if (!urls) {
    try {
      urls = await getPlayStoreUrlsFromPublicApi();
      console.log(`ℹ️  Catalogue récupéré depuis l'API publique (${PROD_API_URL}).`);
    } catch (err) {
      console.warn(`⚠️  API publique injoignable (${err.message}).`);
    }
  }

  if (!urls) {
    console.warn('⚠️  Bascule sur server/database/data/apps.json en dernier recours.');
    urls = getPlayStoreUrlsFromJsonFallback();
  }

  const packageNames = [...new Set(urls.map(extractPackageId).filter(Boolean))].sort();

  if (packageNames.length === 0) {
    console.warn('⚠️  Aucun package name trouvé — le catalogue généré sera vide.');
  }

  // res/values/trusti_catalog.xml
  const resourceXml = `<?xml version="1.0" encoding="utf-8"?>
<!--
  Fichier généré automatiquement par \`npm run android:generate-catalog\`.
  Ne pas éditer à la main : liste des package names Android du catalogue Trusti,
  utilisée par InstalledAppsPlugin pour savoir quelles apps tester sur l'appareil.
-->
<resources>
    <string-array name="trusti_catalog_packages">
${packageNames.map(p => `        <item>${xmlEscape(p)}</item>`).join('\n')}
    </string-array>
</resources>
`;
  fs.writeFileSync(RESOURCE_PATH, resourceXml);

  // AndroidManifest.xml <queries>
  const manifest = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const startIdx = manifest.indexOf(START_MARKER);
  const endIdx = manifest.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Marqueurs ${START_MARKER} / ${END_MARKER} introuvables dans ${MANIFEST_PATH}`);
  }
  const queriesBlock = packageNames.map(p => `        <package android:name="${xmlEscape(p)}" />`).join('\n');
  const newManifest =
    manifest.slice(0, startIdx + START_MARKER.length) +
    '\n' + queriesBlock + '\n        ' +
    manifest.slice(endIdx);
  fs.writeFileSync(MANIFEST_PATH, newManifest);

  console.log(`✅ Catalogue Android généré : ${packageNames.length} apps.`);
  console.log(`   - ${path.relative(ROOT, RESOURCE_PATH)}`);
  console.log(`   - ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
