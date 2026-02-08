# 🚀 Migration de Resend vers Brevo - TrustiScore

## ✅ Migration effectuée !

Votre projet a été migré de Resend vers Brevo (Sendinblue).

### 🎉 Avantages de Brevo

- ✅ **9000 emails/mois GRATUITS** (vs 3000 avec Resend)
- ✅ **PAS DE SANDBOX** - Envoi immédiat à n'importe quel email
- ✅ Pas besoin de vérifier chaque email de test
- ✅ Interface en français
- ✅ Meilleure limite gratuite

---

## 📋 Ce qui a été fait

### 1. ✅ Package installé
```bash
npm install @getbrevo/brevo
```

### 2. ✅ Fichiers créés/modifiés

| Fichier | Action | Description |
|---------|--------|-------------|
| `api/send-magic-link.js` | ✏️ Remplacé | Version Brevo active |
| `api/send-magic-link-resend-backup.js` | ➕ Créé | Backup de l'ancienne version Resend |
| `api/send-magic-link-brevo.js` | ➕ Créé | Source de la version Brevo |
| `check-brevo-config.js` | ➕ Créé | Script de vérification et test |
| `.env` | ✏️ Modifié | Nouvelles variables Brevo |
| `.env.example` | ✏️ Modifié | Template mis à jour |
| `package.json` | ✏️ Modifié | Nouveaux scripts npm |

### 3. ✅ Scripts npm disponibles

```bash
# Vérifier la configuration Brevo
npm run check:brevo

# Tester l'envoi d'email
npm run test:email votre@email.com

# Vérifier l'ancienne config Resend (si besoin)
npm run check:resend
```

---

## 🔑 Configuration requise

### Étape 1 : Créer un compte Brevo

1. Allez sur **https://app.brevo.com/account/register**
2. Créez un compte gratuit (pas de carte bancaire requise)
3. Vérifiez votre email

### Étape 2 : Obtenir votre clé API

1. Connectez-vous à Brevo
2. Allez dans **SMTP & API** → **API Keys**
3. Cliquez sur **Create a new API key**
4. Donnez un nom (ex: "TrustiScore")
5. Copiez la clé (elle commence par `xkeysib-`)

### Étape 3 : Configurer votre `.env`

Ouvrez votre fichier `.env` et remplacez :

```env
BREVO_API_KEY=VOTRE_CLE_API_BREVO_ICI
```

Par votre vraie clé API :

```env
BREVO_API_KEY=xkeysib-1234567890abcdef...
```

Vous pouvez aussi personnaliser :

```env
BREVO_FROM_EMAIL=noreply@votredomaine.com
BREVO_FROM_NAME=TrustiScore
```

⚠️ **Important** : Si vous n'avez pas de domaine vérifié, vous pouvez utiliser n'importe quel email. Brevo fonctionnera quand même (contrairement à Resend) mais les emails risquent d'aller dans les spams.

---

## 🧪 Tester votre configuration

### Test 1 : Vérifier la configuration

```bash
npm run check:brevo
```

**Résultat attendu :**
```
✅ Clé API Brevo détectée
✅ Email d'envoi : noreply@trustiscore.fr
✅ Connexion réussie à l'API Brevo !
📧 Email du compte : votre@email.com
📊 Plan : Free
✨ Votre compte Brevo est actif et prêt à envoyer !
```

### Test 2 : Envoyer un email de test

```bash
npm run test:email votre-email@exemple.com
```

**Résultat attendu :**
```
✅ Email envoyé avec succès !
ID : <message-id>
ℹ️  Vérifiez votre boîte mail
```

### Test 3 : Tester l'application complète

```bash
npm run dev
```

1. Ouvrez http://localhost:5173
2. Cliquez sur "Se connecter"
3. Entrez **N'IMPORTE QUEL email** (plus de restrictions !)
4. Vérifiez votre boîte mail
5. Cliquez sur le lien de connexion

---

## 🔄 Rollback vers Resend (si nécessaire)

Si vous voulez revenir à Resend :

### 1. Restaurer l'ancien fichier

```bash
Copy-Item -Path "api\send-magic-link-resend-backup.js" -Destination "api\send-magic-link.js" -Force
```

### 2. Restaurer les variables d'environnement

Dans `.env`, décommentez :

