# 🚀 Déployer TrustiScore avec Brevo sur Vercel

## ✅ Prérequis

Vous avez déjà :
- ✅ Package `@getbrevo/brevo` installé
- ✅ Code mis à jour pour utiliser Brevo
- ✅ Clé API Brevo fonctionnelle en local
- ✅ Tests locaux réussis

---

## 📋 Configuration sur Vercel

### Étape 1 : Aller dans les Settings

1. Allez sur **https://vercel.com**
2. Ouvrez votre projet **trusti**
3. Cliquez sur **Settings** (en haut)
4. Dans le menu latéral, cliquez sur **Environment Variables**

---

### Étape 2 : Ajouter les variables d'environnement

Ajoutez ces variables **une par une** :

#### Variable 1 : BREVO_API_KEY
```
Name: BREVO_API_KEY
Value: xkeysib-VOTRE_CLE_API_BREVO_ICI
Environment: Production, Preview, Development (cochez les 3)
```
⚠️ **Utilisez votre vraie clé API obtenue depuis le dashboard Brevo**

#### Variable 2 : BREVO_FROM_EMAIL
```
Name: BREVO_FROM_EMAIL
Value: noreply@trustiscore.fr
Environment: Production, Preview, Development
```

#### Variable 3 : BREVO_FROM_NAME
```
Name: BREVO_FROM_NAME
Value: TrustiScore
Environment: Production, Preview, Development
```

#### Variable 4 : FRONTEND_URL
```
Name: FRONTEND_URL
Value: https://trusti.vercel.app
Environment: Production, Preview, Development
```
⚠️ **Important** : Remplacez `trusti.vercel.app` par votre vraie URL Vercel !

#### Variable 5 : DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_w8fXpNl5HDJU@ep-late-cherry-agyy955e-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: Production, Preview, Development
```

#### Variable 6 : NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production
```

---

### Étape 3 : Sauvegarder

Cliquez sur **Save** pour chaque variable.

Votre écran devrait ressembler à :
```
┌──────────────────────────────────────────────────────────┐
│ Environment Variables                                    │
├──────────────────────────────────────────────────────────┤
│ BREVO_API_KEY          xkeys••••••••        [Edit] [Del] │
│ BREVO_FROM_EMAIL       norep••••••••        [Edit] [Del] │
│ BREVO_FROM_NAME        Trust••••••••        [Edit] [Del] │
│ FRONTEND_URL           https••••••••        [Edit] [Del] │
│ DATABASE_URL           postg••••••••        [Edit] [Del] │
│ NODE_ENV               produ••••••••        [Edit] [Del] │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Déploiement

### Option 1 : Via Git Push (Recommandé)

Si votre projet est connecté à Git :

```bash
git add .
git commit -m "Migration vers Brevo pour l'envoi d'emails"
git push origin main
```

Vercel déploiera automatiquement ! 🎉

### Option 2 : Via Vercel CLI

```bash
vercel --prod
```

### Option 3 : Redéploiement manuel

1. Allez sur votre dashboard Vercel
2. Onglet **Deployments**
3. Cliquez sur les **3 points** du dernier déploiement
4. **Redeploy**

---

## ⚠️ IMPORTANT : Email d'envoi

### Problème potentiel

Vous utilisez `noreply@trustiscore.fr` mais si **vous ne possédez pas ce domaine**, les emails risquent d'aller dans les spams.

### Solutions

#### Solution 1 : Utiliser votre vrai domaine (Recommandé)

Si vous avez un domaine (ex: `votredomaine.com`) :

1. Dans Brevo, allez dans **Senders, Domains & Dedicated IPs** → **Domains**
2. Ajoutez votre domaine
3. Configurez les DNS (SPF, DKIM)
4. Une fois vérifié, changez la variable sur Vercel :
   ```
   BREVO_FROM_EMAIL=noreply@votredomaine.com
   ```

#### Solution 2 : Utiliser votre email Brevo

Vous pouvez utiliser l'email avec lequel vous vous êtes inscrit à Brevo :

```
BREVO_FROM_EMAIL=votre-email@gmail.com
```

(Remplacez par votre vrai email Brevo)

#### Solution 3 : Laisser tel quel (Temporaire)

Brevo acceptera l'envoi mais :
- ⚠️ Risque élevé de spam
- ⚠️ Destinataires verront "via brevo.com"
- ✅ Fonctionne pour les tests

---

## 🧪 Tester en production

### 1. Attendez le déploiement

Sur Vercel, attendez que le statut soit **Ready** (≈ 2 minutes).

### 2. Testez l'application

1. Ouvrez votre app : `https://trusti.vercel.app`
2. Cliquez sur **Se connecter**
3. Entrez **n'importe quel email**
4. Vérifiez votre boîte mail
5. Cliquez sur le lien magique

