import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkWhatsapp() {
  console.log('🔍 Vérification de Whatsapp...\n');
  
  const result = await sql`
    SELECT id, name, popularity, grade 
    FROM applications 
    WHERE name ILIKE '%whatsapp%'
  `;
  
  console.log('Résultats:');
  result.forEach(app => {
    console.log(`  ID: ${app.id}`);
    console.log(`  Name: ${app.name}`);
    console.log(`  Popularity: ${app.popularity}`);
    console.log(`  Grade: ${app.grade}`);
    console.log('');
  });
  
  // Vérifier aussi la structure de la table
  console.log('📋 Structure de la colonne popularity:');
  const columns = await sql`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'applications' 
    AND column_name = 'popularity'
  `;
  
  console.log(columns);
}

checkWhatsapp().catch(console.error);