```env
RESEND_API_KEY=re_fvFMhbsU_9KDqLsDyTULEHmEQmZ6Bue17
RESEND_FROM_EMAIL=TrustiScore <onboarding@resend.dev>
```

Et commentez Brevo :

```env
# BREVO_API_KEY=xkeysib-...
# BREVO_FROM_EMAIL=noreply@trustiscore.fr
# BREVO_FROM_NAME=TrustiScore
```

### 3. Désinstaller Brevo (optionnel)

```bash
npm uninstall @getbrevo/brevo
```

---

## 📊 Comparaison Resend vs Brevo

| Critère | Resend | Brevo |
|---------|--------|-------|
| **Emails gratuits/mois** | 3000 | 9000 |
| **Mode sandbox** | ✅ Oui (restrictif) | ❌ Non |
| **Vérification emails** | ✅ Requise | ❌ Non requise |
| **Setup** | 5 min | 5 min |
| **Délivrabilité** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Interface** | Anglais | Français |
| **Documentation** | Excellente | Bonne |
| **Support** | Bon | Bon |

---

## 🚀 Déploiement sur Vercel

N'oubliez pas de configurer les variables d'environnement sur Vercel :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :

```
BREVO_API_KEY=xkeysib-votre-cle-ici
BREVO_FROM_EMAIL=noreply@votredomaine.com
BREVO_FROM_NAME=TrustiScore
FRONTEND_URL=https://trusti.vercel.app
DATABASE_URL=postgresql://...
NODE_ENV=production
```

3. Redéployez votre application

---

## 🎯 Prochaines étapes recommandées

### 1. Vérifier votre domaine (optionnel mais recommandé)

Pour améliorer la délivrabilité :

1. Brevo Dashboard → **Senders, Domains & Dedicated IPs** → **Domains**
2. Ajoutez votre domaine
3. Configurez les enregistrements DNS (SPF, DKIM)
4. Une fois vérifié, utilisez `noreply@votredomaine.com`

### 2. Personnaliser le template d'email

Modifiez `api/send-magic-link.js` pour personnaliser :
- Le contenu HTML
- Le design
- Les textes

### 3. Monitorer vos envois

Consultez régulièrement :
- **Dashboard Brevo** : https://app.brevo.com
- **Logs d'emails** : https://app.brevo.com/email/logs
- **Statistiques** : Opens, clicks, bounces

---

## 🆘 Dépannage

### Erreur : "Unauthorized" ou "Invalid API key"

**Solution** :
1. Vérifiez que vous avez copié la clé API complète
2. Assurez-vous d'avoir créé une clé v3 (pas v2)
3. Re-générez une nouvelle clé si nécessaire

### Erreur : "Sender not configured"

**Solution** :
1. Vérifiez `BREVO_FROM_EMAIL` dans votre `.env`
2. Utilisez un email valide (même sans domaine vérifié, ça marchera)

### Les emails vont dans les spams

**Solutions** :
1. Vérifiez votre domaine dans Brevo (recommandé)
2. Configurez SPF et DKIM
3. Demandez aux utilisateurs d'ajouter votre email aux contacts

### Le test échoue : "Cannot find module @getbrevo/brevo"

**Solution** :
```bash
npm install @getbrevo/brevo
```

---

## 📚 Ressources

- **Dashboard Brevo** : https://app.brevo.com
- **Documentation API** : https://developers.brevo.com
- **Support Brevo** : https://help.brevo.com
- **Logs emails** : https://app.brevo.com/email/logs
- **Guide Brevo complet** : EMAIL_SERVICES_ALTERNATIVES.md

---

## ✅ Checklist de migration

Avant de lancer en production :

- [ ] Compte Brevo créé
- [ ] Clé API obtenue et configurée dans `.env`
- [ ] Test de configuration réussi (`npm run check:brevo`)
- [ ] Test d'envoi réussi (`npm run test:email`)
- [ ] Test complet sur l'application locale
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Application redéployée
- [ ] Test en production avec un vrai utilisateur
- [ ] Domaine vérifié (optionnel mais recommandé)

---

## 🎉 Félicitations !

Vous n'avez plus de restrictions d'emails ! Vous pouvez maintenant :

✅ Envoyer à n'importe quel email sans vérification préalable  
✅ Profiter de 9000 emails/mois gratuits  
✅ Tester avec tous vos emails personnels  
✅ Inviter n'importe qui à tester votre app  

Bonne continuation avec TrustiScore ! 🚀
