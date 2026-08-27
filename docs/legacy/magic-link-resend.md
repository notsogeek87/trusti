# [OBSOLÈTE] Configuration de l'authentification par Magic Link (Resend)

> ⚠️ **Ce document ne décrit plus le comportement actuel.**
> L'authentification est passée d'un lien magique envoyé via Resend à un
> **code OTP à 6 chiffres envoyé via Brevo** (`api/send-otp.js`,
> `api/verify-otp.js`). Voir la doc à jour :
> [`../guides/authentication.md`](../guides/authentication.md).
> Conservé ici pour l'historique du choix technique.

## Vue d'ensemble

TrustiScore utilise maintenant l'authentification par Magic Link avec [Resend](https://resend.com), permettant aux utilisateurs de se connecter sans mot de passe en recevant un lien sécurisé par email.

## Configuration de Resend

### 1. Créer un compte Resend

1. Allez sur [https://resend.com/signup](https://resend.com/signup)
2. Créez un compte gratuit (3000 emails/mois inclus)
3. Vérifiez votre adresse email

### 2. Obtenir votre clé API

1. Une fois connecté, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez un nom à votre clé (ex: "TrustiScore Production")
4. Copiez la clé API (elle commence par `re_`)

### 3. Vérifier votre domaine (Recommandé pour la production)

**Pour les tests** : Vous pouvez utiliser `onboarding@resend.dev` sans vérification

**Pour la production** :
1. Dans Resend, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `trusti.fr`)
4. Ajoutez les enregistrements DNS fournis
5. Attendez la vérification (quelques minutes)

### 4. Configuration des variables d'environnement

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
# Resend API Key
RESEND_API_KEY=re_votre_cle_api_ici

# Email d'envoi
# Pour les tests :
RESEND_FROM_EMAIL=TrustiScore <onboarding@resend.dev>

# Pour la production (après vérification du domaine) :
RESEND_FROM_EMAIL=TrustiScore <noreply@votredomaine.com>

# URL du frontend
FRONTEND_URL=https://trusti.vercel.app

# Environment
NODE_ENV=production
```

## Fonctionnement

### 1. Demande de connexion

L'utilisateur entre son email dans le LoginModal :
- L'email est envoyé à l'API `/api/auth/send-magic-link`
- Un token unique est généré et stocké en mémoire (15 minutes)
- Un email HTML est envoyé via Resend avec le lien magique

### 2. Vérification du lien

Quand l'utilisateur clique sur le lien :
- L'application détecte le paramètre `?token=xxx` dans l'URL
- Le composant `VerifyAuth` vérifie le token via `/api/auth/verify-token`
- Si valide, l'utilisateur est connecté et redirigé vers l'accueil
- Le token est marqué comme utilisé et supprimé

### 3. Sécurité

- **Token unique** : Chaque lien est unique et ne peut être utilisé qu'une fois
- **Expiration** : Les liens expirent après 15 minutes
- **HTTPS** : En production, tous les liens utilisent HTTPS
- **Nettoyage automatique** : Les tokens expirés sont supprimés toutes les heures

## Template d'email

L'email envoyé est un HTML responsive avec :
- Header coloré avec le logo TrustiScore
- Bouton principal de connexion
- Texte explicatif
- Footer avec le lien du site

Pour personnaliser le template, modifiez le contenu HTML dans `/api/auth.js` ligne ~60.

## Migration des utilisateurs existants

L'authentification est rétrocompatible :
- Les utilisateurs avec l'ancien système (pseudonyme) peuvent continuer à se connecter
- Les nouvelles connexions utilisent l'email
- Les données sont migrées automatiquement lors de la première connexion par email

## Dépannage

### L'email n'arrive pas

1. **Vérifiez les spams** : L'email peut être dans les courriers indésirables
2. **Vérifiez la clé API** : Assurez-vous que `RESEND_API_KEY` est correcte
3. **Vérifiez le domaine** : En production, le domaine doit être vérifié
4. **Logs serveur** : Consultez `console.log` pour voir les erreurs Resend

### Le token est invalide

1. **Délai dépassé** : Le lien expire après 15 minutes
2. **Déjà utilisé** : Chaque lien ne peut être utilisé qu'une fois
3. **Serveur redémarré** : Les tokens en mémoire sont perdus au redémarrage

**Solution pour la production** : Utilisez Redis ou une base de données pour stocker les tokens au lieu de la mémoire.

### Erreur de CORS

Si vous testez en local, assurez-vous que :
- Le serveur tourne sur `http://localhost:3001`
- Le frontend sur `http://localhost:5173`
- CORS est configuré dans `server/index.js`

## Personnalisation

### Changer la durée d'expiration

Dans `/api/auth.js`, ligne ~35 :

```javascript
const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
```

### Personnaliser l'email

Modifiez le HTML dans `/api/auth.js` à partir de la ligne ~60.Vous pouvez utiliser des services comme [Maily](https://maily.to) ou [React Email](https://react.email) pour créer des templates plus avancés.

## Production

Pour déployer en production avec Vercel :

1. Ajoutez les variables d'environnement dans **Vercel Dashboard** > **Settings** > **Environment Variables**
2. Ajoutez `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, et `FRONTEND_URL`
3. Redéployez l'application

Pour une meilleure scalabilité, envisagez :
- **Redis** pour stocker les tokens (au lieu de la mémoire)
- **Rate limiting** pour éviter l'abus (ex: max 5 emails/heure par adresse)
- **Webhooks Resend** pour suivre les emails ouverts/cliqués
- **Template variables** pour personnaliser les emails

## Support

- Documentation Resend : https://resend.com/docs
- Exemples : https://resend.com/examples
- Statut : https://status.resend.com
