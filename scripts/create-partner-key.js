#!/usr/bin/env node
/**
 * Génère une clé pour un partenaire de l'API /api/v1.
 *
 *   node scripts/create-partner-key.js "Nom du partenaire" [débit par minute] [contact]
 *
 * Affiche la clé (à transmettre une seule fois au partenaire, elle n'est stockée nulle part)
 * et la requête SQL à exécuter sur la base : seule l'empreinte de la clé y est enregistrée.
 * Rien n'est écrit en base par ce script.
 */
import { generateKey, hashKey, DEFAULT_RATE_PER_MINUTE } from '../server/publicApi/partners.js';

const [name, rateArg, contact] = process.argv.slice(2);
if (!name || !name.trim()) {
  console.error('Usage : node scripts/create-partner-key.js "Nom du partenaire" [débit par minute] [contact]');
  process.exit(1);
}
const rate = rateArg ? Number(rateArg) : DEFAULT_RATE_PER_MINUTE;
if (!Number.isInteger(rate) || rate < 1 || rate > 6000) {
  console.error('Le débit doit être un entier entre 1 et 6000.');
  process.exit(1);
}

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`;
const key = generateKey();

console.log(`Clé à transmettre au partenaire (affichée une seule fois) :\n\n  ${key}\n`);
console.log('SQL à exécuter sur la base Trusti :\n');
console.log(`  INSERT INTO api_partners (name, contact, key_hash, rate_per_minute)
  VALUES (${quote(name.trim())}, ${contact ? quote(contact) : 'NULL'}, ${quote(hashKey(key))}, ${rate});\n`);
