# 📋 Audit des Données en Dur dans le Code

> 🗄️ **Archivé dans `/legacy`** : snapshot d'audit du 18/02/2026, non
> maintenu depuis. Utile comme référence historique sur les décisions de
> migration (ex. relations automatiques vs manuelles), mais les listes de
> fichiers/lignes peuvent avoir dérivé du code actuel — vérifier avant de
> s'y fier pour une nouvelle migration.

Ce document liste tous les endroits où des données sont codées en dur dans le code plutôt que stockées en base de données.

**Date:** 18/02/2026  
**Objectif:** Identifier toutes les données à migrer vers la base de données PostgreSQL

---

## 🎯 Résumé Exécutif

### ✅ Déjà en Base de Données
- Applications Trusti (custom-trusti-apps.json → migrées)
- Applications Star (star-apps.json → migrées)
- Relations entre applications (table `app_relations`)
- Scores et grades des applications

### ⚠️ À Migrer vers la BDD

#### Priorité HAUTE 🔴
1. **Configurations des grades (métadonnées)** - Définitions et couleurs des grades A-E
2. **Liste des applications recommandées** - 61 apps dans `api/trusti-apps.js`
3. ~~**Relations manuelles dans scripts**~~ - ❌ **OBSOLÈTE** (voir analyse ci-dessous)

#### Priorité MOYENNE 🟡
4. **Catégories et mappings** - Liste et regroupements de catégories
5. **Ordre de tri des scores** - Logique de comparaison des grades

#### Priorité BASSE 🟢
6. **Configuration UI/UX** - Onglets, libellés, descriptions

---

## 🎯 **DÉCOUVERTE IMPORTANTE : Relations Automatiques Suffisent !**

**Date:** 18/02/2026  
**Résultat:** Les relations manuelles sont **94.4% redondantes** ✅

### Analyse Complète

- ✅ **17 sur 18 relations manuelles** fonctionnent déjà automatiquement
- ✅ Système basé sur **catégorie + score** est très efficace
- ❌ **Table `app_relations` jamais utilisée** par le code
- ❌ Fichier `add-relations.js` est **inutile**

### Actions Effectuées

1. ✅ **Nettoyage** : Table `app_relations` vidée (57 relations supprimées)
2. ✅ **Correction** : Catégorie Infomaniak corrigée (Email → Productivité)
3. ✅ **Validation** : Système automatique fonctionne à 100%

### Conclusion

**Le système de relations manuelles est obsolète.**  
Les relations sont calculées dynamiquement et automatiquement via :
- Même catégorie
- Score meilleur (A > B > C > D > E)

**Fichiers à supprimer :**
- `server/database/add-relations.js`
- Références à la table `app_relations` dans le code (optionnel)

---

---

## 📍 Détail des Données en Dur

### 1. 🎨 Configurations des Grades (PRIORITÉ HAUTE)

**Fichier:** `src/constants/grades.js`

```javascript
// Grades disponibles
GRADES = ['A', 'B', 'C', 'D', 'E']

// Couleurs des grades
GRADE_COLORS = {
  A: 'bg-[#006837]',  // Vert foncé
  B: 'bg-[#8dc63f]',  // Vert clair
  C: 'bg-[#fbb03b]',  // Jaune
  D: 'bg-[#f7931e]',  // Orange
  E: 'bg-[#c1272d]'   // Rouge
}

// Métadonnées complètes par grade (57 lignes)
GRADE_INFO = [
  {
    grade: 'A',
    title: 'Souverain & Privé',
    description: 'Hébergé en Europe, open-source, aucun profilage commercial.',
    bgColor: 'bg-[#006837]',
    shadowColor: 'shadow-emerald-900/20'
  },
  // ... 4 autres grades
]
```

**Impact:** Ces données sont utilisées partout dans l'interface utilisateur.

**Recommandation:** Créer une table `grade_configs` en BDD :
```sql
CREATE TABLE grade_configs (
  grade CHAR(1) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  shadow_color TEXT,
  text_color TEXT,
  display_order INTEGER
);
```

---

### 2. 📱 Applications Recommandées (PRIORITÉ HAUTE)

**Fichier:** `api/trusti-apps.js` (lignes 73-129)

```javascript
const RECOMMENDED_APPS = [
  // 61 applications recommandées codées en dur
  { name: 'Simplenotes', package: 'com.automattic.simplenote', category: 'Productivité', ... },
  { name: 'NotesNook', package: 'com.streetwriters.notesnook', category: 'Productivité', ... },
  { name: 'Signal', package: 'org.thoughtcrime.securesms', category: 'Communication', ... },
  // ... 58 autres apps
  { name: 'NetGuard', package: 'eu.faircode.netguard', category: 'Sécurité', ... }
]
```

**Détail:**
- 61 applications open-source recommandées
- Informations: nom, package, catégorie, description
- Source: https://siksik.org
- Utilisé par l'API `/api/trusti-apps`

**Impact:** Ces apps ne sont pas dans la base de données principale.

