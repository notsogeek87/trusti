# Audit sécurité de l'app Trusti (2026-10-11)

Périmètre : `api/` (fonctions Vercel), `server/`, config Android/Capacitor, workflows CI, dépendances. Le front (`src/`) n'a pas d'`innerHTML`/`eval` ; les requêtes SQL passent par des gabarits `sql\`\`` paramétrés.

## Déjà en place (constaté)
Jeton admin HMAC avec expiration et comparaison en temps constant, OTP aléatoire cryptographique, consommation atomique du code, verrouillage par email en base, routes de mutation protégées (`isAuthorizedAdminRequest`), `ADMIN_EMAIL` fail-closed en production.

## Corrigé
| Constat | Gravité | Correctif |
|---|---|---|
| Limite d'envoi d'OTP inopérante : chaque renvoi supprimait les anciens codes, donc le compteur restait à 1 (bombardement d'emails, coût Brevo) | Haute | Les anciens codes sont invalidés (`used = true`) au lieu d'être supprimés ; nettoyage des expirés après 1 h |
| Compteur d'échecs OTP non atomique (lecture puis écriture) : des devinettes en parallèle dépassaient les 5 essais | Haute | Un seul `INSERT … ON CONFLICT … RETURNING` incrémente le compteur |
| `ADMIN_EMAIL` absent : accès admin ouvert à tous sur les déploiements *preview* | Haute | Refus sur tout environnement Vercel, bypass local seulement |
| Clé `x-api-key` comparée avec `===` | Moyenne | `safeEqual` (hash + `timingSafeEqual`) |
| `allowBackup="true"` (Android) : données de l'app, dont le jeton admin en localStorage, sauvegardables | Moyenne | `allowBackup="false"` |

## À décider (non appliqué)
- **Dépendances** : `npm audit --omit=dev` donne 21 vulnérabilités (2 critiques, 12 hautes), dont `@capacitor/android` ; le correctif demande une montée de version majeure à tester sur l'app Android.
- **CORS `*`** sur toutes les routes, y compris celles qui acceptent `Authorization`. Restreindre aux origines du site et de l'app (`https://localhost` pour Capacitor) : liste à fournir.
- **Secret de signature** : repli sur `API_KEY` si `ADMIN_SESSION_SECRET` manque. Exiger un secret dédié en production.
- **Jeton admin en localStorage** (12 h, non révocable) : acceptable ici, mais un cookie `HttpOnly` réduirait l'impact d'une XSS.
- **Hygiène du dépôt** : `fix-icons-output.log` et les fichiers `loaderio-*.txt` sont versionnés ; `debug.keystore` est la clé de debug standard (sans risque).
- **CI** : les workflows Play Store utilisent des secrets de signature ; vérifier qu'ils ne s'exécutent pas sur des PR de forks et épingler les actions par SHA.
