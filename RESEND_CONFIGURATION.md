# Configuration Resend pour l'envoi d'emails

## 🔍 Diagnostic actuel

Votre projet utilise actuellement :
- **Email d'envoi** : `onboarding@resend.dev` (mode sandbox)
- **Limitation** : En mode sandbox, Resend n'envoie les emails qu'aux adresses vérifiées

## 📧 Solution 1 : Ajouter des emails de test (Développement)

### Étape 1 : Vérifier des emails supplémentaires
1. Connectez-vous à [Resend](https://resend.com)
2. Allez dans **Settings** → **Team** ou cherchez "Verified emails"
3. Cliquez sur **Add Email**
4. Entrez l'adresse email à autoriser
5. Un email de vérification sera envoyé
6. Cliquez sur le lien de vérification
7. Répétez pour chaque email que vous souhaitez tester

### Avantages
- ✅ Gratuit et immédiat
- ✅ Parfait pour le développement
- ✅ Jusqu'à 100 emails vérifiés

### Inconvénients
- ❌ Limité aux emails vérifiés
- ❌ Non adapté pour la production

---

## 🚀 Solution 2 : Vérifier votre domaine (Production)

### Étape 1 : Ajouter votre domaine dans Resend

1. Connectez-vous à [Resend](https://resend.com)
2. Allez dans **Domains**
3. Cliquez sur **Add Domain**
4. Entrez votre domaine (ex: `trusti.fr` ou `trustiscore.com`)
5. Resend vous fournira des enregistrements DNS à configurer

### Étape 2 : Configurer les enregistrements DNS

Resend vous donnera 3 types d'enregistrements à ajouter :

#### A. Enregistrement SPF (Type: TXT)
```
Nom: @ ou votre-domaine.com
Type: TXT
Valeur: v=spf1 include:resend.com ~all
```

#### B. Enregistrement DKIM (Type: TXT)
```
Nom: resend._domainkey
Type: TXT
Valeur: [fourni par Resend]
```

#### C. Enregistrement DMARC (Type: TXT) - Optionnel mais recommandé
```
Nom: _dmarc
Type: TXT
Valeur: v=DMARC1; p=none
```

### Étape 3 : Où ajouter ces enregistrements ?

Selon votre hébergeur de domaine :

**OVH**
1. Manager OVH → Domaines → Votre domaine
2. Onglet "Zone DNS"
3. "Ajouter une entrée" → TXT
4. Saisissez les valeurs

**Cloudflare**
1. Dashboard Cloudflare → Votre domaine
2. DNS → Records
3. Add record → Type: TXT
4. Saisissez les valeurs

**GoDaddy**
1. Mon compte GoDaddy → Mes domaines
2. DNS → Gérer les zones
3. Ajouter → TXT
4. Saisissez les valeurs

**Google Domains**
1. Google Domains → Votre domaine
2. DNS
3. Enregistrements personnalisés → Gérer
4. Créer un nouvel enregistrement

### Étape 4 : Attendre la vérification

- ⏱️ Propagation DNS : 5 minutes à 48 heures (généralement < 1 heure)
- 🔄 Resend vérifiera automatiquement votre domaine
- ✅ Une fois vérifié, vous pourrez envoyer à n'importe quel email

### Étape 5 : Mettre à jour votre configuration

Une fois le domaine vérifié, mettez à jour votre fichier `.env` :

```env
# Email d'envoi avec votre domaine vérifié
RESEND_FROM_EMAIL=TrustiScore <noreply@votredomaine.com>

# Ou tout autre email de votre domaine
RESEND_FROM_EMAIL=TrustiScore <hello@votredomaine.com>
RESEND_FROM_EMAIL=TrustiScore <auth@votredomaine.com>
```

### Étape 6 : Passer en production

```env
# Configuration production dans .env
FRONTEND_URL=https://trusti.vercel.app
NODE_ENV=production
RESEND_FROM_EMAIL=TrustiScore <noreply@votredomaine.com>
```

### Avantages
- ✅ Envoi illimité (selon votre plan)
- ✅ Meilleure délivrabilité
- ✅ Emails professionnels
- ✅ Pas de limite de destinataires

### Inconvénients
- ❌ Nécessite un nom de domaine
- ❌ Configuration DNS requise
- ❌ Temps de propagation DNS

---

## 🎯 Recommandation

### Pour le développement (maintenant)
→ **Utilisez la Solution 1** : Ajoutez vos emails de test

### Pour la production (avant déploiement)
→ **Utilisez la Solution 2** : Vérifiez votre domaine

---

## 🧪 Tester votre configuration

### Test en local
```bash
npm run dev
```
1. Ouvrez http://localhost:5173
2. Cliquez sur "Se connecter"
3. Entrez votre email
4. Vérifiez votre boîte mail

### Test en production
```bash
# Déployez sur Vercel
vercel --prod

# Ou via Git
git push origin main
```

---

## 📊 Limites du plan gratuit Resend

- **100 emails/jour** (3,000/mois)
- **Idéal pour** :
  - Tests et développement ✅
  - Petites applications ✅
  - MVP et prototypes ✅
  
- **Insuffisant pour** :
  - Applications à fort trafic ❌
  - Envois en masse ❌

---

## 🆘 Dépannage

### L'email n'arrive toujours pas

1. **Vérifiez les spams**
   - Ajoutez l'expéditeur à vos contacts

2. **Vérifiez les logs Resend**
   - Dashboard Resend → Logs
   - Cherchez l'email problématique
   - Vérifiez le statut (delivered, bounced, etc.)

3. **Testez avec un autre provider email**
   - Gmail, Outlook, ProtonMail se comportent différemment

4. **Vérifiez la console navigateur**
   - F12 → Console
   - Recherchez les erreurs d'API

5. **Vérifiez les logs serveur**
   ```bash
   vercel logs
   ```

### Erreurs communes

**"Access denied"**
→ Votre clé API Resend est invalide ou expirée

**"Domain not verified"**
→ Votre domaine n'est pas encore vérifié

**"Daily limit exceeded"**
→ Vous avez dépassé les 100 emails/jour du plan gratuit

---

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Vérification de domaine](https://resend.com/docs/dashboard/domains/introduction)
- [Résolution DNS](https://resend.com/docs/dashboard/domains/dns-verification)
- [Magic Links Guide](https://resend.com/docs/send-with-magic-link)

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Domaine vérifié dans Resend
- [ ] Enregistrements DNS configurés et propagés
- [ ] Tests d'envoi réussis
- [ ] `.env` mis à jour avec le bon domaine
- [ ] `FRONTEND_URL` pointe vers l'URL de production
- [ ] `NODE_ENV=production`
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Test de bout en bout en production

---

Besoin d'aide ? Consultez [MAGIC_LINK_SETUP.md](./MAGIC_LINK_SETUP.md) pour plus de détails sur l'authentification.