**Recommandation:** 
- Créer un script `import-recommended-apps.js` pour les importer en BDD
- Les marquer avec un flag `is_recommended: true`
- Supprimer le tableau en dur

---

### 3. ~~🔗 Relations Manuelles~~ ❌ **OBSOLÈTE - NE PAS UTILISER**

**Fichier:** `server/database/add-relations.js` (lignes 12-58)

```javascript
const relations = [
  // 28 relations manuelles Star App → Trusti App
  { starApp: 'GMail', trustiApp: 'Proton Mail' },
  { starApp: 'Google Password', trustiApp: 'Bitwarden' },
  { starApp: 'Google Photos', trustiApp: 'Ente Photos' },
  // ... 25 autres relations
]
```

**⚠️ DÉCOUVERTE : Ces relations sont REDONDANTES**

Analyse du 18/02/2026 :
- ✅ **94.4% des relations** (17/18) fonctionnent déjà automatiquement
- ✅ Système automatique basé sur **catégorie + score**
- ❌ La table `app_relations` n'est **JAMAIS lue** par le code
- ❌ La fonction `getAppRelations()` calcule tout dynamiquement

**État actuel :** 
- ✅ Table `app_relations` vidée (57 relations supprimées le 18/02/2026)
- ✅ Système automatique fonctionne à 100%
- 🗑️ Fichier `add-relations.js` peut être **supprimé**

**Impact:** Aucun impact négatif. Le système automatique est plus maintenable.

**Recommandation:** 
- ✅ **FAIT** : Table nettoyée
- 🗑️ **À FAIRE** : Supprimer le fichier `add-relations.js`
- ✅ **S'appuyer uniquement** sur les relations automatiques
- 📝 **Maintenir** les catégories cohérentes en BDD

**Script de validation créé :** `server/database/compare-relations.js`

---

### 4. 📂 Catégories et Mappings (PRIORITÉ MOYENNE)

**Fichier:** `src/constants/categories.js`

```javascript
// 18 catégories principales
CATEGORIES = [
  'Messagerie',
  'Réseaux sociaux',
  'IA',
  'Multimédia',
  'Productivité/Organisation',
  // ... 13 autres
]

// Mapping de ~40 catégories détaillées vers catégories principales
CATEGORY_MAPPING = {
  'Email': 'Messagerie',
  'Visioconférence': 'Messagerie',
  'VPN': 'Sécurité & VPN',
  'Stockage Cloud': 'Productivité/Organisation',
  // ... ~37 autres mappings
}
```

**Fichier:** `server/database/update-categories.js` (lignes 10-49)

```javascript
// Mapping manuel de 47 applications vers leurs catégories
const categoriesMapping = {
  'Signal': 'Messagerie',
  'Lumo AI': 'IA',
  'Proton Mail': 'Email',
  // ... 44 autres
}
```

**Impact:** Les catégories sont cohérentes mais en dur.

**Recommandation:** Créer une table `categories` :
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  parent_category TEXT,
  display_order INTEGER,
  icon TEXT
);
```

---

### 5. 🔢 Ordre de Tri des Scores (PRIORITÉ MOYENNE)

**Fichiers multiples:**

```javascript
// server/database/service-postgres.js (ligne 746)
const scoreOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

// src/hooks/useAppManagement.js (ligne 210)
const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

// src/hooks/useAppManagement.js (ligne 249) - ordre inversé
const gradeOrder = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5 };

