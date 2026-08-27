# Authentification — Code OTP par email (Brevo)

Pour qui / Pourquoi : pour tout développeur qui doit toucher au flow de
connexion ou déboguer un problème d'envoi/vérification de code. Remplace
l'ancien système "Magic Link" par email (Resend) : l'authentification se
fait désormais par un **code à 6 chiffres envoyé par email via
[Brevo](https://www.brevo.com)**, saisi dans un `PinModal`.

> L'ancienne doc "Magic Link / Resend" a été déplacée vers
> [`../legacy/magic-link-resend.md`](../legacy/magic-link-resend.md) — elle
> ne décrit plus le comportement actuel du code, conservée pour historique.

## Vue d'ensemble

1. L'utilisateur saisit son email dans `LoginModal`
   (`src/components/modals/LoginModal.jsx`).
2. Le frontend appelle `POST /api/send-otp` (`api/send-otp.js`) qui génère
   un code à 6 chiffres, le stocke dans la table `magic_link_tokens`
   (nom de table historique, conservé tel quel en base) avec une
   expiration à 10 minutes, et l'envoie par email via l'API transactionnelle
   Brevo.
3. L'utilisateur saisit le code reçu dans `PinModal`
   (`src/components/modals/PinModal.jsx`).
4. Le frontend appelle `POST /api/verify-otp` (`api/verify-otp.js`) qui
   valide `(email, code)` contre la base.
5. Si valide, la session est gérée côté client par `useAuth`
   (`src/hooks/useAuth.js`) : l'utilisateur (`{ email, loginAt }`) est
   stocké dans `localStorage` sous la clé `trusti_current_user` — il n'y a
   pas de session serveur/cookie.

`src/components/VerifyAuth.jsx` gère un flow complémentaire (vérification
depuis un lien reçu, conservé pour compatibilité avec d'anciens emails).

## Configuration

Variables d'environnement (voir [.env.example](../../.env.example)) :

```env
BREVO_API_KEY=xxx
BREVO_FROM_NAME=TrustiScore
BREVO_FROM_EMAIL=noreply@trustiscore.fr
ADMIN_EMAIL=admin@example.com   # protège /api/admin-auth (bypass si absent)
DATABASE_URL=postgresql://...
```

En développement, si `BREVO_API_KEY` n'est pas défini, `send-otp` et
`admin-auth` n'envoient rien : le code est simplement affiché dans les logs
serveur (`console.log`).

## Sécurité

- **Rate limit d'envoi** : 3 codes max par email sur une fenêtre de 5 minutes
  (`send-otp`).
- **Rate limit de vérification** : 5 tentatives échouées → verrouillage de
  15 minutes pour cet email (`verify-otp`, en mémoire process — donc
  réinitialisé si le serverless redémarre).
- **Expiration** : un code expire après 10 minutes.
- Un nouveau code invalide automatiquement les précédents pour le même
  email (suppression avant insertion).

## Admin

`/api/admin-auth` réutilise exactement le même mécanisme OTP/Brevo, mais
restreint l'envoi à l'adresse définie par `ADMIN_EMAIL`. Protège l'accès à
l'interface `/admin` (gestion des Custom Trusti Apps / Star Apps, voir
[../api/README.md](../api/README.md)).

## Dépannage

### L'email n'arrive pas

1. Vérifier les spams.
2. Vérifier `BREVO_API_KEY` et que l'expéditeur (`BREVO_FROM_EMAIL`) est
   validé côté Brevo.
3. En dev sans `BREVO_API_KEY`, le code n'est pas envoyé par email — il est
   dans les logs serveur.

### Le code est refusé

- Expiré après 10 minutes → en redemander un.
- Déjà utilisé (`used = true` en base) → chaque code est à usage unique.
- Trop de tentatives incorrectes → compte verrouillé 15 minutes
  (message d'erreur explicite renvoyé par l'API).
