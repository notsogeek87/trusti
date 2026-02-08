# 📧 Alternatives à Resend pour l'envoi d'emails

## Comparaison des services d'envoi d'emails

### 🏆 Services sans restriction sandbox

Ces services permettent d'envoyer à **n'importe quelle adresse email** dès le départ, sans vérification préalable :

---

## 1. **Brevo (ex-Sendinblue)** ⭐ RECOMMANDÉ

### ✅ Avantages
- **300 emails/jour GRATUITS** sans limite de destinataires
- ✅ Pas de mode sandbox - envoi immédiat à tous
- ✅ Interface en français
- ✅ Support SMTP et API
- ✅ Tracking des emails (ouvertures, clics)
- ✅ Templates HTML intégrés
- ✅ Documentation excellente

### ❌ Inconvénients
- 300 emails/jour maximum (gratuit)
- Nécessite création de compte

### 💰 Tarifs
- **Gratuit** : 300 emails/jour (9000/mois)
- **Lite** : 5000 emails/mois - 25€/mois
- **Business** : Illimité - À partir de 65€/mois

### 🔗 Liens
- Site : https://www.brevo.com
- Documentation : https://developers.brevo.com/
- NPM : `npm install @sendinblue/client` ou `npm install sib-api-v3-sdk`

### 🚀 Setup rapide
```javascript
import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendSmtpEmail = {
  sender: { email: 'noreply@votredomaine.com', name: 'TrustiScore' },
  to: [{ email: email }],
  subject: 'Votre lien de connexion',
  htmlContent: '<p>Votre contenu HTML</p>'
};

await apiInstance.sendTransacEmail(sendSmtpEmail);
```

---

## 2. **Mailgun** ⭐ TRÈS BON

### ✅ Avantages
- **5000 emails/mois GRATUITS** (3 mois)
- ✅ Pas de sandbox restrictif après vérification du domaine
- ✅ API simple et puissante
- ✅ Excellente délivrabilité
- ✅ Supporte les domaines custom facilement
- ✅ Logs détaillés

### ❌ Inconvénients
- Nécessite carte bancaire même pour le plan gratuit
- Après 3 mois : 0.001$/email ou abonnement

### 💰 Tarifs
- **Trial** : 5000 emails/mois (3 mois gratuits)
- **Foundation** : 100 emails/jour - 15$/mois
- **Growth** : 50k emails/mois - 35$/mois

### 🔗 Liens
- Site : https://www.mailgun.com
- Documentation : https://documentation.mailgun.com/
- NPM : `npm install mailgun.js`

### 🚀 Setup rapide
```javascript
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

await mg.messages.create('votredomaine.com', {
  from: 'TrustiScore <noreply@votredomaine.com>',
  to: [email],
  subject: 'Votre lien de connexion',
  html: '<p>Votre contenu HTML</p>'
});
```

---

## 3. **Amazon SES** 💰 ÉCONOMIQUE

### ✅ Avantages
- **62,000 emails/mois GRATUITS** (si hébergé sur AWS)
- **3000 emails/mois gratuits** sinon
- ✅ Très économique après : 0.10$/1000 emails
- ✅ Infrastructure AWS robuste
- ✅ Pas de limite réelle de volume
- ✅ Excellente délivrabilité

### ❌ Inconvénients
- Mode "sandbox" au départ (comme Resend)
- Nécessite demande pour sortir du sandbox (24-48h)
- Configuration plus complexe
- Interface AWS moins intuitive
- Nécessite compte AWS

### 💰 Tarifs
- **Gratuit** : 3000 emails/mois (ou 62k si hébergé sur AWS)
- **Après** : 0.10$/1000 emails

### 🔗 Liens
- Site : https://aws.amazon.com/ses/
- Documentation : https://docs.aws.amazon.com/ses/
- NPM : `npm install @aws-sdk/client-ses`

### ⚠️ Note sandbox
Pour sortir du mode sandbox (obligatoire) :
1. AWS Console → SES → Account dashboard
2. "Request production access"
3. Remplir le formulaire (24-48h de délai)

---

## 4. **SendGrid (Twilio)** 

### ✅ Avantages
- **100 emails/jour GRATUITS** (3000/mois)
- ✅ API simple
- ✅ Interface intuitive
- ✅ Templates visuels
- ✅ Analytics inclus

### ❌ Inconvénients
- Limite basse sur le plan gratuit (100/jour)
- Nécessite vérification du domaine pour de bons taux
- Support moyen

### 💰 Tarifs
- **Free** : 100 emails/jour
- **Essentials** : 50k emails/mois - 15$/mois
- **Pro** : 1.5M emails/mois - 60$/mois

### 🔗 Liens
- Site : https://sendgrid.com
- Documentation : https://docs.sendgrid.com/
- NPM : `npm install @sendgrid/mail`

---

## 5. **Postmark** ⭐ QUALITÉ PREMIUM

### ✅ Avantages
- **100 emails/mois GRATUITS**
- ✅ **Meilleure délivrabilité du marché**
- ✅ Spécialisé dans les emails transactionnels
- ✅ Interface excellente
- ✅ Support réactif
- ✅ Templates inclus

### ❌ Inconvénients
- Seulement 100 emails/mois gratuits (très limité)
- Plus cher que les concurrents

### 💰 Tarifs
- **Trial** : 100 emails/mois gratuits
- **Production** : 10$/mois pour 10k emails

### 🔗 Liens
- Site : https://postmarkapp.com
- Documentation : https://postmarkapp.com/developer
- NPM : `npm install postmark`

---

