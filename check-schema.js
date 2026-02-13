import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    // Récupérer les colonnes de la table applications
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'applications'
      ORDER BY ordinal_position
    `;
    
    console.log('=== Colonnes de la table applications ===\n');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkSchema();
