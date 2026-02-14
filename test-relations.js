/**
 * Test des relations entre apps
 */
import dbService from './server/database/service-postgres.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testRelations() {
  console.log('\n═══════════════════════════════════════');
  console.log('🧪 TEST DES RELATIONS');
  console.log('═══════════════════════════════════════\n');
  
  // Test 1: WhatsApp doit avoir Signal en alternative
  console.log('📱 Test 1: WhatsApp');
  const whatsapp = (await dbService.getAllApps()).find(app => app.name === 'Whatsapp');
  if (whatsapp) {
    console.log(`   Score: ${whatsapp.trustiScore}`);
    console.log(`   Alternatives: ${whatsapp.alternativeAppIds?.length || 0}`);
    if (whatsapp.alternativeAppIds && whatsapp.alternativeAppIds.length > 0) {
      for (const altId of whatsapp.alternativeAppIds) {
        const alt = await dbService.getAppById(altId);
        if (alt) {
          console.log(`   → ${alt.name} (${alt.trustiScore})`);
        } else {
          console.log(`   ⚠️  App ${altId} non trouvée`);
        }
      }
    }
  } else {
    console.log('   ❌ WhatsApp non trouvé');
  }
  
  console.log('');
  
  // Test 2: Signal doit remplacer WhatsApp
  console.log('📱 Test 2: Signal');
  const signal = (await dbService.getAllApps()).find(app => app.name === 'Signal');
  if (signal) {
    console.log(`   Score: ${signal.trustiScore}`);
    console.log(`   Remplace: ${signal.replacesAppIds?.length || 0} apps`);
    if (signal.replacesAppIds && signal.replacesAppIds.length > 0) {
      for (const repId of signal.replacesAppIds) {
        const rep = await dbService.getAppById(repId);
        if (rep) {
          console.log(`   → Remplace ${rep.name} (${rep.trustiScore})`);
        } else {
          console.log(`   ⚠️  App ${repId} non trouvée`);
        }
      }
    }
  } else {
    console.log('   ❌ Signal non trouvé');
  }
  
  console.log('');
  
  // Test 3: Gmail
  console.log('📧 Test 3: Gmail');
  const gmail = (await dbService.getAllApps()).find(app => app.name === 'GMail');
  if (gmail) {
    console.log(`   Score: ${gmail.trustiScore}`);
    console.log(`   Alternatives: ${gmail.alternativeAppIds?.length || 0}`);
    if (gmail.alternativeAppIds && gmail.alternativeAppIds.length > 0) {
      for (const altId of gmail.alternativeAppIds) {
        const alt = await dbService.getAppById(altId);
        if (alt) {
          console.log(`   → ${alt.name} (${alt.trustiScore})`);
        } else {
          console.log(`   ⚠️  App ${altId} non trouvée`);
        }
      }
    }
  } else {
    console.log('   ❌ Gmail non trouvé');
  }
  
  console.log('\n═══════════════════════════════════════\n');
}

testRelations().catch(console.error);
