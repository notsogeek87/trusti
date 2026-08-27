#!/usr/bin/env node
/**
 * Génère la liste des package names Android du catalogue Trusti, utilisée par
 * l'onboarding natif Android (scan des apps installées) :
 *
 *   - android/app/src/main/res/values/trusti_catalog.xml (string-array lue par le plugin)
 *   - android/app/src/main/AndroidManifest.xml (bloc <queries>, entre les marqueurs
 *     TRUSTI_CATALOG_START / TRUSTI_CATALOG_END)
 *
 * Source : la base Postgres (DATABASE_URL) si disponible, sinon
 * server/database/data/apps.json en secours (dev local sans DB).
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

function getPlayStoreUrlsFromJsonFallback() {
  const jsonPath = path.join(ROOT, 'server/database/data/apps.json');
  if (!fs.existsSync(jsonPath)) return [];
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    const apps = Array.isArray(data) ? data : (data.applications || []);
    return apps.map(a => a.playStoreUrl).filter(Boolean);
  } catch (err) {
    console.warn(`⚠️  Impossible de lire ${jsonPath} en secours (${err.message}). Catalogue vide.`);
    return [];
  }
}

function xmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  let urls;
  try {
    urls = await getPlayStoreUrlsFromDb();
  } catch (err) {
    console.warn(`⚠️  Requête DB échouée (${err.message}), bascule sur le fallback JSON.`);
    urls = null;
  }
  if (!urls) {
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
