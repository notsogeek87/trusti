/**
 * Script de vérification et test de la configuration Brevo
 */

import 'dotenv/config';
import * as brevo from '@getbrevo/brevo';

async function checkBrevoConfig() {
  console.log('\n🔍 Vérification de la configuration Brevo...\n');
  
  try {
    // Vérifier les variables d'environnement
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY non définie dans le fichier .env');
      console.log('\n📚 Pour configurer Brevo :');
      console.log('   1. Créez un compte sur https://app.brevo.com/account/register');
      console.log('   2. Allez dans SMTP & API → API Keys');
      console.log('   3. Créez une clé v3');
      console.log('   4. Ajoutez-la dans votre fichier .env');
      console.log('   BREVO_API_KEY=votre-cle-ici\n');
      return;
    }

    if (process.env.BREVO_API_KEY === 'VOTRE_CLE_API_BREVO_ICI') {
      console.error('❌ Vous devez remplacer VOTRE_CLE_API_BREVO_ICI par votre vraie clé API');
      console.log('\n📚 Pour obtenir votre clé API :');
      console.log('   1. https://app.brevo.com → SMTP & API → API Keys');
      console.log('   2. Créez une nouvelle clé v3');
      console.log('   3. Remplacez la valeur dans .env\n');
      return;
    }
    
    console.log('✅ Clé API Brevo détectée');
    console.log(`   Clé : ${process.env.BREVO_API_KEY?.substring(0, 15)}...`);
    
    console.log(`✅ Email d'envoi : ${process.env.BREVO_FROM_EMAIL || 'noreply@trustiscore.fr'}`);
    console.log(`✅ Nom d'envoi : ${process.env.BREVO_FROM_NAME || 'TrustiScore'}`);
    console.log(`✅ Frontend URL : ${process.env.FRONTEND_URL}`);
    console.log(`✅ Environnement : ${process.env.NODE_ENV}`);
    
    console.log('\n📊 Service actuel :');
    console.log('   🟢 BREVO (Sendinblue)');
    console.log('   ✅ 9000 emails/mois GRATUITS');
    console.log('   ✅ PAS DE SANDBOX - Envoi à n\'importe quel email');
    console.log('   ✅ Pas de vérification d\'emails requise');
    
    // Tester la connexion à l'API Brevo
    console.log('\n🔌 Test de connexion à l\'API Brevo...');
    
    const apiInstance = new brevo.AccountApi();
    apiInstance.setApiKey(
      brevo.AccountApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    try {
      const accountInfo = await apiInstance.getAccount();
      console.log('✅ Connexion réussie à l\'API Brevo !');
      console.log(`   📧 Email du compte : ${accountInfo.email}`);
      console.log(`   📊 Plan : ${accountInfo.plan?.[0]?.type || 'Free'}`);
      
      // Afficher les limites
      if (accountInfo.plan?.[0]?.credits) {
        console.log(`   📮 Crédits emails : ${accountInfo.plan[0].credits}`);
      }
      
      console.log('\n✨ Votre compte Brevo est actif et prêt à envoyer !');
      
    } catch (apiError) {
      console.error('❌ Erreur de connexion à l\'API Brevo');
      console.log('\n💡 Vérifiez que votre clé API est correcte');
      console.log('💡 Assurez-vous d\'avoir créé une clé v3 (pas v2)');
      throw apiError;
    }
    
    // Test d'envoi si un email est fourni
    const testEmail = process.argv[2];
    if (testEmail && testEmail.includes('@')) {
      console.log(`\n🚀 Envoi d'un email de test à ${testEmail}...`);
      
      try {
        const emailApi = new brevo.TransactionalEmailsApi();
        emailApi.setApiKey(
          brevo.TransactionalEmailsApiApiKeys.apiKey,
          process.env.BREVO_API_KEY
        );

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = '🧪 Test de configuration Brevo - TrustiScore';
        sendSmtpEmail.to = [{ email: testEmail }];
        sendSmtpEmail.sender = {
          name: process.env.BREVO_FROM_NAME || 'TrustiScore',
          email: process.env.BREVO_FROM_EMAIL || 'noreply@trustiscore.fr'
        };
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #667eea;">✅ Test réussi !</h1>
            <p>Votre configuration Brevo fonctionne parfaitement.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service :</strong> Brevo (Sendinblue)</p>
              <p><strong>Email envoyé depuis :</strong> ${process.env.BREVO_FROM_EMAIL || 'noreply@trustiscore.fr'}</p>
              <p><strong>Mode :</strong> ${process.env.NODE_ENV}</p>
              <p><strong>Limite gratuite :</strong> 9000 emails/mois</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              🎉 Vous pouvez maintenant envoyer des emails à n'importe quelle adresse sans restriction !
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px;">TrustiScore - Test de configuration</p>
          </div>
        `;
        
        const result = await emailApi.sendTransacEmail(sendSmtpEmail);
        
        console.log('✅ Email envoyé avec succès !');
        console.log(`   ID : ${result.messageId}`);
        console.log('\n   ℹ️  Vérifiez votre boîte mail (et les spams si besoin)');
        console.log('   ℹ️  Consultez les logs sur https://app.brevo.com/email/logs');
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi :', error.message);
        
        if (error.message.includes('Unauthorized')) {
          console.log('\n   💡 Votre clé API semble invalide');
          console.log('   💡 Vérifiez que vous avez copié la clé complète');
        } else if (error.message.includes('sender')) {
          console.log('\n   💡 Problème avec l\'email d\'envoi');
          console.log('   💡 Vérifiez BREVO_FROM_EMAIL dans votre .env');
        }
      }
    } else {
      console.log('\n📧 Pour tester l\'envoi d\'un email :');
      console.log('   node check-brevo-config.js votre@email.com');
    }
    
    console.log('\n📚 Documentation :');
    console.log('   • Brevo Dashboard : https://app.brevo.com');
    console.log('   • Logs d\'emails : https://app.brevo.com/email/logs');
    console.log('   • Documentation API : https://developers.brevo.com');
    console.log('   • Guide complet : EMAIL_SERVICES_ALTERNATIVES.md');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification :', error.message);
    console.log('\n💡 Vérifiez que votre fichier .env est correctement configuré');
    console.log('💡 Voir EMAIL_SERVICES_ALTERNATIVES.md pour la configuration complète\n');
  }
}

// Exécuter la vérification
checkBrevoConfig().catch(console.error);
