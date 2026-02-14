# Guide de Déploiement sur Vercel avec PostgreSQL

Ce guide te montre comment déployer Trusti sur Vercel avec une vraie base de données PostgreSQL persistante.

## 📋 Checklist avant déploiement

- [ ] Compte Vercel créé
- [ ] Compte Neon créé (base de données)
- [ ] Code committé sur GitHub
- [ ] Base de données migrée vers PostgreSQL

## 🚀 Étapes de Déploiement

### Étape 1: Créer la base de données Neon

1. **Aller sur [neon.tech](https://neon.tech)**
2. **Créer un compte gratuit**
3. **Créer un nouveau projet**
   - Nom: `trusti-db`
   - Région: Choisir la plus proche (ex: Europe)
4. **Copier la Connection String**
   - Depuis le Dashboard
   - Format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`

### Étape 2: Migrer les données vers PostgreSQL

1. **Créer le fichier `.env`** à la racine:

```bash
DATABASE_URL=postgresql://[VOTRE_CONNECTION_STRING_NEON]
```

2. **Lancer la migration**:

```bash
npm run db:migrate-to-postgres
```

Tu devrais voir:
```
✅ Tables créées avec succès
✅ Applications importées: 32
✅ Relations importées: 0
✅ MIGRATION TERMINÉE AVEC SUCCÈS
```

### Étape 3: Pousser le code sur GitHub

```bash
git add .
git commit -m "feat: PostgreSQL integration for Vercel"
git push origin main
```

### Étape 4: Connecter Vercel au repo GitHub

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Cliquer sur "Add New Project"**
3. **Importer ton repo GitHub** (`notsogeek87/trusti`)
4. **Configurer le projet**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (déjà configuré)
   - Output Directory: `dist` (déjà configuré)

### Étape 5: Ajouter les variables d'environnement

Dans les **Project Settings** > **Environment Variables**:

1. **Ajouter DATABASE_URL**:
   - Name: `DATABASE_URL`
   - Value: Ta connection string Neon
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **Cliquer sur "Save"**

### Étape 6: Déployer

1. **Cliquer sur "Deploy"**
2. Attendre ~2 minutes
3. ✅ **Ton site est en ligne !**

## 🎉 C'est déployé !

Ton application est maintenant accessible sur:
```
https://trusti-[random].vercel.app
```

### Tester l'API

```bash
# Récupérer les apps Trusti
curl https://trusti-[random].vercel.app/api/custom-trusti-apps

# Récupérer les Star Apps
curl https://trusti-[random].vercel.app/api/star-apps
```

## 🔧 Configuration personnalisée

### Domaine personnalisé

1. Aller dans **Project Settings** > **Domains**
2. Ajouter ton domaine (ex: `trusti.example.com`)
3. Configurer les DNS selon les instructions Vercel

### Variables d'environnement supplémentaires

Si tu en as besoin, ajouter dans **Environment Variables**:

```
API_KEY=xxx
ADMIN_PASSWORD=xxx
```

## 📊 Monitoring

### Logs en temps réel

1. Aller dans **Deployments**
2. Cliquer sur le dernier déploiement
3. Onglet **Logs** pour voir l'activité

### Base de données Neon

Aller sur [console.neon.tech](https://console.neon.tech):
- Voir le nombre de requêtes
- Monitorer l'usage du stockage
- Gérer les backups

## 🆘 Problèmes fréquents

### ❌ "Module not found" lors du build

**Solution**: Vérifier que toutes les dépendances sont dans `package.json`

```bash
npm install
```

### ❌ "DATABASE_URL is not defined"

**Solution**: Vérifier que DATABASE_URL est bien ajoutée dans Vercel Environment Variables

### ❌ "Connection refused" à la base de données

**Solution**: 
1. Vérifier que la connection string Neon est correcte
2. S'assurer que `?sslmode=require` est présent dans l'URL
3. Vérifier que le projet Neon est bien actif

### ❌ Les données ne s'affichent pas

**Solution**:
1. Vérifier les logs Vercel
2. Tester l'API directement: `/api/custom-trusti-apps`
3. Re-vérifier que la migration a fonctionné:
   ```bash
   npm run db:migrate-to-postgres
   ```

### ❌ CORS errors

**Solution**: Les API routes Vercel gèrent déjà CORS, mais si problème:

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

## 🔄 Mises à jour futures

À chaque modification du code:

```bash
# 1. Modifier le code
# 2. Committer
git add .
git commit -m "feat: nouvelle fonctionnalité"

# 3. Pousser (Vercel déploie automatiquement)
git push origin main
```

## 💾 Gestion des données

### Ajouter des applications via l'admin

Les interfaces admin fonctionnent automatiquement:
- `/admin` - Gestion des Custom Trusti Apps
- Les ajouts/modifications sont **persistés** dans PostgreSQL

### Backup manuel de la base

```bash
# Avec psql installé
pg_dump [CONNECTION_STRING] > backup.sql
```

### Restaurer un backup

```bash
psql [CONNECTION_STRING] < backup.sql
```

## 📈 Évolution

### Passer au plan payant Neon

Si tu dépasses les limites gratuites (256 MB):

1. Aller sur [neon.tech/pricing](https://neon.tech/pricing)
2. Choisir le plan adapté
3. Pas de changement de code nécessaire

### Migrer vers une autre BDD

Si tu veux changer (ex: Supabase, PlanetScale):

1. Exporter la structure SQL
2. Importer dans la nouvelle BDD
3. Changer `DATABASE_URL` dans Vercel

## 🎓 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Neon](https://neon.tech/docs)
- [Guide PostgreSQL](POSTGRES_MIGRATION.md)
- [Troubleshooting Vercel](https://vercel.com/support)

## ✅ Checklist post-déploiement

- [ ] Site accessible via l'URL Vercel
- [ ] API `/api/custom-trusti-apps` fonctionne
- [ ] API `/api/star-apps` fonctionne
- [ ] Interface admin fonctionnelle
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Monitoring activé

---

**🎉 Félicitations ! Ton application Trusti est maintenant en production avec une vraie base de données !**
