# 📧 Comment ajouter un email vérifié dans Resend

## Guide étape par étape (Mode Sandbox)

### Étape 1 : Connexion à Resend

1. Allez sur **https://resend.com/login**
2. Connectez-vous avec vos identifiants

---

### Étape 2 : Accéder aux paramètres

Il existe **DEUX méthodes** pour ajouter des emails vérifiés :

#### Méthode A : Via les Settings (Recommandé)

1. Cliquez sur votre profil en haut à droite
2. Sélectionnez **"Settings"**
3. Dans le menu latéral, cherchez **"Audience"** ou **"API Keys"**
4. Si vous voyez une option **"Verified emails"**, cliquez dessus

#### Méthode B : Via les Domains

1. Dans le menu principal, cliquez sur **"Domains"**
2. Vous verrez `onboarding@resend.dev` (votre domaine sandbox actuel)
3. Cliquez sur ce domaine
4. Cherchez une section **"Verified recipients"** ou **"Test emails"**

---

### Étape 3 : Ajouter un nouvel email

Une fois que vous avez trouvé la bonne section :

1. Cliquez sur le bouton **"Add email"** ou **"Add recipient"** ou **"Verify email"**

2. Une fenêtre s'ouvre - Entrez l'adresse email à vérifier :
   ```
   [                                    ]
   ```
   Exemple : `votre-email@gmail.com`

3. Cliquez sur **"Send verification"** ou **"Add"**

---

### Étape 4 : Vérifier l'email

1. **Consultez votre boîte mail** de l'adresse que vous venez d'ajouter

2. Vous devriez recevoir un email de Resend avec un sujet du type :
   ```
   Verify your email address for Resend
   ```

3. **Ouvrez l'email** et cliquez sur le bouton ou lien de vérification

4. Vous serez redirigé vers une page Resend confirmant la vérification

---

### Étape 5 : Confirmation

De retour sur le dashboard Resend :

1. Rafraîchissez la page
2. L'email devrait maintenant apparaître avec un statut **"Verified"** ✅
3. Un badge vert ou une icône de validation devrait être visible

---

## 🎯 Cas d'usage typiques

### Ajouter plusieurs emails d'équipe

```
✅ developpeur@votreentreprise.com
✅ marketing@votreentreprise.com  
✅ support@votreentreprise.com
```

Répétez les étapes 3-5 pour chaque email.

### Ajouter vos emails personnels de test

```
✅ votre-email-perso@gmail.com
✅ votre-email-pro@outlook.com
✅ autre-email@proton.me
```

---

## 🧪 Tester immédiatement

Une fois l'email vérifié, testez-le :

```bash
npm run test:email votre-email-verifie@example.com
```

Vous devriez recevoir un email de test de TrustiScore !

---

## ⚠️ Si vous ne trouvez pas l'option "Verified emails"

C'est possible que Resend ait changé son interface. Voici les alternatives :

### Option 1 : Chercher dans toute l'interface

1. Dans le dashboard Resend, utilisez `Ctrl+F` (ou `Cmd+F` sur Mac)
2. Cherchez les mots-clés : **"verify"**, **"recipient"**, **"audience"**, **"allowed"**

### Option 2 : Utiliser l'API directement

Vous pouvez aussi envoyer directement un email de test. S'il échoue avec un message d'erreur spécifique, ça confirmera que l'email n'est pas vérifié :

```bash
npm run test:email nouvel-email@example.com
```

**Message d'erreur attendu :**
```
❌ Erreur lors de l'envoi
💡 En mode sandbox, vous ne pouvez envoyer qu'aux emails vérifiés
💡 Ajoutez cet email dans Resend : https://resend.com/settings
```

### Option 3 : Contacter le support Resend

Si vraiment vous ne trouvez pas :
1. Allez sur https://resend.com/support
2. Ou envoyez un email à : support@resend.com
3. Demandez : "Comment puis-je ajouter des emails vérifiés pour les tests en mode sandbox ?"

---

## 🔍 Vérifier quels emails sont déjà vérifiés

Pour voir la liste de tous vos emails vérifiés :

1. Retournez dans **Settings** ou **Domains** > `onboarding@resend.dev`
2. Vous devriez voir une liste des emails avec leur statut
3. Les emails vérifiés ont un badge ✅ ou "Verified"

**Actuellement vérifié dans votre compte :**
- ✅ davidg.c.D@proton.me (déjà présent)

**À ajouter :**
- ⏳ Vos autres emails de test

---

## 📊 Limites

**Mode Sandbox (actuel) :**
- ✅ Jusqu'à **100 emails vérifiés**
- ✅ Idéal pour le développement
- ❌ Ne peut PAS envoyer à des emails non vérifiés

**Mode Production (avec domaine vérifié) :**
- ✅ Envoi illimité à n'importe quel email
- ✅ Pas de limite de destinataires
- ✅ Meilleure délivrabilité

---

## 🆘 Dépannage

### L'email de vérification n'arrive pas

1. **Vérifiez les spams** - C'est souvent là !
2. **Réessayez** - Cliquez sur "Resend verification email"
3. **Essayez un autre email** - Parfois certains providers bloquent
4. **Attendez quelques minutes** - Délai de livraison possible

### L'email est vérifié mais ça ne marche toujours pas

1. **Rafraîchissez le cache** :
   ```bash
   # Redémarrez votre serveur si actif
   npm run dev
   ```

2. **Vérifiez la casse** - `Email@example.com` ≠ `email@example.com`
   - Dans votre code, les emails sont convertis en minuscules
   - Assurez-vous que c'est pareil dans Resend

3. **Consultez les logs Resend**:
   - Dashboard Resend → **Emails** ou **Logs**
   - Cherchez vos tentatives d'envoi récentes
   - Regardez le statut et les erreurs

---

## ✅ Checklist de vérification

Avant de tester :

- [ ] Email ajouté dans Resend
- [ ] Email de vérification reçu et lien cliqué
- [ ] Statut "Verified" ✅ visible dans Resend
- [ ] Page Resend rafraîchie
- [ ] Test avec `npm run test:email <votre-email>`

---

## 🎬 Résumé rapide

```
1. https://resend.com/login
2. Settings → Verified emails (ou Domains → onboarding@resend.dev)
3. Add email → Entrer l'adresse
4. Vérifier l'email reçu (cliquer le lien)
5. Confirmer le badge ✅
6. Tester : npm run test:email votre@email.com
```

---

## 📸 À quoi ça ressemble

L'interface devrait montrer quelque chose comme :

```
┌─────────────────────────────────────────────────┐
│ Verified emails                                 │
├─────────────────────────────────────────────────┤
│ davidg.c.D@proton.me        ✅ Verified         │
│ [+ Add email]                                   │
└─────────────────────────────────────────────────┘
```

Après l'ajout :

```
┌─────────────────────────────────────────────────┐
│ Verified emails                                 │
├─────────────────────────────────────────────────┤
│ davidg.c.D@proton.me        ✅ Verified         │
│ nouveau@email.com           ✅ Verified         │
│ [+ Add email]                                   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Prochaines étapes

Une fois vos emails vérifiés :

1. **Testez votre application** :
   ```bash
   npm run dev
   ```
   → Ouvrez http://localhost:5173
   → Cliquez "Se connecter"
   → Entrez un de vos emails vérifiés
   → Vérifiez votre boîte mail

2. **Préparez la production** :
   - Voir [RESEND_CONFIGURATION.md](./RESEND_CONFIGURATION.md) pour vérifier un domaine

---

Besoin d'aide ? Vous pouvez aussi faire des captures d'écran de votre interface Resend et je vous guiderai !
