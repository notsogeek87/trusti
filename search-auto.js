import * as dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const apps = await sql`
  SELECT id, name, icon 
  FROM applications 
  WHERE name ILIKE '%auto%'
  ORDER BY name
`;

console.log(`\n📊 ${apps.length} apps trouvées avec "auto":\n`);
apps.forEach(app => {
  const hasIcon = app.icon && app.icon.startsWith('http');
  console.log(`${hasIcon ? '✅' : '❌'} ${app.name} (${app.id})`);
  if (!hasIcon) console.log(`   Icon: ${app.icon || '(vide)'}`);
});
