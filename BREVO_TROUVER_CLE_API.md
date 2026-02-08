# 🔍 Trouver votre clé API Brevo - Guide visuel détaillé

## Navigation dans le dashboard Brevo

L'interface Brevo a plusieurs versions selon votre pays/langue. Voici **toutes les façons** de trouver votre clé API :

---

## Méthode 1 : Via le menu principal (Recommandé)

### Étapes :

1. **Connectez-vous** à https://app.brevo.com

2. **Cherchez dans le menu de gauche** l'une de ces options :
   - 📧 **"SMTP & API"** (en anglais)
   - 📧 **"SMTP et API"** (en français)
   - 🔌 **"Integrations"** ou **"Intégrations"**
   - ⚙️ **"Settings"** ou **"Paramètres"**

3. **Si vous voyez "SMTP & API" directement** :
   - Cliquez dessus
   - Vous verrez apparaître un sous-menu
   - Cliquez sur **"API Keys"** ou **"Clés API"**
   
4. **Si vous ne voyez pas "SMTP & API"** :
   - Continuez à la Méthode 2

---

## Méthode 2 : Via les Paramètres/Settings

### Étapes :

1. En haut à droite, cliquez sur **votre nom** ou **l'icône de profil**

2. Dans le menu déroulant, cherchez :
   - ⚙️ **"Settings"** (anglais)
   - ⚙️ **"Paramètres"** (français)
   - ⚙️ **"Account Settings"**
   - ⚙️ **"Réglages du compte"**

3. Une fois dans les paramètres, cherchez dans le menu latéral :
   - 🔑 **"API Keys"**
   - 🔑 **"Clés API"**
   - 🔌 **"SMTP & API"**
   - 🔌 **"API & SMTP"**

4. Cliquez dessus

---

## Méthode 3 : Via l'URL directe (Le plus rapide !)

Utilisez directement ces URLs :

### Pour les clés API v3 (recommandé) :
```
https://app.brevo.com/settings/keys/api
```

### Pour SMTP :
```
https://app.brevo.com/settings/keys/smtp
```

### Page générale Settings :
```
https://app.brevo.com/settings
```

**💡 Astuce** : Copiez-collez l'une de ces URLs dans votre navigateur pendant que vous êtes connecté à Brevo.

---

## Méthode 4 : Recherche dans le dashboard

1. Cherchez une **barre de recherche** (icône 🔍) dans le dashboard
2. Tapez : **"API Keys"** ou **"API"** ou **"clés"**
3. Cliquez sur le résultat correspondant

---

## 📋 Une fois sur la page API Keys

Vous devriez voir une page avec :