### 3. Vérifiez les logs

Si ça ne marche pas, consultez les logs :

```bash
vercel logs
```

Ou sur le dashboard Vercel :
1. **Functions** (dans le menu du projet)
2. Cliquez sur `/api/send-magic-link`
3. Consultez les logs d'exécution

---

## 🔍 Vérifier que les variables sont configurées

### Méthode 1 : Via le dashboard

1. Vercel → Votre projet → **Settings** → **Environment Variables**
2. Vérifiez que toutes les 6 variables sont présentes

### Méthode 2 : Via un log test

Ajoutez temporairement ce log dans `api/send-magic-link.js` :

```javascript
console.log('Brevo configured:', !!process.env.BREVO_API_KEY);
```

Puis consultez les logs après un test d'envoi.

---

## 📊 Monitoring

### Dashboard Brevo

Consultez vos envois en temps réel :
- https://app.brevo.com/email/logs

Vous verrez :
- ✅ Emails envoyés
- 📬 Emails délivrés
- 📭 Emails ouverts
- ⚠️ Emails en spam
- ❌ Emails rejetés (bounces)

---

## 🆘 Dépannage

### Erreur : "BREVO_API_KEY is not defined"

**Cause** : Variables d'environnement non configurées

**Solution** :
1. Vérifiez que vous avez bien ajouté les variables sur Vercel
2. Redéployez l'application
3. Les variables ne sont appliquées qu'au prochain déploiement !

### Erreur : "Unauthorized"

**Cause** : Clé API invalide

**Solution** :
1. Vérifiez que vous avez copié la clé complète
2. Vérifiez qu'il n'y a pas d'espaces
3. Regénérez une nouvelle clé si nécessaire

### Les emails n'arrivent pas

**Causes possibles** :
1. **Spams** - Vérifiez les courriers indésirables
2. **Domaine non vérifié** - Vérifiez votre domaine dans Brevo
3. **Quota dépassé** - Vérifiez sur Brevo Dashboard

**Solution** :
1. Consultez les logs Brevo : https://app.brevo.com/email/logs
2. Vérifiez le statut de l'email (delivered, bounced, spam)
3. Si "spam", vérifiez votre domaine d'envoi

### Erreur : "Cannot find module @getbrevo/brevo"

**Cause** : Package non installé ou pas dans package.json

**Solution** :
```bash
npm install @getbrevo/brevo --save
git add package.json package-lock.json
git commit -m "Add @getbrevo/brevo dependency"
git push
```

---

## ✅ Checklist de déploiement

Avant de déployer :

- [x] Package `@getbrevo/brevo` dans `package.json`
- [ ] Variables d'environnement configurées sur Vercel
- [ ] FRONTEND_URL correcte (votre URL Vercel)
- [ ] Code poussé sur Git
- [ ] Déploiement terminé (statut Ready)
- [ ] Test d'envoi d'email réussi en production
- [ ] Vérification des logs Brevo
- [ ] Domaine d'envoi vérifié (optionnel mais recommandé)

---

## 🎯 Après le déploiement

### 1. Vérifier le domaine (Recommandé)

Pour améliorer la délivrabilité :
1. Brevo → **Domains**
2. Ajoutez votre domaine
3. Configurez DNS
4. Mettez à jour `BREVO_FROM_EMAIL` sur Vercel

### 2. Monitorer régulièrement

Consultez le dashboard Brevo chaque semaine :
- Nombre d'emails envoyés
- Taux de délivrabilité
- Taux d'ouverture
- Emails en spam

### 3. Optimiser

Si beaucoup d'emails vont en spam :
- Vérifiez votre domaine
- Configurez SPF/DKIM/DMARC
- Utilisez un email professionnel

---

## 📚 Ressources

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Dashboard Brevo** : https://app.brevo.com
- **Logs Brevo** : https://app.brevo.com/email/logs
- **Documentation Vercel** : https://vercel.com/docs/environment-variables

---

## 🚀 Résumé rapide

```bash
# 1. Configurer les variables sur Vercel
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=noreply@trustiscore.fr
BREVO_FROM_NAME=TrustiScore
FRONTEND_URL=https://trusti.vercel.app
DATABASE_URL=postgresql://...
NODE_ENV=production

# 2. Déployer
git add .
git commit -m "Migration Brevo"
git push origin main

# 3. Tester
# Ouvrir votre app et tester la connexion

# 4. Vérifier
vercel logs
# ou dashboard Brevo
```

---

Vous êtes prêt ! Une fois les variables configurées sur Vercel, tout fonctionnera comme en local. 🎉
