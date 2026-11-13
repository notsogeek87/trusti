#!/usr/bin/env node
/**
 * Copie les icônes du catalogue sur le domaine Trusti (public/app-icons/,
 * copié dans dist/). Utilisé :
 *  - au build de l'image Hyperfluid (workflow hyperfluid-image) : le site web sert les icônes depuis son
 *    propre domaine, ce qui évite les blocages des réseaux d'entreprise
 *    (googleusercontent.com, cdn.jsdelivr.net…) ;
 *  - par `npm run cap:sync` : les icônes sont embarquées dans l'APK.
 *
 * Les URLs d'icônes restent la source de vérité (colonne `icon` en base).
 * Le manifeste associe chaque URL à son fichier local : si l'URL change en
 * base, elle n'est plus dans le manifeste et l'app retombe sur l'URL distante
 * jusqu'au prochain build (chaque déploiement re-télécharge tout).
 *
 * Tolérant aux pannes : une icône qui ne se télécharge pas est simplement
 * ignorée (l'app l'affichera depuis le réseau). Dossier ignoré par git.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public/app-icons');
// Source de la liste des icônes : l'API de production par défaut, ou un autre site Trusti
// via la variable ICONS_SOURCE_URL.
const API_URL =
  process.env.ICONS_SOURCE_URL || 'https://api.trusti-score.eu/api/apps?onboarding=true';
const CONCURRENCY = 16;
const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' };

// Même logique que sizedIconUrl() dans AppIconImage.jsx
const sized = (url) =>
  /^https:\/\/(play-lh|lh3)\.googleusercontent\.com\/[^=?]+$/.test(url) ? `${url}=s96-rw` : url;

async function download(url) {
  const res = await fetch(sized(url), { signal: AbortSignal.timeout(10000) });
  const ext = EXT[(res.headers.get('content-type') || '').split(';')[0]];
  if (!res.ok || !ext) throw new Error(`HTTP ${res.status}`);
  const file = `${crypto.createHash('sha1').update(url).digest('hex').slice(0, 16)}.${ext}`;
  fs.writeFileSync(path.join(OUT_DIR, file), Buffer.from(await res.arrayBuffer()));
  return file;
}

async function main() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  const data = await res.json();
  const urls = [...new Set(data.apps.map((a) => a.icon).filter((i) => /^https:\/\//.test(i || '')))];

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {};
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const url = urls[next++];
      try {
        manifest[url] = await download(url);
      } catch (e) {
        console.warn(`⚠️  icône ignorée (${e.message}): ${url.slice(0, 70)}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest));
  console.log(`✅ ${Object.keys(manifest).length}/${urls.length} icônes copiées dans public/app-icons/`);
}

main().catch((e) => {
  // Ne bloque pas le build : l'app fonctionne sans icônes embarquées.
  console.warn(`⚠️  Icônes non embarquées: ${e.message}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), '{}');
});