```
┌─────────────────────────────────────────────────────┐
│  API Keys / Clés API                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Version 3                                          │
│                                                     │
│  [+ Create a new API key]  ou  [+ Créer une clé]   │
│                                                     │
│  Existing keys:                                     │
│  • Ma première clé          [View] [Delete]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 Créer votre clé API

1. Cliquez sur le bouton **"Create a new API key"** ou **"Créer une nouvelle clé API"**

2. Une fenêtre s'ouvre :
   ```
   ┌──────────────────────────────────────┐
   │  Create API Key                      │
   ├──────────────────────────────────────┤
   │  Name: [TrustiScore           ]      │
   │                                      │
   │  Version: (•) v3  ( ) v2             │
   │                                      │
   │  [ Cancel ]    [ Create API Key ]    │
   └──────────────────────────────────────┘
   ```

3. **Nom** : Entrez "TrustiScore" (ou ce que vous voulez)

4. **Version** : Choisissez **v3** (important !)

5. Cliquez sur **"Create API Key"** ou **"Générer"**

6. **IMPORTANT** : La clé s'affiche **UNE SEULE FOIS** !
   ```
   ┌──────────────────────────────────────────────────┐
   │  Your API Key (v3)                               │
   ├──────────────────────────────────────────────────┤
   │  xkeysib-1234567890abcdef...                     │
   │  [Copy to clipboard]                             │
   │                                                  │
   │  ⚠️ Save it now, you won't see it again!        │
   └──────────────────────────────────────────────────┘
   ```

7. **COPIEZ LA CLÉ** immédiatement (cliquez sur "Copy" ou sélectionnez-la)

8. **COLLEZ-LA** dans votre fichier `.env` :
   ```env
   BREVO_API_KEY=xkeysib-1234567890abcdef...
   ```

---

## 🆘 Si vous ne trouvez toujours pas

### Option A : Interface en français

L'interface peut être en français. Cherchez :
- **"Expéditeurs & IP"** → puis **"Clés API"**
- **"Développeurs"** → **"Clés API"**
- **"Outils pour développeurs"**

### Option B : Nouvelle interface Brevo 2024+

Si Brevo a mis à jour son interface :

1. Cliquez sur votre **photo de profil** (en haut à droite)
2. Cherchez **"Developer"** ou **"Développeur"**
3. Ou cherchez **"Advanced"** ou **"Avancé"**

### Option C : Menu hamburger

1. Si vous voyez un **menu hamburger** ☰ (3 lignes), cliquez dessus
2. Faites défiler jusqu'à trouver **"API"** ou **"Développeur"**

### Option D : Aide Brevo

1. Cliquez sur l'icône **"?"** ou **"Help"** dans le dashboard
2. Tapez : "How to get API key"
3. Suivez le tutoriel

---

## 🖼️ À quoi ressemble une clé API Brevo

Format de la clé :
```
xkeysib-abc123def456...
```

Caractéristiques :
- Commence TOUJOURS par `xkeysib-`
- Environ 60-80 caractères
- Mélange de lettres et chiffres
- Exemple : `xkeysib-1a2b3c4d5e6f7g8h9i0j...`

---

## ✅ Vérifier que ça marche

Une fois la clé copiée dans `.env` :

```bash
# Tester la clé
npm run check:brevo
```

Résultat attendu :
```
✅ Clé API Brevo détectée
✅ Connexion réussie à l'API Brevo !
📧 Email du compte : votre@email.com
```

---

## 🔄 Si la clé ne marche pas

### Problème 1 : "Unauthorized" ou "Invalid API key"

**Causes possibles** :
- ❌ Vous avez créé une clé v2 au lieu de v3
- ❌ Vous n'avez pas copié la clé entièrement
- ❌ Il y a des espaces au début ou à la fin

**Solution** :
1. Retournez dans Brevo
2. **Supprimez** l'ancienne clé
3. **Créez une NOUVELLE clé v3**
4. Copiez-la **entièrement** (commencer par `xkeysib-`)
5. Collez dans `.env` sans espaces

### Problème 2 : "Cannot authenticate"

**Solution** :
1. Vérifiez que votre compte Brevo est bien activé
2. Vérifiez votre email (peut-être un email de confirmation)
3. Essayez de vous déconnecter/reconnecter de Brevo

---

## 📞 Contact Support Brevo

Si vraiment vous ne trouvez pas après 10 minutes :

1. **Chat en direct** : Icône de bulle en bas à droite du dashboard
2. **Email** : support@brevo.com
3. **Documentation** : https://help.brevo.com

Dites-leur simplement :
> "Hi, I need to create an API key v3 for transactional emails. Where can I find it in the dashboard?"

---

## 💡 Alternative : Utiliser SMTP au lieu de l'API

Si vous n'arrivez vraiment pas à obtenir la clé API, vous pouvez utiliser SMTP :

### 1. Trouver vos identifiants SMTP

Dans Brevo, cherchez **"SMTP"** au lieu de **"API"**.

Vous obtiendrez :
```
SMTP Server: smtp-relay.brevo.com
Port: 587
Login: votre-email@exemple.com
Password: [générer un mot de passe SMTP]
```

### 2. Installez Nodemailer

```bash
npm install nodemailer
```

### 3. Je peux créer une version SMTP

Dites-moi si vous préférez cette option et je créerai le code pour vous !

---

## 🎯 Résumé rapide

**Chemin le plus court :**
1. https://app.brevo.com/settings/keys/api ← Utilisez cette URL directe
2. Create a new API key
3. Choisir v3
4. Copier la clé
5. Coller dans `.env`
6. `npm run check:brevo`

---

Avez-vous réussi à vous connecter à Brevo ? Sur quelle page êtes-vous actuellement ?
