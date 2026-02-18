/**
 * Vérifier les noms exacts des apps problématiques
 */

import { neon } from '@neondatabase/serverless';

if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {}
}

const sql = neon(process.env.DATABASE_URL);

async function checkNames() {
  console.log('🔍 Recherche des apps problématiques...\n');

  // WhatsApp
  const whatsapp = await sql`
    SELECT id, name, popularity FROM applications 
    WHERE name ILIKE '%whatsapp%'
  `;
  console.log('WhatsApp apps:', whatsapp);

  // Messenger
  const messenger = await sql`
    SELECT id, name, popularity FROM applications 
    WHERE name ILIKE '%messenger%'
  `;
  console.log('\nMessenger apps:', messenger);

  // Top with popularity 0 or 8
  const top = await sql`
    SELECT id, name, popularity FROM applications 
    WHERE popularity IN (0, 8)
  `;
  console.log('\nApps avec rang 0 ou 8:', top);
}

checkNames();
