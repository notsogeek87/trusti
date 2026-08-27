/**
 * Script de backfill : fiabilise en base le nom, l'icône et l'URL Play Store
 * de toutes les apps qui ont un package Android renseigné, en utilisant le
 * Play Store comme source de vérité (même logique que enrichFromPlayStore
 * dans server/database/service-postgres.js, appliquée ici à tout l'historique).
 *
 * Sans ce script, les données restent correctes à la lecture (l'API les
 * corrige à la volée) mais les valeurs brutes en base restent celles
 * saisies à la main par l'admin tant que l'app n'est pas ré-enregistrée.
 *
 * Usage : node backfill-playstore-data.js [--dry-run]
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import gplay from 'google-play-scraper';

const sql = neon(process.env.DATABASE_URL);
const dryRun = process.argv.includes('--dry-run');

function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const trimmed = playStoreUrl.trim();
  const match = trimmed.match(/[?&]id=([a-zA-Z0-9._]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function buildPlayStoreUrl(packageName) {
  return `https://play.google.com/store/apps/details?id=${packageName}`;
}

async function backfill() {
  console.log(`🚀 Backfill Play Store (nom, icône, URL)${dryRun ? ' — DRY RUN, aucune écriture' : ''}\n`);

  const apps = await sql`
    SELECT id, name, icon, play_store_url
    FROM applications
    WHERE play_store_url IS NOT NULL AND play_store_url != ''
    ORDER BY name
  `;

  console.log(`📊 ${apps.length} app(s) avec un lien Play Store à vérifier\n`);

  let updated = 0;
  let unchanged = 0;
  let notFound = 0;
  let skipped = 0;

  for (const app of apps) {
    const packageName = extractPackageId(app.play_store_url);
    if (!packageName) {
      console.log(`⏭️  ${app.name} — package illisible ("${app.play_store_url}")`);
      skipped++;
      continue;
    }

    let appInfo;
    try {
      appInfo = await gplay.app({ appId: packageName });
    } catch (error) {
      console.log(`❌ ${app.name} (${packageName}) — introuvable sur le Play Store`);
      notFound++;
      await new Promise(resolve => setTimeout(resolve, 300));
      continue;
    }

    const newName = appInfo.title || app.name;
    const newIcon = appInfo.icon || app.icon;
    const newUrl = appInfo.url || buildPlayStoreUrl(packageName);

    const changed = newName !== app.name || newIcon !== app.icon || newUrl !== app.play_store_url;

    if (!changed) {
      unchanged++;
    } else {
      console.log(`✅ ${app.name}${newName !== app.name ? ` → "${newName}"` : ''}`);
      if (newIcon !== app.icon) console.log(`   icône mise à jour`);
      if (newUrl !== app.play_store_url) console.log(`   url : ${app.play_store_url} → ${newUrl}`);

      if (!dryRun) {
        await sql`
          UPDATE applications
          SET name = ${newName}, icon = ${newIcon}, play_store_url = ${newUrl}, updated_at = NOW()
          WHERE id = ${app.id}
        `;
      }
      updated++;
    }

    // Petite pause pour éviter le rate limiting du Play Store
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n📋 Résumé:`);
  console.log(`   ✅ Mises à jour: ${updated}`);
  console.log(`   ⚪ Déjà à jour: ${unchanged}`);
  console.log(`   ❌ Introuvables sur le Play Store: ${notFound}`);
  console.log(`   ⏭️  Package illisible: ${skipped}`);
  if (dryRun) console.log('\nℹ️  Dry run : relancer sans --dry-run pour écrire les changements.');
}

backfill()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
