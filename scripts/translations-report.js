#!/usr/bin/env node
/**
 * Rapport des traductions du contenu en base : ce qui manque ou est périmé dans chaque
 * langue de CONTENT_LANGUAGES (raisons, descriptions, justifications des évaluations,
 * guides de migration).
 *
 *   node scripts/translations-report.js            # résumé par type de texte et par langue
 *   node scripts/translations-report.js --list     # + les 50 premiers textes à traduire
 *   node scripts/translations-report.js --list=all # + la liste complète
 *   node scripts/translations-report.js --check    # code de sortie 1 s'il reste quelque chose
 *   node scripts/translations-report.js --lang=pl  # une seule langue (ou --lang=es,it)
 *
 * Lecture seule : rien n'est écrit en base. Lit DATABASE_URL (voir server/database/sql.js).
 * Pour traduire ce qui est listé : docs/guides/traduction.md, section « Rafraîchir ».
 */
import 'dotenv/config';
import sql from '../server/database/sql.js';
import { expectedTranslations, compareTranslations } from '../server/translationsReport.js';
import { CONTENT_LANGUAGES } from '../server/contentTranslations.js';

const args = process.argv.slice(2);
const check = args.includes('--check');
const listArg = args.find(a => a === '--list' || a.startsWith('--list='));
const listLimit = !listArg ? 0 : listArg === '--list=all' ? Infinity : 50;
const langArg = args.find(a => a.startsWith('--lang='));
const langs = langArg ? langArg.slice('--lang='.length).split(',').filter(l => CONTENT_LANGUAGES.includes(l)) : CONTENT_LANGUAGES;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL manquant (fichier .env ou variable d\'environnement).');
  }
  const [apps, assessments, guides, translations] = await Promise.all([
    sql`SELECT id, reason, description, team_pick_reason FROM applications`,
    sql`SELECT app_id, criteria FROM app_assessments`,
    sql`SELECT app_id, direction, summary, steps, notes, direct_export FROM app_migration_guides`,
    sql`SELECT entity, entity_id, field, lang, value, source_hash FROM content_translations`,
  ]);

  const expected = expectedTranslations({ apps, assessments, guides });
  const report = compareTranslations(expected, translations, langs);

  console.log(`Catalogue : ${apps.length} apps, ${assessments.length} évaluations, ${guides.length} guides, ${expected.length} textes à traduire par langue.\n`);
  console.log('type'.padEnd(34) + 'langue  attendus      ok  manquants  périmés  invalides');
  for (const s of report.summary) {
    console.log(
      `${s.entity}.${s.field}`.padEnd(34) + s.lang.padEnd(7)
      + String(s.expected).padStart(9) + String(s.ok).padStart(8) + String(s.missing).padStart(11)
      + String(s.stale).padStart(9) + String(s.invalid).padStart(11),
    );
  }

  const todo = report.rows.filter(r => r.status !== 'ok');
  console.log(`\n${todo.length ? `${todo.length} ligne(s) à traduire ou à refaire.` : 'Tout est traduit et à jour.'}`);
  if (report.orphans.length) {
    console.log(`${report.orphans.length} traduction(s) orpheline(s) (fiche ou texte supprimé) : à nettoyer avec validation.`);
  }

  if (listLimit && todo.length) {
    console.log('\nentity / id / champ / langue : statut');
    for (const r of todo.slice(0, listLimit)) console.log(`  ${r.entity} / ${r.entityId} / ${r.field} / ${r.lang} : ${r.status}`);
    if (todo.length > listLimit) console.log(`  … et ${todo.length - listLimit} autre(s) (--list=all pour tout voir)`);
  }

  if (check && (todo.length || report.orphans.length)) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Rapport impossible :', err.message);
  process.exitCode = 2;
});
