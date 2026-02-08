/**
 * Script de vérification de la configuration Resend
 * Utilise l'API Resend pour vérifier le statut de votre compte
 */

import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkResendConfig() {
  console.log('\n🔍 Vérification de la configuration Resend...\n');
  
  try {
    // Vérifier la clé API
    console.log('✅ Clé API Resend détectée');
    console.log(`   Clé : ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
    
    // Vérifier l'email d'envoi configuré
    console.log(`✅ Email d'envoi configuré : ${process.env.RESEND_FROM_EMAIL}`);
    
    // Vérifier l'URL frontend
    console.log(`✅ Frontend URL : ${process.env.FRONTEND_URL}`);
    
    // Vérifier l'environnement
    console.log(`✅ Environnement : ${process.env.NODE_ENV}`);
    
    console.log('\n📊 Mode actuel :');
    if (process.env.RESEND_FROM_EMAIL?.includes('onboarding@resend.dev')) {
      console.log('   🟡 MODE SANDBOX');
      console.log('   ⚠️  Les emails ne seront envoyés qu\'aux adresses vérifiées dans Resend');
      console.log('\n   Pour ajouter des emails de test :');
      console.log('   1. Allez sur https://resend.com/settings');
      console.log('   2. Section "Verified emails" ou "Team"');
      console.log('   3. Ajoutez et vérifiez vos emails de test');
      console.log('\n   ℹ️  Actuellement autorisé : davidg.c.D@proton.me (et peut-être d\'autres emails vérifiés)');
    } else {
      console.log('   🟢 MODE PRODUCTION');
      console.log('   ✅ Utilise un domaine vérifié');
      console.log('   ✅ Peut envoyer à n\'importe quelle adresse email');
    }
    
    // Test d'envoi (optionnel)
    console.log('\n📧 Test d\'envoi d\'email');
    console.log('   Pour tester l\'envoi, exécutez ce script avec un email en argument :');
    console.log('   node check-resend-config.js test@exemple.com');
    
    // Si un email est fourni en argument, faire un test
    const testEmail = process.argv[2];
    if (testEmail && testEmail.includes('@')) {
      console.log(`\n🚀 Envoi d'un email de test à ${testEmail}...`);
      
      try {
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'TrustiScore <onboarding@resend.dev>',
          to: testEmail,
          subject: '🧪 Test de configuration Resend - TrustiScore',
          html: `
            <h1>Test réussi !</h1>
            <p>Votre configuration Resend fonctionne correctement.</p>
            <p><strong>Email envoyé depuis :</strong> ${process.env.RESEND_FROM_EMAIL}</p>
            <p><strong>Mode :</strong> ${process.env.NODE_ENV}</p>
            <hr>
            <small>TrustiScore - Test de configuration</small>
          `
        });
        
        console.log('✅ Email envoyé avec succès !');
        console.log(`   ID : ${result.id}`);
        console.log('\n   ℹ️  Vérifiez votre boîte mail (et les spams)');
        console.log('   ℹ️  Consultez les logs sur https://resend.com/emails');
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi :', error.message);
        
        if (error.message.includes('access')) {
          console.log('\n   💡 Votre clé API semble invalide ou n\'a pas les permissions nécessaires');
        } else if (error.message.includes('domain')) {
          console.log('\n   💡 Problème avec le domaine d\'envoi');
        } else if (error.message.includes('verified')) {
          console.log('\n   💡 En mode sandbox, vous ne pouvez envoyer qu\'aux emails vérifiés');
          console.log('   💡 Ajoutez cet email dans Resend : https://resend.com/settings');
        }
      }
    }
    
    console.log('\n📚 Documentation complète : voir RESEND_CONFIGURATION.md');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification :', error.message);
    console.log('\n💡 Vérifiez que votre fichier .env est correctement configuré\n');
  }
}

// Fonction pour lister les domaines (nécessite l'API Resend)
async function listDomains() {
  console.log('\n📋 Tentative de récupération des domaines...\n');
  try {
    // Note : L'API Resend ne fournit pas de méthode publique pour lister les domaines
    // Cette fonctionnalité nécessiterait une requête HTTP directe à l'API
    console.log('   ℹ️  Pour voir vos domaines, consultez : https://resend.com/domains');
  } catch (error) {
    console.log('   ⚠️  Impossible de récupérer les domaines via l\'API');
  }
}

// Exécuter les vérifications
checkResendConfig().catch(console.error);
