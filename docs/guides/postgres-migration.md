# Migration vers PostgreSQL (Neon) pour Vercel

Ce guide explique comment migrer de la base de données JSON locale vers PostgreSQL (Neon) pour le déploiement sur Vercel.

## Pourquoi PostgreSQL ?

Vercel utilise un système de fichiers **en lecture seule**. Les tentatives d'écrire dans des fichiers JSON échoueront en production. PostgreSQL via Neon offre:

- ✅ **Persistance des données** entre déploiements
- ✅ **Lecture/Écriture** fonctionnelles
- ✅ **Gratuit** jusqu'à 256MB
- ✅ **Intégration native** Vercel

## Étapes de migration

### 1. Créer une base de données Neon

1. Aller sur [neon.tech](https://neon.tech)
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Copier la **Connection String** depuis le dashboard

### 2. Configurer l'environnement local

Créer un fichier `.env` à la racine du projet:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

> ⚠️ Remplacer par votre vraie connection string de Neon

### 3. Lancer la migration

```bash
npm run db:migrate-to-postgres
```

Ce script va :
- Créer les tables PostgreSQL
- Importer toutes les applications depuis `apps.json`
- Importer les relations entre applications
- Afficher les statistiques

### 4. Configurer Vercel

1. Aller dans **Vercel Dashboard** > Votre Projet > **Settings** > **Environment Variables**
2. Ajouter la variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Votre connection string Neon
   - **Environments**: Production, Preview, Development

### 5. Déployer sur Vercel

```bash
git add .
git commit -m "feat: migration PostgreSQL avec Neon"
git push origin main
```

Vercel déploiera automatiquement et utilisera PostgreSQL.

## Structure de la base de données

### Table `applications`

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique de l'application |
| name | TEXT | Nom de l'application |
| trusti_score | TEXT | Score Trusti (A, B, C, D, E) |
| grade | TEXT | Grade (compatibilité) |
| category | TEXT | Catégorie |
| icon | TEXT | URL de l'icône |
| color | TEXT | Couleur Tailwind |
| reason | TEXT | Raison du score |
| play_store_url | TEXT | Lien Play Store |
| apple_store_url | TEXT | Lien App Store |
| github_url | TEXT | Lien GitHub |
| other_store_url | TEXT | Autre store |
| website | TEXT | Site web |
| description | TEXT | Description |
| developer | TEXT | Développeur |
| license | TEXT | Licence |
| is_open_source | BOOLEAN | Open source ? |
| is_european | BOOLEAN | Européenne ? |
| jurisdiction | TEXT | Juridiction |
| app_type | TEXT | Type (trusti, star, regular) |
| privacy_features | JSONB | Fonctionnalités vie privée |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

### Table `app_relations`

| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL | ID auto-incrémenté |
| app_id | TEXT | ID de l'application source |
| related_app_id | TEXT | ID de l'application liée |
| relation_type | TEXT | Type (alternative, replaces) |

## API Routes Vercel

Les endpoints suivants sont disponibles via les serverless functions:

### Custom Trusti Apps

- `GET /api/custom-trusti-apps` - Lister les apps Trusti
- `POST /api/custom-trusti-apps` - Créer une app
- `PUT /api/custom-trusti-apps` - Mettre à jour une app
- `DELETE /api/custom-trusti-apps?id=xxx` - Supprimer une app

### Star Apps

- `GET /api/star-apps` - Lister les star apps
- `POST /api/star-apps` - Créer une star app
- `PUT /api/star-apps` - Mettre à jour une star app
- `DELETE /api/star-apps?id=xxx` - Supprimer une star app

## Gestion en local

Pour le développement local, deux options:

### Option 1: Utiliser PostgreSQL (recommandé)

Créer un fichier `.env`:

```bash
DATABASE_URL=postgresql://...
```

### Option 2: Utiliser JSON (développement uniquement)

Modifier `server/index.js` pour utiliser `service-json.js` au lieu de `service-postgres.js`.

## Backup et restauration

### Backup automatique

Neon effectue des backups automatiques. Pour exporter manuellement:

```bash
# Via psql
pg_dump $DATABASE_URL > backup.sql
```

### Restauration

```bash
# Via psql
psql $DATABASE_URL < backup.sql
```

## Réinitialiser la base de données

Pour supprimer toutes les données et recommencer:

```sql
DROP TABLE app_relations;
DROP TABLE applications;
```

Puis relancer:
```bash
npm run db:migrate-to-postgres
```

## Coûts

**Neon Free Tier** inclut:
- 0.5 GB de stockage
- 256 MB de RAM
- Pas de carte bancaire requise

Pour plus d'informations: [Neon Pricing](https://neon.tech/pricing)

## Troubleshooting

### Erreur: "DATABASE_URL not found"

✅ Vérifier que le fichier `.env` existe et contient DATABASE_URL

### Erreur de connexion à Neon

✅ Vérifier que la connection string est correcte
✅ Vérifier que `?sslmode=require` est présent dans l'URL

### Erreur sur Vercel: "connect ECONNREFUSED"

✅ Vérifier que DATABASE_URL est ajoutée dans les Environment Variables Vercel

### Les données ne sont pas synchronisées

✅ Relancer la migration: `npm run db:migrate-to-postgres`
✅ Vérifier qu'il n'y a pas d'erreurs dans les logs

## Support

Pour obtenir de l'aide:
- [Documentation Neon](https://neon.tech/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Issues GitHub](https://github.com/notsogeek87/trusti/issues)