## 6. **SMTP2GO**

### ✅ Avantages
- **1000 emails/mois GRATUITS**
- ✅ Pas de carte bancaire requise
- ✅ Envoi immédiat sans sandbox
- ✅ Interface simple
- ✅ Support SMTP natif

### ❌ Inconvénients
- Moins connu, documentation moyenne
- Fonctionnalités basiques

### 💰 Tarifs
- **Free** : 1000 emails/mois
- **Premium** : 10k emails/mois - 10$/mois

### 🔗 Liens
- Site : https://www.smtp2go.com
- Documentation : https://apidocs.smtp2go.com/

---

## 7. **Mailjet**

### ✅ Avantages
- **6000 emails/mois GRATUITS** (200/jour)
- ✅ Interface en français
- ✅ Collaboration en équipe
- ✅ Templates drag & drop

### ❌ Inconvénients
- Limite journalière de 200 emails
- Interface parfois lente

### 💰 Tarifs
- **Free** : 6000 emails/mois (200/jour)
- **Essential** : 15k emails/mois - 15€/mois

### 🔗 Liens
- Site : https://www.mailjet.com
- Documentation : https://dev.mailjet.com/
- NPM : `npm install node-mailjet`

---

## 📊 Tableau comparatif

| Service | Gratuit/mois | Sandbox | Délivrabilité | Facilité | Recommandé pour |
|---------|--------------|---------|---------------|----------|-----------------|
| **Brevo** | 9000 | ❌ Non | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **DEV & PROD** |
| **Mailgun** | 5000 (3 mois) | ⚠️ Léger | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **PROD** |
| **AWS SES** | 3000 | ✅ Oui* | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **SCALE** |
| **SendGrid** | 3000 | ❌ Non | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **STARTUP** |
| **Postmark** | 100 | ❌ Non | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **PREMIUM** |
| **SMTP2GO** | 1000 | ❌ Non | ⭐⭐⭐ | ⭐⭐⭐⭐ | **SIMPLE** |
| **Mailjet** | 6000 | ❌ Non | ⭐⭐⭐ | ⭐⭐⭐⭐ | **MARKETING** |
| **Resend** | 3000 | ✅ Oui | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **DEV** |

\* AWS SES nécessite une demande pour sortir du sandbox

---

## 🎯 Recommandations selon votre cas

### Pour le développement IMMÉDIAT (maintenant)
👉 **Brevo (Sendinblue)** ou **SMTP2GO**
- Pas de sandbox
- Setup en 5 minutes
- Gratuit et suffisant

### Pour une petite production
👉 **Brevo** ou **Mailgun**
- Limites généreuses
- Bon rapport qualité/prix
- Support correct

### Pour une grosse production / Scale
👉 **AWS SES** ou **Mailgun**
- Prix imbattables pour gros volumes
- Infrastructure robuste
- Analytics avancés

### Pour la meilleure délivrabilité
👉 **Postmark** ou **Mailgun**
- Spécialisés dans le transactionnel
- Taux de délivrabilité >99%
- Support premium

---

## 🚀 Migration recommandée : Brevo (Sendinblue)

### Pourquoi Brevo ?
- ✅ **9000 emails/mois gratuits** (vs 3000 pour Resend)
- ✅ **Pas de sandbox** - Envoi immédiat à tous
- ✅ Interface en français
- ✅ Setup ultra-rapide
- ✅ Pas de carte bancaire requise

### Installation

```bash
npm install sib-api-v3-sdk
```

### Configuration

**1. Créer un compte**
- https://app.brevo.com/account/register

**2. Obtenir la clé API**
- Dashboard → SMTP & API → API Keys
- Créer une clé v3

**3. Mettre à jour `.env`**
```env
BREVO_API_KEY=xkeysib-votre-cle-ici
BREVO_FROM_EMAIL=TrustiScore <noreply@votredomaine.com>
BREVO_FROM_NAME=TrustiScore
```

### Code d'intégration

Je peux créer un fichier `api/send-magic-link-brevo.js` si vous voulez migrer ?

---

## ⚡ Setup ultra-rapide avec SMTP (universel)

Si vous ne voulez pas changer de code, **tous ces services supportent SMTP** !

### Configuration SMTP (exemple avec Brevo)

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre-email@exemple.com
SMTP_PASS=votre-smtp-password
```

### Code avec Nodemailer (compatible tous services)

```bash
npm install nodemailer
```

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: 'TrustiScore <noreply@votredomaine.com>',
  to: email,
  subject: 'Votre lien de connexion',
  html: '<p>Contenu</p>'
});
```

---

## 💡 Mon conseil personnel

**Pour votre cas (TrustiScore en développement) :**

1. **Court terme** : Migrez vers **Brevo**
   - 5 minutes de setup
   - 9000 emails/mois gratuits
   - Pas de restrictions

2. **Moyen terme** : Vérifiez votre domaine dans Resend OU restez sur Brevo
   - Si vous aimez Resend : vérifiez le domaine
   - Si Brevo suffit : gardez-le (c'est gratuit !)

3. **Long terme** : Passez sur **AWS SES** ou **Mailgun**
   - Quand vous aurez du trafic important
   - Économies d'échelle

---

## 🔄 Aide à la migration

Voulez-vous que je :
1. ✅ Crée le code pour migrer vers Brevo ?
2. ✅ Crée le code pour migrer vers Mailgun ?
3. ✅ Crée une version SMTP universelle ?
4. ⏸️ Reste sur Resend et vérifie votre domaine ?

Dites-moi ce que vous préférez ! 🚀
