# Configuration de l'onglet Awards

## Vue d'ensemble

L'onglet Awards affiche les meilleures applications (grade A) sélectionnées manuellement. Vous pouvez maintenant contrôler précisément quelles apps de grade A apparaissent dans cet onglet.

## Fonctionnement

### Filtre automatique
- Seules les apps avec **grade A** peuvent être affichées dans Awards
- Par défaut, toutes les apps A sont affichées (`showInAwards = true`)

### Contrôle manuel
- Dans l'interface d'administration des StarApps, vous pouvez activer/désactiver l'option **"🏆 Afficher dans l'onglet Awards"**
- Cette option n'apparaît que pour les apps de grade A
- Une icône 🏆 s'affiche sur les apps configurées pour Awards

## Migration de la base de données

Pour ajouter le champ `show_in_awards` à votre base de données existante :

```bash
node server/database/add-show-in-awards-column.js
```

Ce script :
- Ajoute la colonne `show_in_awards` (INTEGER, défaut: 1)
- Vérifie si la colonne existe déjà pour éviter les doublons
- Affiche des statistiques sur les apps

## Utilisation

### Dans AdminStarAppsModal

1. Créer ou modifier une app avec grade A
2. Cocher/décocher **"🏆 Afficher dans l'onglet Awards"**
3. Sauvegarder

### Vérification

Dans l'onglet Awards de l'application :
- Seules les apps A avec `showInAwards = true` sont affichées
- Apps groupées par catégorie
- Tri alphabétique par nom dans chaque catégorie

## Structure de données

### Base de données (Postgres)
```sql
show_in_awards INTEGER DEFAULT 1  -- 1 = oui, 0 = non
```

### Format API/JSON
```javascript
{
  "id": "123",
  "name": "Mon App",
  "grade": "A",
  "showInAwards": true  // boolean
}
```

## Cas d'usage

**Scénario 1:** Vous avez 50 apps avec grade A, mais voulez n'en afficher que 20 dans Awards
- Solution: Décochez "Afficher dans Awards" pour les 30 autres apps

**Scénario 2:** Une nouvelle app A est ajoutée
- Par défaut: Elle apparaîtra dans Awards
- Option: Décochez si vous ne voulez pas l'afficher

**Scénario 3:** Migration depuis l'ancien système
- Toutes les apps A existantes seront affichées par défaut
- Vous pouvez ensuite affiner manuellement

## Code modifié

- `src/hooks/useAppManagement.js` - Filtre mis à jour
- `src/components/modals/AdminStarAppsModal.jsx` - Interface de gestion
- `server/database/schema.js` - Schéma de la table
- `server/database/service-postgres.js` - CRUD operations
- `server/database/add-show-in-awards-column.js` - Script de migration
