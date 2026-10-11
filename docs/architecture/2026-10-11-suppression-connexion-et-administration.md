# 2026-10-11 : suppression de la connexion utilisateur et de l'administration

**Pour qui / Pourquoi** : toute personne qui touche à l'API, au stockage local ou au déploiement.
Trusti n'a plus de comptes, plus de codes OTP par e-mail et plus d'interface d'administration, afin de
réduire la surface d'attaque (voir [l'audit](2026-10-11-audit-securite.md)) et de ne plus traiter
aucune donnée personnelle côté serveur.

## Décision

- **Plus de connexion** : suppression de `LoginModal`, `VerifyAuth`, `api/send-otp.js`, `api/verify-otp.js`,
  du rate-limit OTP (`server/otpRateLimit.js`) et des dépendances Brevo/Resend.
- **Plus d'interface admin** : suppression de `PinModal`, `AdminAppsModal`, `AdminSimpleTableModal`,
  `api/admin-auth.js`, `api/verify-admin-otp.js`, `api/check-admin.js` et des jetons de session admin.
- **Données utilisateur** : uniquement en `localStorage` sous l'identité `guest` (`src/hooks/useAuth.js`).
  Une migration unique rapatrie les apps d'un ancien compte connecté vers `guest`.
- **Modification du catalogue** : seulement par appel serveur à serveur avec l'en-tête `x-api-key`
  égal à `API_KEY` (n8n, scripts), voir `server/adminToken.js`. Sans `API_KEY`, toute écriture est refusée.

```bash
curl -X POST "$API_URL/apps" -H "x-api-key: $API_KEY" -H "Content-Type: application/json" -d '{...}'
```

## Conséquences

- Variables à retirer de Vercel : `ADMIN_EMAIL`, `ADMIN_SESSION_SECRET`, `BREVO_API_KEY`, `BREVO_FROM_*`.
- Tables `magic_link_tokens` et `otp_attempts` devenues inutiles (non supprimées, décision réservée).
- Politique de confidentialité réécrite (aucune adresse e-mail collectée).
- L'ancienne documentation est conservée dans [legacy/otp-brevo-authentication.md](../legacy/otp-brevo-authentication.md).
