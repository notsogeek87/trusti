/**
 * Script pour identifier les icônes cassées dans la base de données
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import https from 'https';
import http from 'http';

const sql = neon(process.env.DATABASE_URL);

function testIconUrl(url) {
  return new Promise((resolve) => {
    if (!url || url.length < 10) {
      resolve({ valid: false, reason: 'URL manquante ou trop courte' });
      return;
    }

    // URLs problématiques connues
    if (url.includes('play-lh.googleusercontent.com') && url.length > 200) {
      resolve({ valid: false, reason: 'URL Google Play trop longue (probablement cassée)' });
      return;
    }

    if (url === '📱' || url === '🎯' || url === '🔒') {
      resolve({ valid: false, reason: 'Emoji au lieu d\'URL' });
      return;
    }

    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 3000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        resolve({ valid: true, status: res.statusCode });
      } else {
        resolve({ valid: false, reason: `HTTP ${res.statusCode}` });
      }
      res.resume();
    });

    req.on('error', (err) => {
      resolve({ valid: false, reason: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ valid: false, reason: 'Timeout' });
    });
  });
}

async function checkAllIcons() {
  console.log('🔍 Vérification de toutes les icônes dans PostgreSQL...\n');
  
  const apps = await sql`
    SELECT name, icon, category, trusti_score as grade
    FROM applications
    ORDER BY trusti_score, name
  `;
  
  console.log(`📊 Total: ${apps.length} apps à vérifier\n`);
  
  const problematic = [];
  const checking = [];
  
  // Tester les icônes par lots de 10
  for (let i = 0; i < apps.length; i += 10) {
    const batch = apps.slice(i, i + 10);
    
    const results = await Promise.all(
      batch.map(async (app) => {
        const result = await testIconUrl(app.icon);
        return { app, result };
      })
    );
    
    results.forEach(({ app, result }) => {
      if (!result.valid) {
        console.log(`❌ ${app.name} (${app.grade})`);
        console.log(`   Raison: ${result.reason}`);
        console.log(`   URL: ${app.icon?.substring(0, 80)}...`);
        console.log('');
        problematic.push({ ...app, reason: result.reason });
      }
    });
    
    // Petit délai entre les lots
    if (i + 10 < apps.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n📋 Résumé:`);
  console.log(`   ✅ Icônes OK: ${apps.length - problematic.length}`);
  console.log(`   ❌ Icônes cassées: ${problematic.length}`);
  
  if (problematic.length > 0) {
    console.log('\n🔧 Apps nécessitant une correction:');
    problematic.slice(0, 20).forEach(app => {
      console.log(`   - ${app.name} (${app.grade}): ${app.reason}`);
    });
    
    if (problematic.length > 20) {
      console.log(`   ... et ${problematic.length - 20} autres`);
    }
  }
}

checkAllIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
