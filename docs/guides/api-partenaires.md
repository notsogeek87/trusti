# Clés partenaires (facultatives) de l'API `/api/v1`

**Pour qui / Pourquoi** : pour David ou l'agent qui donne à un partenaire un quota plus élevé
que l'accès libre ([référence](../api/v1-partenaires.md)). L'API fonctionne **sans clé** :
ce guide ne sert que pour les partenaires qui dépassent les limites par IP (60 requêtes par
minute, 20 exports par heure).

## 1. Activer les clés (une seule fois, au premier partenaire)

Créer la table `api_partners` sur la base Trusti (idempotent) :

```bash
psql "$DATABASE_URL" -f server/database/migrations/2026-11-19-api-partners.sql
```

Ou via le connecteur Trusti_DB, en collant le contenu du fichier. Tant que la table
n'existe pas, l'API marche sans clé et toute clé est refusée (401).

## 2. Créer une clé pour un partenaire

```bash
node scripts/create-partner-key.js "Nom du partenaire" 120 "contact@partenaire.example"
#                                    nom                 débit/min (60 par défaut)  contact (facultatif)
```

Le script affiche :

1. **la clé** `tsk_...` à transmettre au partenaire par un canal sûr (lien à usage unique,
   Signal, e-mail chiffré avec mot de passe donné à part ; jamais un e-mail en clair). Elle
   n'est stockée nulle part et ne peut pas être retrouvée ensuite.
2. **l'`INSERT`** à exécuter sur la base. Seule l'empreinte SHA-256 de la clé y est
   enregistrée.

Le script n'écrit rien en base. L'`INSERT` se fait à la main, après validation.

Envoyer aussi au partenaire le lien de la documentation
(`https://api.trusti-score.eu/api/v1/openapi.json`) et rappeler l'obligation
d'attribution (licence CC BY 4.0 : « Source : TrustiScore »).

## 3. Suivre, suspendre, ajuster

```sql
-- Qui utilise l'API, et quand pour la dernière fois
SELECT id, name, contact, rate_per_minute, active, created_at, last_used_at FROM api_partners ORDER BY name;

-- Suspendre (effectif sous 60 s) / réactiver
UPDATE api_partners SET active = FALSE WHERE id = 3;

-- Augmenter le débit
UPDATE api_partners SET rate_per_minute = 300 WHERE id = 3;
```

Clé perdue ou fuitée : suspendre l'ancienne ligne, puis créer une nouvelle clé (étape 2).