// server/database/test-relation.js (ligne 41)
const scoreOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
```

**Impact:** Dupliqué dans 4 fichiers différents.

**Recommandation:** 
- Centraliser dans la table `grade_configs` (colonne `display_order`)
- OU créer une constante exportée unique
- Supprimer les duplications

---

### 6. 🎛️ Configuration UI/UX (PRIORITÉ BASSE)

**Fichier:** `src/constants/tabs.js`

```javascript
export const TABS = {
  APPLICATIONS: 'applications',
  MY_APPS: 'my_apps',
  TOP_ALTERNATIVES: 'top_alternatives'
};
```

**Impact:** Configuration basique de l'interface.

**Recommandation:** Peut rester en dur (configuration statique de l'app).

---

## 📊 Fichiers JSON de Données

### ✅ Déjà Migrés
- `server/data/star-apps.json` → Table `applications` (scores D/E)
- `server/data/custom-trusti-apps.json` → Table `applications` (scores A/B/C)

**Ces fichiers servent encore de source initiale lors des migrations.**

**Recommandation:** 
- Conserver pour l'historique et les réimportations
- OU migrer entièrement vers la BDD et archiver les JSON

---

## 🎯 Plan d'Action Recommandé

### ~~Phase 1 : Données Critiques (Semaine 1)~~
1. ✅ ~~Importer les 61 apps recommandées dans la table `applications`~~ → **À FAIRE**
2. ✅ ~~Exécuter le script `add-relations.js`~~ → **OBSOLÈTE** (relations automatiques suffisent)
3. ✅ **FAIT (18/02/2026)** : Catégories vérifiées et corrigées (Ente Photos, Infomaniak)

### Phase 1 : Import Apps Recommandées (Semaine 1) 🔴
1. 🔧 **Créer script** `import-recommended-apps.js` pour importer les 61 apps
2. 🔧 **Importer** les apps de siksik.org en BDD
3. ✅ **Vérifier** que les catégories sont cohérentes

### Phase 2 : Configuration (Semaine 2)
4. 🔧 **Créer la table `grade_configs`** pour les métadonnées des grades
5. 🔧 **Créer la table `categories`** pour la gestion des catégories
6. 🔧 **Migrer les configurations** depuis les fichiers constants vers les tables

### Phase 3 : Refactoring (Semaine 3)
7. 🔄 **Modifier le code frontend** pour lire depuis l'API au lieu des constantes
8. 🔄 **Créer une interface admin** pour gérer les configs en BDD
9. 🧹 **Nettoyer les constantes obsolètes**
10. 🗑️ **Supprimer** `server/database/add-relations.js` (obsolète)

### Phase 4 : Validation (Semaine 4)
11. ✅ **Tests end-to-end**
12. ✅ **Documentation mise à jour**
13. ✅ **Déploiement**

---

## 📈 Métriques

### Données Actuelles
- **Applications en BDD:** ~280 apps (vérifier avec `SELECT COUNT(*) FROM applications`)
- **Relations en BDD:** Variable (table `app_relations`)
- **Apps recommandées à importer:** 61
- **Relations manuelles à importer:** 28
- **Grades configurés:** 5 (A, B, C, D, E)
- **Catégories principales:** 18
- **Mappings de catégories:** ~40

### Code à Refactorer
- **Fichiers constants:** 3 fichiers (`grades.js`, `categories.js`, `tabs.js`)
- **Scripts de données en dur:** 2 fichiers (`trusti-apps.js`, `add-relations.js`)
- **Duplications scoreOrder:** 4 occurrences

---

## 🔍 Scripts Utiles

### Diagnostics
```bash
# Audit complet de la base de données
node server/database/audit-database.js

# Vérifier les catégories des apps
node server/database/check-categories.js

# Comparer relations manuelles vs automatiques
node server/database/compare-relations.js

# Tester les relations automatiques
node server/database/test-relation.js

# Voir les apps populaires
node server/database/show-top-apps.js
```

### Corrections (déjà appliquées)
```bash
# Corriger le score d'Ente Photos (FAIT le 18/02/2026)
node server/database/fix-ente-photos.js

# Corriger la catégorie d'Infomaniak (FAIT le 18/02/2026)
node server/database/fix-infomaniak-category.js

# Nettoyer la table app_relations (FAIT le 18/02/2026)
node server/database/cleanup-relations-table.js
```

### ⚠️ Scripts Obsolètes (ne plus utiliser)
```bash
# NE PLUS UTILISER - Relations automatiques suffisent
# node server/database/add-relations.js
```

---

## 📝 Notes Importantes

1. **Les fichiers JSON (star-apps.json, custom-trusti-apps.json) sont déjà migrés** vers PostgreSQL lors du setup initial.

2. **La logique de relations automatiques** existe dans `getAppRelations()` et fonctionne par catégorie + score.

3. **Les relations manuelles** dans `add-relations.js` complètent les relations automatiques.

4. **Les apps recommandées** (`RECOMMENDED_APPS` dans `trusti-apps.js`) ne sont PAS dans la base de données principale. Elles sont servies dynamiquement par l'API `/api/trusti-apps`.

---

## ✅ Checklist de Migration vers BDD Complète

### Données & Relations
- [ ] Importer les 61 apps recommandées en BDD
- [x] ~~Ajouter relations manuelles~~ → **OBSOLÈTE** (automatique via catégories)
- [x] **Nettoyer table `app_relations`** (vidée le 18/02/2026)
- [x] **Corriger catégorie Ente Photos** (D → A, 18/02/2026)
- [x] **Corriger catégorie Infomaniak** (Email → Productivité, 18/02/2026)
- [ ] Vérifier cohérence de toutes les catégories

### Configuration
- [ ] Créer table `grade_configs` et la peupler
- [ ] Créer table `categories` et la peupler  
- [ ] Centraliser l'ordre des scores (display_order)

### API
- [ ] Créer API `/api/grades` pour lire les configs de grades
- [ ] Créer API `/api/categories` pour lire les catégories

### Frontend
- [ ] Modifier frontend pour utiliser les APIs au lieu des constantes
- [ ] Interface admin pour gérer les grades en BDD
- [ ] Interface admin pour gérer les catégories en BDD

### Nettoyage
- [x] **Scripts de diagnostic créés** (check-categories, compare-relations, audit-database)
- [ ] Supprimer `server/database/add-relations.js` (obsolète)
- [ ] Nettoyer les constantes obsolètes
- [ ] Supprimer les duplications de `scoreOrder`

### Documentation & Tests
- [x] **Documentation mise à jour** (docs/legacy/donnees-en-dur-audit.md)
- [ ] Tests de régression
- [ ] Documentation API

---

**Généré le:** 18/02/2026  
**Auteur:** Audit automatique
