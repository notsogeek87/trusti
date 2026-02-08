# 📋 BACKLOG TRUSTISCORE - Features & Récits Utilisateurs

**Version:** 3.0 - Product Backlog (Epic → User Stories)  
**Dernière mise à jour:** 07/02/2026  
**Méthodologie:** Agile Scrum avec découpage Epic/Story

---

## 🎯 VUE D'ENSEMBLE

Cette backlog structure le produit en **Features (Epics)** et **Récits Utilisateurs (User Stories)** découpés.

### 📐 Structure
```
Epic (Feature)                    → Gros objet utilisateur (1-4 semaines)
  └─ User Story 1                 → Livrable testable (1-5 jours)
  └─ User Story 2
  └─ User Story 3
```

### 🎯 Légende Priorité & Status
- **🔴 P0** : Critique (bloquant)
- **🟠 P1** : Haute
- **🟡 P2** : Moyenne
- **🟢 P3** : Basse

- **✅ FAIT** | **⚠️ PARTIEL** | **❌ À FAIRE**

---

## 📊 ÉTAT ACTUEL DU PROJET

### ✅ MVP Existant (~60% complété)
- Interface mobile-first complète
- Système de recherche et filtrage basique
- Backend Express + Google Play Scraper
- Authentification localStorage (basique)
- **Mode visiteur fonctionnel (démo avec apps par défaut)**
- Panel admin (non sécurisé)

### ❌ Manques Critiques
- Base de données réelle
- Authentification sécurisée
- Scoring privacy avancé
- Synchronisation multi-devices
- **CTA conversion visiteur → utilisateur**
- **Sauvegarde temporaire session (sessionStorage)**

---

## 🚀 BACKLOG PRODUIT

---

# EPIC 1 : 💾 Infrastructure Backend & Données

**Priorité:** 🔴 P0  
**Valeur Business:** Fondation pour scale et multi-devices  
**Estimation Globale:** 8-10 jours  
**Status:** ❌ À FAIRE

**En tant que** Product Owner  
**Je veux** une infrastructure backend robuste avec BDD  
**Afin de** permettre la synchronisation et scale la plateforme

---

## 📖 Récits Utilisateurs (User Stories)

### US-1.1 : Configuration Base de Données PostgreSQL
**Estimation:** 1 jour | **Priorité:** 🔴 P0

```
EN TANT QUE développeur
JE VEUX configurer une base PostgreSQL (Supabase)
AFIN DE remplacer localStorage et fichiers JSON
```

**Critères d'acceptance:**
- [ ] Instance Supabase/PostgreSQL créée
- [ ] Tables créées (users, user_apps, user_migrations, apps_cache, trusti_apps, star_apps)
- [ ] Prisma ORM configuré
- [ ] Connexion testée depuis Express

**Tâches techniques:**
- Créer compte Supabase
- Définir schéma SQL (schema.prisma)
- Générer migrations Prisma
- Configurer variables d'env (DATABASE_URL)

---

### US-1.2 : API CRUD Utilisateurs
**Estimation:** 2 jours | **Priorité:** 🔴 P0

```
EN TANT QU' utilisateur
JE VEUX créer un compte et me connecter
AFIN DE sauvegarder mes données en ligne
```

**Endpoints à créer:**
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/me` - Profil
- `PUT /api/users/me` - Mise à jour profil
- `DELETE /api/users/me` - Suppression compte

**Critères d'acceptance:**
- [ ] Endpoints fonctionnels avec tests Postman
- [ ] Validation des données (email, password)
- [ ] Gestion d'erreurs claire
- [ ] Documentation Swagger générée

---

### US-1.3 : API Gestion Mes Apps
**Estimation:** 1.5 jour | **Priorité:** 🔴 P0

```
EN TANT QU' utilisateur connecté
JE VEUX gérer mes apps favorites via API
AFIN DE les retrouver sur tous mes devices
```

**Endpoints:**
- `GET /api/user/apps` - Liste mes apps
- `POST /api/user/apps` - Ajouter une app
- `DELETE /api/user/apps/:appId` - Retirer une app
- `GET /api/user/migrations` - Mes migrations
- `POST /api/user/migrations` - Marquer comme migré

**Critères d'acceptance:**
- [ ] CRUD complet sur user_apps
- [ ] CRUD complet sur user_migrations
- [ ] Middleware d'authentification
- [ ] Retours JSON standardisés

---

### US-1.4 : Migration localStorage → BDD
**Estimation:** 1.5 jour | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur existant
JE VEUX migrer mes données localStorage vers le cloud
AFIN DE ne pas perdre mon historique
```

**Critères d'acceptance:**
- [ ] Script de migration frontend
- [ ] Détection automatique données localStorage
- [ ] Import en masse via API
- [ ] Confirmation visuelle migration réussie
- [ ] Nettoyage localStorage après migration

---

### US-1.5 : Cache Redis pour Performances
**Estimation:** 1 jour | **Priorité:** 🟡 P2

```
EN TANT QUE système
JE VEUX cacher les résultats API coûteux
AFIN DE réduire la latence et les coûts
```

**Critères d'acceptance:**
- [ ] Redis configuré (Upstash ou local)
- [ ] Cache sur `/api/top-apps` (TTL 1h)
- [ ] Cache sur `/api/trusti-apps` (TTL 10min)
- [ ] Invalidation manuelle possible (admin)

---

# EPIC 2 : � Mode Visiteur & Découverte Sans Compte

**Priorité:** 🟠 P1  
**Valeur Business:** Réduction friction, acquisition utilisateurs  
**Estimation Globale:** 3-4 jours  
**Status:** ⚠️ PARTIEL (mode démo existe mais limité)

**En tant que** visiteur non inscrit  
**Je veux** explorer TrustiScore sans créer de compte  
**Afin de** découvrir la valeur avant de m'engager

---

## 📖 Récits Utilisateurs

### US-2.1 : Navigation Complète Mode Visiteur
**Estimation:** 1 jour | **Priorité:** 🟠 P1

```
EN TANT QUE visiteur
JE VEUX naviguer sur tous les onglets (Sélection, Classement, Alternatives)
AFIN DE découvrir le contenu sans inscription
```

**Ce qui existe déjà:**
- [x] Navigation fonctionnelle en mode non connecté
- [x] Apps par défaut (ChatGPT, Instagram) pour démo

**À améliorer:**
- [ ] Message d'accueil clair "Mode découverte"
- [ ] Indicateur visuel "Visiteur" dans header
- [ ] Tooltip info sur limitations mode visiteur
- [ ] Landing page adaptée (skip si déjà vu, même non connecté)

**Critères d'acceptance:**
- [ ] Accès complet onglets Sélection, Classement, Alternatives
- [ ] Recherche fonctionnelle
- [ ] Filtres fonctionnels
- [ ] Détail d'app consultable (modal)
- [ ] Pas de bug en mode visiteur

---

### US-2.2 : CTA Intelligents pour Conversion
**Estimation:** 1 jour | **Priorité:** 🟠 P1

```
EN TANT QUE visiteur intéressé
JE VEUX voir des incitations à créer un compte au bon moment
AFIN DE comprendre les bénéfices de l'inscription
```

**Moments de conversion identifiés:**
- Après consultation de 5 apps
- Tentative d'ajout dans "Mes Apps"
- Tentative de migration
- Tentative de partage
- Après 2 minutes de navigation

**Critères d'acceptance:**
- [ ] Modal "Créer un compte" contextuelle (pas intrusive)
- [ ] Liste des bénéfices clairs :
  - ✅ Sauvegarder vos apps favorites
  - ✅ Suivre vos migrations
  - ✅ Synchroniser sur tous vos appareils
  - ✅ Recevoir des alertes personnalisées
  - ✅ Contribuer à la communauté
- [ ] Bouton "Continuer sans compte" visible
- [ ] Max 1 popup par session (cookie)
- [ ] Tracking conversions (analytics)

---

### US-2.3 : État Temporaire Local (Session Storage)
**Estimation:** 1 jour | **Priorité:** 🟡 P2

```
EN TANT QUE visiteur explorant
JE VEUX que mes actions soient sauvegardées temporairement
AFIN DE ne pas perdre ma sélection si je rafraîchis la page
```

**Comportement:**
- Sauvegarder dans `sessionStorage` (disparaît à la fermeture)
- Apps ajoutées temporairement
- Recherches récentes
- Filtres appliqués

**Critères d'acceptance:**
- [ ] myApps temporaire sauvegardé (sessionStorage)
- [ ] Restauré après refresh
- [ ] Effacé à la fermeture du navigateur
- [ ] Message "Créez un compte pour sauvegarder définitivement"
- [ ] Bouton "Sauvegarder mes apps" → signup avec pré-remplissage

---

### US-2.4 : Migration Facile Session → Compte
**Estimation:** 0.5 jour | **Priorité:** 🟡 P2

```
EN TANT QUE visiteur qui crée un compte
JE VEUX récupérer automatiquement mes apps temporaires
AFIN DE ne pas recommencer ma sélection
```

**Critères d'acceptance:**
- [ ] Détection sessionStorage lors du signup
- [ ] Popup "Nous avons trouvé X apps temporaires. Les importer ?"
- [ ] Import automatique dans compte
- [ ] Nettoyage sessionStorage après import
- [ ] Animation/feedback de réussite

---

# EPIC 3 : 🔐 Authentification & Sécurité

**Priorité:** 🔴 P0  
**Valeur Business:** Sécurité des données utilisateurs  
**Estimation Globale:** 5-7 jours  
**Status:** ❌ À FAIRE

**En tant que** utilisateur  
**Je veux** une authentification sécurisée et moderne  
**Afin de** protéger mes données personnelles

---

## 📖 Récits Utilisateurs

### US-3.1 : Authentification JWT
**Estimation:** 2 jours | **Priorité:** 🔴 P0

```
EN TANT QU' utilisateur
JE VEUX me connecter avec email/password sécurisé
AFIN DE protéger mon compte
```

**Critères d'acceptance:**
- [ ] JWT access token (15min expiration)
- [ ] JWT refresh token (7 jours)
- [ ] Endpoint `/api/auth/login`
- [ ] Endpoint `/api/auth/refresh`
- [ ] Endpoint `/api/auth/logout`
- [ ] Tokens stockés en httpOnly cookie

---

### US-3.2 : OAuth Social Login (Google)
**Estimation:** 1.5 jour | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur pressé
JE VEUX me connecter avec mon compte Google
AFIN DE gagner du temps (pas de formulaire)
```

**Critères d'acceptance:**
- [ ] OAuth Google configuré
- [ ] Bouton "Se connecter avec Google"
- [ ] Création automatique compte
- [ ] Mapping email/avatar

---

### US-3.3 : Réinitialisation Mot de Passe
**Estimation:** 1.5 jour | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur ayant oublié son mot de passe
JE VEUX recevoir un email de réinitialisation
AFIN DE retrouver l'accès à mon compte
```

**Critères d'acceptance:**
- [ ] Endpoint `/api/auth/forgot-password`
- [ ] Email avec lien temporaire (1h)
- [ ] Page reset password
- [ ] Endpoint `/api/auth/reset-password`

---

### US-3.4 : Protection Routes Admin
**Estimation:** 1 jour | **Priorité:** 🔴 P0

```
EN TANT QU' administrateur
JE VEUX que seuls les admins accèdent au panel
AFIN D'éviter les modifications non autorisées
```

**Critères d'acceptance:**
- [ ] Rôle "admin" en BDD (table users)
- [ ] Middleware `isAdmin()`
- [ ] Protection des endpoints admin
- [ ] Liste blanche emails admin (env var)
- [ ] Logs d'audit des actions admin

---

### US-3.5 : Rate Limiting & Protection DDoS
**Estimation:** 0.5 jour | **Priorité:** 🟡 P2

```
EN TANT QUE système
JE VEUX limiter les requêtes par IP
AFIN D'éviter les abus et attaques
```

**Critères d'acceptance:**
- [ ] express-rate-limit configuré
- [ ] 100 req/15min par IP (endpoints publics)
- [ ] 10 req/15min sur login/register
- [ ] Message d'erreur clair (429)

---

# EPIC 4 : 🎯 Scoring Privacy Intelligent

**Priorité:** 🔴 P0  
**Valeur Business:** USP principal de TrustiScore  
**Estimation Globale:** 8-10 jours  
**Status:** ⚠️ PARTIEL (scoring basique existe)

**En tant que** utilisateur  
**Je veux** des scores basés sur de vraies analyses privacy  
**Afin de** faire confiance aux recommandations

---

## 📖 Récits Utilisateurs

### US-4.1 : Intégration API Exodus Privacy
**Estimation:** 2 jours | **Priorité:** 🔴 P0

```
EN TANT QUE système
JE VEUX récupérer les trackers détectés via Exodus Privacy
AFIN DE baser le score sur de vraies données
```

**Critères d'acceptance:**
- [ ] Compte Exodus Privacy API
- [ ] Fonction `getExodusData(packageName)`
- [ ] Parsing nb de trackers
- [ ] Parsing nb de permissions
- [ ] Stockage en cache (BDD)

---

### US-4.2 : Algorithme de Scoring v2
**Estimation:** 2 jours | **Priorité:** 🔴 P0

```
EN TANT QU' Product Owner
JE VEUX un algorithme de scoring documenté et transparent
AFIN DE justifier chaque note A-E
```

**Formule proposée:**
```javascript
Score = 100
  - (nbTrackers × 5)           // -5 pts par tracker
  - (nbDangerousPerms × 3)     // -3 pts par permission sensible
  - (hasAds ? 15 : 0)          // -15 si publicités
  - (hasIAP ? 10 : 0)          // -10 si achats intégrés
  + (isOpenSource ? 20 : 0)    // +20 si open source
  + (isEUHosted ? 10 : 0)      // +10 si hébergé EU
  + (hasE2EE ? 15 : 0)         // +15 si chiffrement E2E

A: ≥80 | B: 60-79 | C: 40-59 | D: 20-39 | E: <20
```

**Critères d'acceptance:**
- [ ] Algorithme implémenté et testé
- [ ] Documentation complète (SCORING.md)
- [ ] Tests unitaires sur 20 apps
- [ ] Fonction `calculateTrustiScore(appData)`

---

### US-4.3 : Analyse Data Safety Google Play
**Estimation:** 2 jours | **Priorité:** 🟠 P1

```
EN TANT QUE système
JE VEUX scraper les "Data Safety" du Play Store
AFIN D'enrichir le scoring avec données officielles
```

**Critères d'acceptance:**
- [ ] Scraping section Data Safety
- [ ] Parsing "Données collectées"
- [ ] Parsing "Données partagées"
- [ ] Intégration dans scoring
- [ ] Mise à jour hebdomadaire auto

---

### US-4.4 : Dashboard Détail du Score
**Estimation:** 2 jours | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur curieux
JE VEUX comprendre pourquoi une app a tel score
AFIN DE faire confiance au système
```

**Critères d'acceptance:**
- [ ] Modal "Détail du score"
- [ ] Breakdown visuel (graphique)
- [ ] Liste des trackers détectés
- [ ] Liste des permissions dangereuses
- [ ] Source des données (Exodus, Play Store)
- [ ] Dernière mise à jour affichée

---

### US-4.5 : Pipeline Automatique de Calcul
**Estimation:** 1.5 jour | **Priorité:** 🟡 P2

```
EN TANT QUE système
JE VEUX recalculer les scores automatiquement
AFIN DE garder des données à jour
```

**Critères d'acceptance:**
- [ ] Cron job (1x/semaine)
- [ ] Queue avec Bull (Redis)
- [ ] Recalcul top 100 apps FR
- [ ] Historique des scores (table score_history)
- [ ] Notifications si baisse >15 points

---

# EPIC 5 : 📱 Progressive Web App (PWA)

**Priorité:** 🟠 P1  
**Valeur Business:** Expérience mobile native  
**Estimation Globale:** 4-5 jours  
**Status:** ❌ À FAIRE

**En tant que** utilisateur mobile  
**Je veux** installer TrustiScore comme une vraie app  
**Afin de** l'utiliser facilement et offline

---

## 📖 Récits Utilisateurs

### US-4.1 : Configuration PWA & Manifest
**Estimation:** 1 jour | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur mobile
JE VEUX voir une popup "Installer l'app"
AFIN DE l'ajouter à mon écran d'accueil
```

**Critères d'acceptance:**
- [ ] manifest.json complet
- [ ] Icônes adaptatives (192x192, 512x512)
- [ ] Screenshots pour stores
- [ ] Meta tags iOS (apple-touch-icon)
- [ ] Prompt d'installation fonctionnel

---

### US-4.2 : Service Worker & Cache Offline
**Estimation:** 2 jours | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur en déplacement
JE VEUX accéder à TrustiScore sans connexion
AFIN DE consulter mes apps même hors ligne
```

**Critères d'acceptance:**
- [ ] Service Worker enregistré
- [ ] Cache stratégique (Workbox)
- [ ] Assets statiques cachés
- [ ] API responses cachées (stale-while-revalidate)
- [ ] Page offline custom
- [ ] Indicateur connexion en temps réel

---

### US-4.3 : Notifications Push Web
**Estimation:** 1.5 jour | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur abonné
JE VEUX recevoir des notifications push
AFIN D'être alerté des changements importants
```

**Critères d'acceptance:**
- [ ] Permission de notification demandée
- [ ] Service Worker push events
- [ ] Backend notifications (Web Push API)
- [ ] Centre de notifications in-app
- [ ] Paramètres de notification (opt-in/out)

---

### US-4.4 : Optimisation Lighthouse
**Estimation:** 0.5 jour | **Priorité:** 🟡 P2

```
EN TANT QUE développeur
JE VEUX un score Lighthouse >90
AFIN DE garantir les performances
```

**Critères d'acceptance:**
- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90
- [ ] PWA: 100

---

# EPIC 6 : 📊 Dashboard Analytics & Statistiques

**Priorité:** 🟠 P1  
**Valeur Business:** Engagement et rétention  
**Estimation Globale:** 5-6 jours  
**Status:** ❌ À FAIRE

**En tant que** utilisateur engagé  
**Je veux** suivre mes progrès privacy  
**Afin de** rester motivé et voir l'impact concret

---

## 📖 Récits Utilisateurs

### US-5.1 : Score Privacy Personnel
**Estimation:** 1.5 jour | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur
JE VEUX voir mon score privacy global
AFIN DE mesurer ma protection actuelle
```

**Métriques:**
- Score moyen de mes apps
- Nombre total d'apps suivies
- Répartition par grade (A/B/C/D/E)
- Évolution sur 30 jours

**Critères d'acceptance:**
- [ ] Calcul score moyen (API)
- [ ] Graphique circulaire grades
- [ ] Graphique évolution temporelle
- [ ] Comparaison avec moyenne plateforme

---

### US-5.2 : Tracking Économisé
**Estimation:** 1 jour | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur migré
JE VEUX voir combien de trackers j'ai évités
AFIN DE visualiser mon impact positif
```

**Calcul:**
```javascript
trackersAvoided = sum(
  migratedApps.map(app => 
    app.old.trackers - app.new.trackers
  )
)
```

**Critères d'acceptance:**
- [ ] Compteur de trackers évités
- [ ] Estimation données non collectées (Mo)
- [ ] Visualisation comparative avant/après
- [ ] Badge de fierté si >100 trackers

---

### US-5.3 : Graphiques d'Évolution
**Estimation:** 1.5 jour | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur régulier
JE VEUX voir mon évolution dans le temps
AFIN DE constater mes progrès
```

**Critères d'acceptance:**
- [ ] Graphique linéaire score (30j)
- [ ] Graphique barres migrations/mois
- [ ] Timeline des événements (ajouts, migrations)
- [ ] Export PNG du dashboard

---

### US-5.4 : Rapports Mensuels Email
**Estimation:** 1.5 jour | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur abonné
JE VEUX recevoir un rapport mensuel
AFIN DE suivre mes progrès sans ouvrir l'app
```

**Critères d'acceptance:**
- [ ] Email HTML responsive
- [ ] Résumé du mois (score, migrations)
- [ ] Top 3 recommandations personnalisées
- [ ] CTA retour vers app
- [ ] Désabonnement facile

---

# EPIC 7 : 🔍 Recherche & Découverte

**Priorité:** 🟡 P2  
**Valeur Business:** Discovery et engagement  
**Estimation Globale:** 4-5 jours  
**Status:** ⚠️ PARTIEL (recherche basique existe)

**En tant que** utilisateur  
**Je veux** trouver facilement des alternatives  
**Afin de** migrer rapidement vers de meilleures apps

---

## 📖 Récits Utilisateurs

### US-6.1 : Recherche Full-Text avec Algolia
**Estimation:** 1.5 jour | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur
JE VEUX une recherche ultra-rapide et pertinente
AFIN DE trouver des apps instantanément
```

**Critères d'acceptance:**
- [ ] Intégration Algolia Search
- [ ] Index apps synchronisé
- [ ] Recherche typo-tolerant
- [ ] Suggestions auto-complete
- [ ] Highlighting des résultats
- [ ] Résultats <50ms

---

### US-6.2 : Filtres Combinés Multi-Critères
**Estimation:** 1 jour | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur exigeant
JE VEUX filtrer par grade + catégorie + tags
AFIN DE trouver exactement ce que je cherche
```

**Critères d'acceptance:**
- [ ] Filtre par grade (A-E, multi-select)
- [ ] Filtre par catégorie (dropdown)
- [ ] Filtre "Avec TrustiApp uniquement"
- [ ] Filtre "Open Source uniquement"
- [ ] Tri (popularité, score, alphabétique)
- [ ] Sauvegarde filtres favoris

---

### US-6.3 : Recommandations IA Personnalisées
**Estimation:** 2 jours | **Priorité:** 🟠 P1

```
EN TANT QU' utilisateur
JE VEUX des recommandations adaptées à mon profil
AFIN DE découvrir des apps pertinentes
```

**Algorithme:**
- Collaborative filtering (users similaires)
- Content-based (catégories préférées)
- Hybrid approach

**Critères d'acceptance:**
- [ ] Section "Pour vous" sur homepage
- [ ] 5-10 recommandations personnalisées
- [ ] Explication de chaque recommandation
- [ ] Feedback like/dislike pour améliorer
- [ ] ML pipeline avec retraining mensuel

---

# EPIC 8 : 🤝 Communauté & Social

**Priorité:** 🟡 P2  
**Valeur Business:** Viralité et engagement communautaire  
**Estimation Globale:** 6-8 jours  
**Status:** ❌ À FAIRE

**En tant que** utilisateur social  
**Je veux** partager et interagir avec la communauté  
**Afin de** diffuser les bonnes pratiques privacy

---

## 📖 Récits Utilisateurs

### US-7.1 : Système de Reviews
**Estimation:** 3 jours | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur expérimenté
JE VEUX laisser des avis sur les apps
AFIN D'aider les autres à choisir
```

**Critères d'acceptance:**
- [ ] Note 1-5 étoiles
- [ ] Commentaire texte (max 500 char)
- [ ] Like/Dislike sur reviews
- [ ] Signalement d'abus
- [ ] Modération auto (spam filter)
- [ ] Badge "Verified User" (>10 reviews)

---

### US-7.2 : Partage Social Natif
**Estimation:** 1.5 jour | **Priorité:** 🟡 P2

```
EN TANT QU' ambassadeur privacy
JE VEUX partager mes migrations facilement
AFIN D'inspirer mon entourage
```

**Critères d'acceptance:**
- [ ] Web Share API (natif mobile)
- [ ] Partage Twitter pré-rempli
- [ ] Partage LinkedIn
- [ ] OpenGraph tags optimisés
- [ ] Twitter Cards
- [ ] URL courtes (bit.ly API)
- [ ] Analytics des partages

---

### US-7.3 : Leaderboard & Gamification
**Estimation:** 2 jours | **Priorité:** 🟢 P3

```
EN TANT QU' utilisateur compétitif
JE VEUX voir le classement des top contributeurs
AFIN DE me challenger
```

**Critères d'acceptance:**
- [ ] Page /leaderboard
- [ ] Top 100 utilisateurs (score privacy)
- [ ] Top contributeurs (reviews, partages)
- [ ] Badges publics
- [ ] Profils publics optionnels
- [ ] Ma position dans le classement

---

# EPIC 9 : 🌍 Internationalisation

**Priorité:** 🟡 P2  
**Valeur Business:** Expansion internationale  
**Estimation Globale:** 5-6 jours  
**Status:** ❌ À FAIRE

**En tant que** utilisateur international  
**Je veux** utiliser TrustiScore dans ma langue  
**Afin de** mieux comprendre et partager localement

---

## 📖 Récits Utilisateurs

### US-8.1 : Support 4 Langues (FR/EN/DE/ES)
**Estimation:** 3 jours | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur non-francophone
JE VEUX switcher la langue de l'interface
AFIN D'utiliser l'app confortablement
```

**Critères d'acceptance:**
- [ ] i18next configuré
- [ ] Fichiers JSON translations (fr, en, de, es)
- [ ] Détection auto langue navigateur
- [ ] Sélecteur de langue (header)
- [ ] 100% contenu traduit
- [ ] Format dates/nombres localisés

---

### US-8.2 : Top Apps Multi-Pays
**Estimation:** 2 jours | **Priorité:** 🟡 P2

```
EN TANT QU' utilisateur allemand
JE VEUX voir le classement Allemagne
AFIN D'avoir des recommandations locales
```

**Critères d'acceptance:**
- [ ] Sélecteur de pays (dropdown)
- [ ] Google Play Scraper par pays (FR, UK, DE, ES, US)
- [ ] Détection géo IP (pour suggestion)
- [ ] Cache par pays séparé
- [ ] Top 50 apps par pays

---

# EPIC 10 : 🧩 Extensions & Intégrations

**Priorité:** 🟢 P3  
**Valeur Business:** Acquisition nouveaux utilisateurs  
**Estimation Globale:** 8-10 jours  
**Status:** ❌ À FAIRE

**En tant que** utilisateur du Play Store  
**Je veux** voir le TrustiScore directement sur les pages apps  
**Afin de** décider à l'instant T d'installer ou non

---

## 📖 Récits Utilisateurs

### US-9.1 : Extension Chrome
**Estimation:** 4 jours | **Priorité:** 🟢 P3

```
EN TANT QU' utilisateur PC
JE VEUX une extension Chrome qui affiche le score
AFIN DE l'avoir sous les yeux sur le Play Store web
```

**Critères d'acceptance:**
- [ ] Manifest V3
- [ ] Content script sur play.google.com
- [ ] Overlay badge TrustiScore
- [ ] Popup avec détails app
- [ ] Suggestions alternatives (sidebar)
- [ ] Sync avec compte TrustiScore
- [ ] Publication Chrome Web Store

---

### US-9.2 : Extension Firefox
**Estimation:** 2 jours | **Priorité:** 🟢 P3

```
EN TANT QU' utilisateur Firefox
JE VEUX la même extension que sur Chrome
AFIN DE bénéficier du TrustiScore aussi
```

**Critères d'acceptance:**
- [ ] Port Chrome → Firefox
- [ ] Tests cross-browser
- [ ] Publication Firefox Add-ons

---

### US-9.3 : API Publique v1
**Estimation:** 3 jours | **Priorité:** 🟢 P3

```
EN TANT QUE développeur tiers
JE VEUX utiliser l'API TrustiScore
AFIN D'intégrer les scores dans mon app
```

**Endpoints publics:**
```
GET /api/v1/apps/:id
GET /api/v1/apps/search?q=...
GET /api/v1/alternatives/:appId
GET /api/v1/score/:packageName
```

**Critères d'acceptance:**
- [ ] Swagger documentation
- [ ] API keys avec rate limiting
- [ ] Dashboard développeurs (/developers)
- [ ] SDK JavaScript (npm package)
- [ ] Exemples de code
- [ ] Tier gratuit (1000 req/jour)

---

# EPIC 11 : 🏢 Mode Entreprise

**Priorité:** 🟢 P3  
**Valeur Business:** Monétisation B2B  
**Estimation Globale:** 12-15 jours  
**Status:** ❌ À FAIRE

**En tant que** DSI d'entreprise  
**Je veux** gérer la politique apps de mon organisation  
**Afin de** garantir conformité RGPD et sécurité

---

## 📖 Récits Utilisateurs

### US-10.1 : Organisations & Teams
**Estimation:** 3 jours | **Priorité:** 🟢 P3

```
EN TANT QUE admin entreprise
JE VEUX créer une organisation avec plusieurs membres
AFIN DE gérer en équipe
```

**Critères d'acceptance:**
- [ ] Table organizations
- [ ] CRUD organizations
- [ ] Invitations par email
- [ ] Rôles (owner, admin, member)
- [ ] Dashboard /organization/:id

---

### US-10.2 : Politique d'Apps Autorisées/Interdites
**Estimation:** 2 jours | **Priorité:** 🟢 P3

```
EN TANT QUE admin entreprise
JE VEUX définir des apps interdites
AFIN D'assurer la conformité
```

**Critères d'acceptance:**
- [ ] Whitelist/blacklist d'apps
- [ ] Seuil minimal TrustiScore (ex: >B)
- [ ] Alertes si app interdite détectée
- [ ] Export rapport conformité (PDF)

---

### US-10.3 : SSO / SAML
**Estimation:** 3 jours | **Priorité:** 🟢 P3

```
EN TANT QUE employé
JE VEUX me connecter avec mon compte entreprise
AFIN DE simplifier l'accès
```

**Critères d'acceptance:**
- [ ] SAML 2.0 configuré
- [ ] Support Okta, Azure AD
- [ ] Provisioning automatique
- [ ] Sync groupes AD

---

### US-10.4 : Rapports & Analytics Entreprise
**Estimation:** 2.5 jours | **Priorité:** 🟢 P3

```
EN TANT QUE admin entreprise
JE VEUX des rapports d'usage équipe
AFIN DE piloter la stratégie privacy
```

**Critères d'acceptance:**
- [ ] Dashboard admin /organization/analytics
- [ ] Score moyen équipe
- [ ] Top apps utilisées
- [ ] Évolution temporelle
- [ ] Export CSV/PDF
- [ ] Rapports automatiques (hebdo)

---

### US-10.5 : Billing & Licences
**Estimation:** 2 jours | **Priorité:** 🟢 P3

```
EN TANT QUE admin entreprise
JE VEUX payer par utilisateur/mois
AFIN D'avoir une facturation claire
```

**Critères d'acceptance:**
- [ ] Intégration Stripe
- [ ] Plans: Starter (€9/user), Pro (€19/user), Enterprise (custom)
- [ ] Gestion licences (add/remove users)
- [ ] Factures automatiques
- [ ] Portal client Stripe

---

## 📈 MÉTRIQUES DE SUCCÈS (KPIs)

### MVP (3 mois)
- [ ] 10 000 utilisateurs actifs mensuels (MAU)
- [ ] 500+ apps avec TrustiScore
- [ ] Taux de rétention 30j > 40%
- [ ] 1000+ migrations effectuées
- [ ] NPS > 50
- [ ] 3 P0 epics complétés (Backend, Auth, Scoring)

### Croissance (6 mois)
- [ ] 50 000 MAU
- [ ] 2000+ apps
- [ ] Extension navigateur: 10k+ installations
- [ ] API publique: 100+ développeurs
- [ ] 5 epics complétés
- [ ] Partenariat avec 1 acteur privacy majeur

### Scale (12 mois)
- [ ] 200 000 MAU
- [ ] 5000+ apps
- [ ] App mobile: 50k+ téléchargements
- [ ] Mode entreprise: 50+ organisations
- [ ] Revenus récurrents: €50k MRR
- [ ] Label "TrustiScore Certified" reconnu

---

## 🎯 PLANIFICATION SPRINT (Exemple)

---

## 🎯 PLANIFICATION SPRINT (Exemple)

### Sprint 1 (2 semaines) - Foundation Backend
**Objectif:** Infrastructure solide

**User Stories incluses:**
- US-1.1 : Configuration BDD PostgreSQL
- US-1.2 : API CRUD Utilisateurs
- US-1.3 : API Gestion Mes Apps
- US-2.1 : Authentification JWT
- US-2.4 : Protection Routes Admin

**Points:** 40 | **Risques:** Learning curve Prisma

---

### Sprint 2 (2 semaines) - Scoring Intelligent
**Objectif:** USP principal validé

**User Stories incluses:**
- US-3.1 : Intégration API Exodus Privacy
- US-3.2 : Algorithme de Scoring v2
- US-3.4 : Dashboard Détail du Score
- US-1.4 : Migration localStorage → BDD

**Points:** 35 | **Risques:** Disponibilité API Exodus

---

### Sprint 3 (2 semaines) - PWA & Mobile First
**Objectif:** Expérience mobile optimale

**User Stories incluses:**
- US-4.1 : Configuration PWA & Manifest
- US-4.2 : Service Worker & Cache Offline
- US-5.1 : Score Privacy Personnel
- US-6.2 : Filtres Combinés

**Points:** 32 | **Risques:** Compatibilité iOS Safari

---

## 🛠️ STACK TECHNIQUE RECOMMANDÉE

### Frontend
- ✅ React 18 + Vite + Tailwind CSS
- ⏳ React Query (data fetching)
- ⏳ Zustand (state global léger)
- ⏳ i18next (internationalization)
- ⏳ Chart.js (graphiques)

### Backend
- ✅ Express.js
- ⏳ PostgreSQL (Supabase)
- ⏳ Prisma ORM
- ⏳ JWT + Refresh tokens
- ⏳ Redis (Upstash - cache)
- ⏳ Bull (job queues)

### APIs & Services
- ✅ Google Play Scraper
- ⏳ Exodus Privacy API
- ⏳ Supabase Auth
- ⏳ SendGrid/Resend (emails)
- ⏳ Algolia Search
- ⏳ Stripe (payments)
- ⏳ Sentry (error tracking)
- ⏳ PostHog (analytics)

### DevOps
- ✅ Vercel (hosting)
- ⏳ GitHub Actions (CI/CD)
- ⏳ Playwright (E2E tests)
- ⏳ Vitest (unit tests)
- ⏳ Swagger/OpenAPI (doc)

---

## 📝 DÉFINITION OF DONE (DoD)

Une User Story est considérée "Done" si :

- [ ] Code implémenté et mergé sur `main`
- [ ] Tests unitaires écrits (coverage >80%)
- [ ] Tests E2E sur scénarios critiques
- [ ] Revue de code approuvée (1+ reviewer)
- [ ] Documentation technique mise à jour
- [ ] Déployé en production (ou staging)
- [ ] Validé par Product Owner
- [ ] Aucun bug critique ouvert
- [ ] Performance acceptable (Lighthouse)
- [ ] Accessible (WCAG AA minimum)

---

## 🚨 DETTES TECHNIQUES IDENTIFIÉES

### Haute Priorité
1. **LocalStorage au lieu de BDD** → Bloque sync multi-devices
2. **Pas de tests automatisés** → Risque de régression
3. **Scoring basique** → Pas de vraie valeur privacy
4. **Admin non sécurisé** → Risque de modification malveillante
5. **Pas de monitoring** → Impossible de détecter les problèmes

### Moyenne Priorité
6. **Pas de rate limiting** → Vulnérable aux abus
7. **Pas de logs centralisés** → Debugging difficile
8. **Pas de CI/CD** → Déploiement manuel risqué
9. **Code non documenté** → Onboarding dev difficile
10. **Pas de feature flags** → Rollback compliqué

---

## 🎯 ROADMAP PRODUIT (Vue d'ensemble)

```
Q1 2026 (Jan-Mar)
├─ Sprint 1-2: Backend + Auth + Scoring ✅ P0
├─ Sprint 3-4: PWA + Analytics + Migration
└─ Objectif: 10k MAU, NPS >50

Q2 2026 (Apr-Jun)
├─ Sprint 5-6: Communauté + Reviews + Social
├─ Sprint 7-8: i18n + Multi-pays + Recommandations
└─ Objectif: 50k MAU, Extension Chrome lancée

Q3 2026 (Jul-Sep)
├─ Sprint 9-10: Extension navigateurs + API publique
├─ Sprint 11-12: Mode Entreprise v1
└─ Objectif: 100k MAU, 50 entreprises clientes

Q4 2026 (Oct-Dec)
├─ Sprint 13-14: App Mobile Native (React Native)
├─ Sprint 15-16: IA Assistant + Certification
└─ Objectif: 200k MAU, Rentabilité atteinte
```

---

## 📚 RESSOURCES & DOCUMENTATION

### Documentation Projet
- [README.md](README.md) - Getting started
- [API_INTEGRATION.md](API_INTEGRATION.md) - Intégrations APIs
- **BACKLOG.md** (ce fichier) - Product Backlog
- `SCORING.md` (à créer) - Documentation algorithme scoring
- `ARCHITECTURE.md` (à créer) - Diagrammes architecture

### APIs Externes
- [Google Play Scraper](https://github.com/facundoolano/google-play-scraper)
- [Exodus Privacy API](https://reports.exodus-privacy.eu.org/en/info/api/)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs/)

### Design & UX
- Figma (à créer) - Wireframes & Mockups
- Style Guide (Tailwind config)
- User Research (interviews à planifier)

---

## 👥 ÉQUIPE & RÔLES

### Recommandé pour phase MVP
- **1 Product Owner** - Vision produit, priorisation
- **2-3 Développeurs Full-Stack** - React + Node.js
- **1 Designer UX/UI** - Interface, user research
- **(Optionnel) 1 DevOps** - Infrastructure, CI/CD

### Contact
- **Product Owner:** [À définir]
- **Tech Lead:** [À définir]
- **Repository:** https://github.com/notsogeek87/trusti

---

## 🔄 PROCESS AGILE

### Rituels Scrum
- **Sprint Planning** - Lundi matin (2h)
- **Daily Standup** - Chaque jour 10h (15min)
- **Sprint Review** - Vendredi après-midi (1h)
- **Rétrospective** - Vendredi après-midi (1h)
- **Backlog Grooming** - Mercredi (1h)

### Outils
- **Gestion:** GitHub Projects ou Jira
- **Communication:** Slack ou Discord
- **Code:** GitHub
- **Design:** Figma
- **CI/CD:** GitHub Actions

---

## 📊 TEMPLATE USER STORY

```markdown
### US-X.Y : [Titre court et explicite]
**Estimation:** X jours | **Priorité:** 🔴/🟠/🟡/🟢 PX

EN TANT QU' [persona]
JE VEUX [action/fonctionnalité]
AFIN DE [bénéfice/valeur]

**Contexte additionnel:**
[Optionnel : plus de détails]

**Critères d'acceptance:**
- [ ] Critère testable 1
- [ ] Critère testable 2
- [ ] Critère testable 3

**Tâches techniques:**
- [ ] Tâche dev 1
- [ ] Tâche dev 2

**Dépendances:**
- Bloqué par: US-X.Y
- Dépend de: US-X.Y

**Notes:**
[Discussions, décisions, liens utiles]
```

---

*Ce backlog est un document vivant. Il doit être mis à jour à chaque sprint et selon le feedback utilisateurs.*

**Dernière révision:** 07/02/2026  
**Prochaine revue:** 14/02/2026

---

## 🏗️ PHASE 1 - FONDATIONS UI (5-7 jours)

### 1.1 Design System & Composants UI de Base
**Estimation:** 2 jours  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Setup projet

**Composants existants à recréer:**
- [x] `TrustiLogo.jsx` - Logo de l'app
- [x] `ScoreIndicator.jsx` - Affichage des grades A-E
- [x] `SearchBar.jsx` - Barre de recherche
- [x] Layout: `Header.jsx`, `Navigation.jsx`

**Système de couleurs (grades.js):**
```javascript
A: Vert (Excellent), B: Bleu (Bon), C: Jaune (Moyen), 
D: Orange (Médiocre), E: Rouge (Mauvais)
```

---

### 1.2 Constantes & Configuration
**Estimation:** 0.5 jour  
**Status:** ✅ IMPLÉMENTÉ

**Fichiers à créer:**
- [x] `constants/appsData.js` - Base de données statique initiale
- [x] `constants/grades.js` - Configuration des notes A-E
- [x] `constants/tabs.js` - Configuration des onglets (Sélection, Classement, Alternatives, Mes Apps)

---

### 1.3 Système d'Onglets & Navigation
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 1.1, 1.2

**Features:**
- [x] Navigation fixe en bas (mobile-first)
- [x] 4 onglets: Sélection (Star Apps), Classement (Top Apps), Alternatives (TrustiApps), Mes Apps
- [x] Badges de compteur sur "Mes Apps"
- [x] Transition fluide entre onglets

---

### 1.4 Liste d'Applications (AppCard + AppsList)
**Estimation:** 1.5 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 1.1, 1.2

**Composants:**
- [x] `AppCard.jsx` - Carte individuelle avec score, icône, nom, catégorie
- [x] `AppsList.jsx` - Liste scrollable avec filtrage
- [x] Boutons d'action: Ajouter/Retirer, Migrer
- [x] États visuels différents selon l'onglet actif

**UX:** Affichage différencié selon l'onglet (bouton "Migrer" uniquement sur Mes Apps, etc.)

---

## 🔍 PHASE 2 - RECHERCHE & FILTRAGE (2-3 jours)

### 2.1 Système de Recherche
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Phase 1

**Features implémentées:**
- [x] Recherche temps réel (nom + catégorie)
- [x] Debouncing pour performances
- [x] Recherche insensible à la casse
- [x] Reset automatique au changement d'onglet

---

### 2.2 🎛️ Filtres Multi-Critères
**Estimation:** 1.5 jour  
**Status:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

**User Story:**
```
EN TANT QU' utilisateur exigeant
JE VEUX filtrer les apps par grade, catégorie et critères multiples
AFIN DE trouver exactement ce que je cherche rapidement
```

**Ce qui existe:**
- [x] Filtre "Apps avec TrustiApp" sur l'onglet Classement
- [x] Filtrage automatique par onglet

**À ajouter:**
- [ ] Filtre par grade (A-E)
- [ ] Filtre par catégorie
- [ ] Tri personnalisé (score, popularité, nom)
- [ ] Sauvegarde des préférences de filtrage

---

## 📱 PHASE 3 - GESTION DES APPS (3-4 jours)

### 3.1 Hook useAppManagement
**Estimation:** 2 jours  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Phase 1, 2

**Fonctionnalités:**
- [x] État global: myApps, migratedApps, customMigrations
- [x] Ajout/Retrait d'apps dans "Mes Apps"
- [x] Système de migration (marquer une app comme migrée)
- [x] Migrations personnalisées (choisir une alternative différente)
- [x] Recherche et filtrage
- [x] Gestion des onglets

**State Management:**
```javascript
myApps: Set<appId>           // Apps suivies
migratedApps: Set<appId>     // Apps migrées
customMigrations: Map<appId, altName>  // Migrations custom
```

---

### 3.2 Persistance LocalStorage (Auth Utilisateur)
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 3.1

**Hook `useAuth.js`:**
- [x] Connexion/Déconnexion (localStorage)
- [x] Sauvegarde par utilisateur (`trusti_username_apps`)
- [x] Chargement automatique au démarrage
- [x] Reset des données utilisateur
- [x] Mode démo (sans connexion avec apps par défaut)

**Limitation actuelle:** LocalStorage (non synchronisé multi-devices)

---

## 🌐 PHASE 4 - BACKEND & APIs (7-10 jours)

### 4.1 Server Express.js Local
**Estimation:** 2 jours  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** -

**Endpoints existants:**
- [x] `GET /api/top-apps` - Top apps France (Google Play Scraper)
- [x] `GET /api/trusti-apps` - TrustiApps (alternatives)
- [x] `GET /api/star-apps` - Apps sélectionnées par l'équipe
- [x] `GET /api/custom-trusti-apps` - Apps admin custom
- [x] `POST /api/custom-trusti-apps` - Ajouter TrustiApp (admin)
- [x] `DELETE /api/custom-trusti-apps/:id` - Supprimer TrustiApp
- [x] `POST /api/star-apps` - Ajouter StarApp (admin)
- [x] `DELETE /api/star-apps/:id` - Supprimer StarApp

**Fichiers:**
- [x] `server/index.js` (Express server)
- [x] `server/data/custom-trusti-apps.json` (persistance fichier)
- [x] `server/data/star-apps.json`

---

### 4.2 Intégration Google Play Scraper
**Estimation:** 2 jours  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 4.1

**Features:**
- [x] Scraping du Google Play Store (top apps France)
- [x] Calcul automatique de grade basique (gratuit, ads, IAP)
- [x] Enrichissement avec icônes et métadonnées
- [x] Gestion d'erreurs et fallback
- [x] Rate limiting pour éviter le blocage

**Algorithme de scoring actuel:**
```javascript
Score = +20 (gratuit) +30 (pas de pub) +30 (pas IAP) +20 (autre)
A: ≥90, B: ≥70, C: ≥50, D: ≥30, E: <30
```

**⚠️ Limitation:** Scoring basique, pas d'analyse privacy réelle

---

### 4.3 Vercel Serverless Functions
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 4.1, 4.2

**Configuration:**
- [x] `vercel.json` configuré
- [x] Déploiement serverless functions dans `/api`
- [x] Détection auto environnement (dev vs prod)
- [x] CORS configuré

**API Routes déployées:**
- [x] `/api/top-apps.js`
- [x] `/api/trusti-apps.js`
- [x] `/api/star-apps.js`
- [x] `/api/custom-trusti-apps.js`

---

### 4.4 Système de Cache & Auto-refresh
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 4.2

**Features:**
- [x] Rafraîchissement automatique toutes les heures
- [x] Indicateur "Dernière mise à jour"
- [x] Revalidation toutes les 10s pour admin changes
- [x] Cache fallback en cas d'erreur API

---

### 4.5 💾 Base de Données Centralisée & API REST
**Estimation:** 5 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Dépendances:** 4.1

**User Story:**
```
EN TANT QUE développeur de TrustiScore
JE VEUX une base de données centralisée avec API REST
AFIN DE permettre la synchronisation multi-devices et scale la plateforme
```

**Objectif:** Remplacer localStorage + fichiers JSON par vraie BDD

**Stack suggérée:**
- PostgreSQL (Supabase) ou MongoDB (Atlas)
- Prisma ORM pour typage
- JWT pour authentification

**Tables nécessaires:**
```sql
users (id, username, email, created_at)
user_apps (user_id, app_id, added_at)
user_migrations (user_id, app_id, migrated_to, migrated_at)
apps_cache (id, data, updated_at)
```

**Endpoints à créer:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/user/apps
- POST /api/user/apps
- DELETE /api/user/apps/:id
- POST /api/user/migrations

---

## 🎭 PHASE 5 - MODALES & DÉTAILS (4-5 jours)

### 5.1 Modal Détail Application
**Estimation:** 1.5 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Phase 3

**Features:**
- [x] Affichage plein écran avec détails complets
- [x] Score, catégorie, raison du grade
- [x] Alternatives recommandées (TrustiApps)
- [x] Boutons d'action (Ajouter, Migrer)
- [x] Transition fluide

---

### 5.2 Modal de Partage
**Estimation:** 1.5 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 5.1

**Modales existantes:**
- [x] `ShareModal.jsx` - Partage des migrations (Mes Apps)
- [x] `TrustiShareModal.jsx` - Partage des TrustiApps sélectionnées

**Features:**
- [x] Génération de texte de partage personnalisé
- [x] Copie dans le presse-papiers
- [x] Stats: nombre d'apps, score moyen
- [x] Format optimisé réseaux sociaux

---

### 5.3 Modal Sélecteur de Migration
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 5.1

**Features:**
- [x] Choisir une alternative différente de celle par défaut
- [x] Liste de toutes les TrustiApps disponibles
- [x] Recherche dans les alternatives
- [x] Sauvegarde de la migration personnalisée

---

### 5.4 Modal Login & Admin
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 3.2

**Modales:**
- [x] `LoginModal.jsx` - Connexion/Inscription simple
- [x] `AdminAppsModal.jsx` - Panel admin pour gérer TrustiApps et StarApps
- [x] `AdminTrustiAppsModal.jsx` - Gestion des TrustiApps
- [x] `AdminStarAppsModal.jsx` - Gestion des StarApps

**Admin Features:**
- [x] Ajouter/Supprimer TrustiApps
- [x] Ajouter/Supprimer StarApps
- [x] Recherche Google Play Store directe
- [x] Liaison TrustiApp ↔ Multiple Apps
- [x] Persistance dans JSON files

**⚠️ Sécurité:** Aucune authentification admin actuellement (à ajouter)

---

## 🎨 PHASE 6 - UX AVANCÉE (3-4 jours)

### 6.1 Landing Page
**Estimation:** 1.5 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Phase 1

**Features:**
- [x] Page d'accueil explicative (première visite)
- [x] Explication du concept TrustiScore
- [x] Affichage unique (localStorage flag)
- [x] Mode non-connecté: toujours affiché
- [x] Mode connecté: affiché une fois

---

### 6.2 Panneau Explicatif (ExplainerPanel)
**Estimation:** 0.5 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Phase 1

**Features:**
- [x] Explication du système de notation (A-E)
- [x] Détails sur chaque grade
- [x] Bouton info dans le header
- [x] Panel déroulant/fermable

---

### 6.3 Écran de Chargement Initial
**Estimation:** 0.5 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** Phase 4

**Features:**
- [x] Spinner avec logo pendant chargement API
- [x] Message "Chargement des applications..."
- [x] Overlay plein écran
- [x] Masqué après chargement complet (top, trusti, star apps)

---

### 6.4 Boutons de Partage Contextuels
**Estimation:** 1 jour  
**Status:** ✅ IMPLÉMENTÉ  
**Dépendances:** 5.2

**Features:**
- [x] Bouton de partage sur Mes Apps (migrations)
- [x] Bouton de partage sur Alternatives (TrustiApps)
- [x] Stats en temps réel
- [x] Désactivation si aucune app sélectionnée

---

## 🔧 PHASE 7 - FEATURES MANQUANTES (10-15 jours)

### 7.1 🎯 Système de Scoring Privacy Intelligent
**Estimation:** 5 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🔴 P0

**User Story:**
```
EN TANT QU' utilisateur soucieux de ma vie privée
JE VEUX voir un score TrustiScore basé sur de vraies analyses de privacy
AFIN DE prendre des décisions éclairées sur les apps que j'utilise
```

**Objectif:** Remplacer le scoring basique actuel par une vraie analyse privacy

**Intégrations possibles:**
- [ ] Exodus Privacy API (trackers détectés)
- [ ] PrivacyScore.org
- [ ] Analyse des permissions Android
- [ ] Lecture des politiques de confidentialité (NLP)
- [ ] Scraping des Data Safety labels (Google Play)

**Algorithme suggéré:**
```javascript
Score = (
  - Nb de trackers détectés (Exodus)
  - Permissions dangereuses
  - Data Safety (partage données tiers)
  + Open source (+20)
  + Chiffrement E2E (+30)
  + RGPD compliant (+20)
  + Hébergement EU (+10)
)
```

**Critères d'acceptance:**
- [ ] Scoring automatique pour 100+ apps
- [ ] Mise à jour hebdomadaire automatique
- [ ] Dashboard détaillé par app (détail du score)
- [ ] API documentée pour le calcul

---

### 7.2 🔐 Authentification Sécurisée Multi-Devices
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🔴 P0  
**Dépendances:** 4.5 (BDD)

**User Story:**
```
EN TANT QU' utilisateur régulier
JE VEUX me connecter de manière sécurisée avec mon email ou Google
AFIN DE retrouver mes données sur tous mes appareils
```

**Objectif:** Remplacer le système localStorage par vraie authentification

**Stack suggérée:**
- Supabase Auth (email + OAuth Google/GitHub)
- JWT tokens
- Session management

**Features:**
- [ ] Inscription/Connexion sécurisée
- [ ] Réinitialisation mot de passe
- [ ] OAuth (Google, GitHub)
- [ ] Session persistante multi-devices
- [ ] Profil utilisateur

---

### 7.3 🔄 Synchronisation Automatique Cross-Platform
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** 7.2, 4.5

**User Story:**
```
EN TANT QU' utilisateur mobile et desktop
JE VEUX que mes apps et migrations se synchronisent automatiquement
AFIN DE ne pas avoir à reconfigurer sur chaque appareil
```

**Features:**
- [ ] Sync automatique des apps/migrations
- [ ] Détection de conflits
- [ ] Offline-first avec sync différée
- [ ] Indicateur de statut sync

---

### 7.4 🛡️ Protection du Panel Administrateur
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🔴 P0

**User Story:**
```
EN TANT QU' administrateur de la plateforme
JE VEUX que seuls les admins autorisés puissent modifier les apps
AFIN DE garantir l'intégrité des données TrustiScore
```

**Problème actuel:** N'importe qui peut accéder au panel admin

**Solution:**
- [ ] Rôle "admin" en BDD
- [ ] Endpoint `/api/auth/verify-admin`
- [ ] Protection des routes admin (middleware)
- [ ] Li📊 Mon Tableau de Bord Privacy Personnel
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** Phase 3, 4.5

**User Story:**
```
EN TANT QU' utilisateur engagé
JE VEUX voir l'évolution de mon score privacy global
AFIN DE mesurer concrètement mes progrès et rester motivé
```
## 📊 PHASE 8 - ANALYTICS & GAMIFICATION (5-7 jours)

### 8.1 Dashboard Statistiques Utilisateur
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** Phase 3, 4.5

**Features:**
- [ ] Score moyen des apps utilisées
- [ ] Évolution dans le temps (graphiques)
- [ ] Nombre d'apps migrées
- [ ] Économie de tracking estimée
- [ ] Comparaison avec moyenne des utilisateurs
- [ ] Rapports mensuels (email)

**Métriques à calculer:**
```javascript
avgScore🏆 Gamification : Badges & Achievements
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2

**User Story:**
```
EN TANT QU' utilisateur débutant
JE VEUX débloquer des badges pour mes actions privacy
AFIN DE rendre le parcours ludique et valoriser mes efforts
```

---

### 8.2 Système de Badges & Récompenses
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2

**Badges suggérés:**
- [ ] "Premier pas" - Première app ajoutée
- [ ] "L🔔 Alertes Privacy Intelligentes
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** 7.2

**User Story:**
```
EN TANT QU' utilisateur averti
JE VEUX être notifié quand une app que j'utilise baisse de score
AFIN DE réagir rapidement et protéger mes données
```
---

### 8.3 Notifications & Alertes
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** 7.2

**Types de notifications:**
- [ ] Baisse de score d'une app suivie
- [ ] No📱 Application Installable (PWA)
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1

**User Story:**
```
EN TANT QU' utilisateur mobile
JE VEUX installer TrustiScore comme une vraie app sur mon téléphone
AFIN D'y accéder rapidement sans navigateur et fonctionner hors ligne
```ivacy importants

**Technologies:**
- Web Push API (PWA)
- Emails (SendGrid/Resend)
- In-app notification center

---

## 🌍 PHASE 9 - PWA & MOBILE (4-6 jours)

### 9.1 Progressive Web App (PWA)
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1

**Features:**
- [ ] Service Worker pour cache offline
- [ ] Ma📲 Scan Automatique de Mon Smartphone
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2  
**Dépendances:** 9.1

**User Story:**
```
EN TANT QU' utilisateur Android
JE VEUX que TrustiScore scanne automatiquement mes apps installées
AFIN DE voir instantanément mon score global et les recommandations
```e-plan

**Critères d'acceptance:**
- [ ] Lighthouse PWA score > 90
- [ ] Installable sur iOS/Android
- [ ] Fonctionne offline
- [ ] Fast load (<2s)

---

### 9.2 Scan Apps Installées (Mobile)
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2  
**Dépendances:** 9.1

**Objectif:** Scanner automatiquement les apps installées sur le device

**Limitat🔍 Moteur de Recherche Intelligent
**Estimation:** 2 jours  
**Status:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ  
**Priorité:** 🟡 P2

**User Story:**
```
EN TANT QU' utilisateur cherchant une alternative
JE VEUX une recherche puissante avec filtres et tri
AFIN DE trouver rapidement l'app qui correspond à mes besoins
```
**Features:**
- [ ] Détection automatique apps installées (Android)
- [ ] Import dans "Mes Apps"
- [ ] Recommandations instantanées
- [ ] Score global du device

---

## 🔍 PHASE 10 - DISCOVERY & SEARCH (3-4 jours)

### 10.1 Recherche Avancée
**Estimation:** 2 jours  
**Status:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ  
**Priorité:** 🟡 P2

**Ce qui 🤖 Recommandations Personnalisées par IA
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** 4.5, 8.1

**User Story:**
```
EN TANT QU' utilisateur novice
JE VEUX recevoir des recommandations d'alternatives adaptées à mon usage
AFIN DE migrer facilement sans chercher moi-même
```mots-clés
- [ ] Recherche floue (typos)
- [ ] Filtres combinés (grade + catégorie)
- [ ] Tri (popularité, score, récent, alphabétique)
- [ ] Recherche vocale
- [ ] Historique de recherche
- [ ] Suggestions auto-complete

---

### 10.2 Système de Recommandations
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟠 P1  
**Dépendances:** 4.5, 8.1
⭐ Avis & Retours de la Communauté
**Estimation:** 4 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2  
**Dépendances:** 4.5, 7.2

**User Story:**
```
EN TANT QU' utilisateur hésitant
JE VEUX lire les avis d'autres utilisateurs sur une alternative
AFIN DE valider mon choix avant de migrer
```
  - Patterns d'autres utilisateurs similaires
  - Score minimum souhaité
- [ ] Machine Learning basique (collaborative filtering)
- [ ] Explications des recommandations

---

## 🤝 PHASE 11 - SOCIAL & COMMUNAUTÉ (6-8 jours)

### 11.1 Système de Reviews & Avis
**Estimation:** 4 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorit🌐 Partage Social Optimisé & Viral
**Estimation:** 2 jours  
**Status:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ  
**Priorité:** 🟡 P2

**User Story:**
```
EN TANT QU' ambassadeur de la privacy
JE VEUX partager facilement mes migrations sur les réseaux sociaux
AFIN DE sensibiliser mon entourage et inspirer d'autres personnes
```
- [ ] Avis utilisateurs sur les apps
- [ ] Notation 1-5 étoiles
- [ ] Commentaires textuels
- [ ] Votes utiles/pas utiles
- [ ] Signalement d'abus
- [ ] Modération (auto + manuelle)
- [ ] Badges "Vérified User" / "Expert"

---

### 11.2 Partage Social Amélioré
**Estimation:** 2 jours  
**Status:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ  
**Priorité:** 🟡 P2
🏅 Classement des Champions Privacy
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3  
**Dépendances:** 7.2

**User Story:**
```
EN TANT QU' utilisateur compétitif
JE VEUX voir le classement des meilleurs défenseurs de la privacy
AFIN DE me challenger et progresser dans la communauté
```
- [ ] Partage natif (Web Share API)
- [ ] Preview cards optimisées (OpenGraph)
- [ ] Partage direct Twitter, LinkedIn, Mastodon
- [ ] URL courtes personnalisées
- [ ] Analytics des partages
- [ ] Comparateur partageable (URL)
🌍 Application Multilingue (Français, English, Deutsch, Español)
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2

**User Story:**
```
EN TANT QU' utilisateur international
JE VEUX utiliser TrustiScore dans ma langue maternelle
AFIN DE mieux comprendre les enjeux privacy et partager avec mon pays
```blics & Leaderboard
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3  
**Dépendances:** 7.2

**Features:**
- [ ] Profil public optionnel
- [ ] Affichage des migrations publiques
- [ ] Badges et achievements
- [ ] Leaderboard (top contributeurs)
- [ ] Followers/Following
- [ ] Feed d'activités

---

## 🌐 PHASE 12 - INTERNATIONALIZATION (4-5 jours)
🗺️ Classements par Pays
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2  
**Dépendances:** 12.1, 4.2

**User Story:**
```
EN TANT QU' utilisateur allemand
JE VEUX voir le top des apps en Allemagne (et non en France)
AFIN D'avoir des recommandations pertinentes pour mon marché
```

**Langues prioritaires:**
1. Français (actuel)
2. Anglais
3. Allemand
4. Espagnol

**Implémentation:**
- [ ] i18next ou react-intl
- [ ] Fichiers de traduction JSON
- [ ] Détection auto langue navigateur
- [ ] Sélecteur de langue
- [ ] Tra🧩 Extension Chrome/Firefox : TrustiScore en Temps Réel
**Estimation:** 6 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QU' utilisateur naviguant sur le Play Store
JE VEUX voir le TrustiScore directement sur la page de l'app
AFIN DE décider instantanément si je l'installe ou non
```
### 12.2 Support Multi-pays
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟡 P2  
**Dépendances:** 12.1, 4.2

**Features:**
- [ ] Top Apps par pays (France, UK, Germany, Spain, USA)
- [ ] Détection géographique (IP)
- [ ] Sélecteur de pays
- [ ] Réglementations locales (RGPD, CCPA, etc.)
- [ ] Formats localisés (dates, nombres)

---

## 🔌 PHA🔌 API Publique pour Développeurs
**Estimation:** 4 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3  
**Dépendances:** 4.5, 7.2

**User Story:**
```
EN TANT QUE développeur tiers
JE VEUX intégrer les TrustiScores dans mon app/site
AFIN D'enrichir mon produit avec des données privacy
```NTÉ  
**Priorité:** 🟢 P3

**Plateformes:**
- Chrome/Edge (Manifest V3)
- Firefox
- Safari (si possible)

**Features:**
- [ ] Badge TrustiScore sur Google Play Store
- [ ] Overlay avec alternatives
- [ ] Suggestions en temps réel
- [ ] Sync avec compte TrustiScore
- [ ] Icône badge avec score
🤝 Partenariats avec Acteurs Privacy
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QU' utilisateur d'outils privacy (F-Droid, Exodus)
JE VEUX voir les données TrustiScore intégrées dans ces outils
AFIN D'avoir une expérience cohérente cross-platform
```ue
**Estimation:** 4 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3  
**Dépendances:** 4.5, 7.2

**Endpoints publics:**
```
GET /api/v1/apps/:id
GET /api/v1/apps/search
GET /api/v1/apps/top
GET /api/v1/alternatives/:appId
POST /api/v1/score/calculate
```

**Features:**
- [ ] Documentation Swagger/OpenAPI
- [ ] API keys avec rate limiting
- [ ] SDK🏢 TrustiScore Business : Gestion d'Équipe
**Estimation:** 8 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QUE DSI d'une entreprise
JE VEUX gérer la politique d'apps de mes employés
AFIN DE garantir la conformité RGPD et la sécurité de l'organisation
``` (free/pro/enterprise)

---

### 13.3 Intégrations Tierces
**Estimation:** 2 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**Partenariats potentiels:**
- [ ] F-Droid (source d'apps open source)
- [ ] Exodus Privacy (trackers)
- [ ] PrivacyTools.io
- [ ] Mozilla Common Voice
- [ ] EFF (Electronic Frontier Foundation)
✅ Label "TrustiScore Certified" pour Développeurs
**Estimation:** 3 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QUE développeur d'app respectueuse de la privacy
JE VEUX obtenir un label "TrustiScore Certified"
AFIN DE valoriser mes efforts et rassurer mes utilisateurs
``` your apps"
- [ ] iFrame embeddable

---

## 🏢 PHASE 14 - FEATURES ENTREPRISE (10-15 jours)

### 14.1 Mode Entreprise
**Estimation:** 8 jours  
**Status:💬 Assistant IA Privacy
**Estimation:** 5 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QU' utilisateur débutant
JE VEUX poser des questions en langage naturel sur la privacy
AFIN DE comprendre facilement les enjeux et recevoir des conseils personnalisés
```
- [ ] Gestion multi-utilisateurs (organisations)
- [ ] Rôles et permissions (admin, manager, user)
- [ ] Politique d'apps autorisées/interdites
- [ ] Rapports d'usage équipe
- [ ] Dashboard admin
- [ ] Compliance reports (RGPD, SOC2)
- [ ] SSO/SAML
- [ ] MDM integration
- [ ] Billing & licences

---

### 14.2 📱 App Mobile Native iOS & Android
**Estimation:** 20+ jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QU' utilisateur mobile premium
JE VEUX une app native performante avec scan automatique
AFIN D'avoir la meilleure expérience possible sur mobile
```

**Objectif:** Label "TrustiScore Certified" pour apps

**Features:**
- [ ] Processus de certification
- [ ] Audit privacy par équipe TrustiScore
- [ ] Badge officiel
- [ ] Listing apps certifiées
- [ ] Renouvellement annuel
- [ ] Programme de partenariat développeurs

---

## 🚀 PHA🔬 Analyseur APK : Analyse Privacy Avancée
**Estimation:** 8 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**User Story:**
```
EN TANT QU' expert sécurité
JE VEUX uploader un APK pour une analyse privacy détaillée
AFIN DE découvrir les trackers cachés et permissions dangereuses
```ours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**Features:**
- [ ] Chatbot assistant privacy
- [ ] Recommandations conversationnelles
- [ ] Explication détaillée des scores
- [ ] Support utilisateur automatisé
- [ ] RAG sur documentation privacy

**Stack:** OpenAI API ou Mistral API

---

### 15.2 Application Mobile Native
**Estimation:** 20+ jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**Technologies:** React Native ou Flutter

**Features:**
- [ ] Toutes les features web
- [ ] Scan apps installées (Android)
- [ ] Notifications push natives
- [ ] Widget home screen
- [ ] Deep linking
- [ ] Partage natif

---

### 15.3 Scanner de Fichiers APK
**Estimation:** 8 jours  
**Status:** ❌ NON IMPLÉMENTÉ  
**Priorité:** 🟢 P3

**Objectif:** Upload APK pour analyse privacy

**Features:**
- [ ] Upload fichier APK
- [ ] Analyse statique (permissions, trackers)
- [ ] Décompilation automatique
- [ ] Détection de trackers (Exodus Privacy)
- [ ] Génération de rapport détaillé
- [ ] Comparaison avec apps similaires

---

## 📈 RÉSUMÉ DE L'ÉTAT ACTUEL

### ✅ DÉJÀ IMPLÉMENTÉ (Environ 60-70% du MVP)

**Frontend:**
- Interface complète mobile-first
- Système d'onglets
- Recherche et filtrage basique
- Cartes d'applications
- Modales (détail, partage, login, admin)
- Landing page
- Gestion d'état (hooks personnalisés)

**Backend:**
- Server Express.js
- Google Play Scraper
- API REST basique
- Vercel serverless functions
- Persistance fichiers JSON
- Auto-refresh

**Auth & Data:**
- Auth localStorage (basique)
- Sauvegarde par utilisateur (localStorage)
- Panel admin (non sécurisé)

### ❌ MANQUANT CRITIQUE (P0)

1. **Base de données réelle** (actuellement localStorage + JSON files)
2. **Authentification sécurisée** (JWT, OAuth)
3. **Système de scoring avancé** (actuellement scoring basique)
4. **Sécurité admin** (aucune protection)
5. **Synchronisation multi-devices**

### 🎯 PROCHAINES PRIORITÉS RECOMMANDÉES

#### Court terme (1-2 semaines)
1. Phase 4.5 - Backend BDD (PostgreSQL/Supabase)
2. Phase 7.1 - Système de scoring avancé (Exodus Privacy)
3. Phase 7.2 - Authentification réelle
4. Phase 7.4 - Sécurité admin

#### Moyen terme (1 mois)
5. Phase 8.1 - Dashboard statistiques
6. Phase 8.3 - Notifications
7. Phase 9.1 - PWA
8. Phase 10.2 - Recommandations

#### Long terme (2-3 mois)
9. Phase 11 - Communauté & reviews
10. Phase 12 - Internationalization
11. Phase 13 - Extensions & API publique
12. Phase 14 - Mode entreprise

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs MVP (3 mois)
- [ ] 10 000 utilisateurs actifs mensuels
- [ ] 500+ apps avec TrustiScore
- [ ] Taux de rétention 30j > 40%
- [ ] 1000+ migrations effectuées
- [ ] NPS > 50

### KPIs Croissance (6 mois)
- [ ] 50 000 MAU
- [ ] 2000+ apps
- [ ] Extension navigateur: 10k+ installations
- [ ] API publique: 100+ développeurs
- [ ] Partenariat majeur signé

### KPIs Long terme (12 mois)
- [ ] 200 000 MAU
- [ ] 5000+ apps
- [ ] App mobile: 50k+ téléchargements
- [ ] Mode entreprise: 50+ organisations
- [ ] Label "TrustiScore Certified" reconnu

---

## 🛠️ STACK TECHNIQUE RECOMMANDÉE

### Frontend
- ✅ React 18 + Vite
- ✅ Tailwind CSS
- ✅ Lucide React (icônes)
- ⏳ React Query (pour data fetching)
- ⏳ Zustand ou Jotai (state global)
- ⏳ React Router (si multi-pages)

### Backend
- ✅ Express.js
- ⏳ PostgreSQL (Supabase) ou MongoDB (Atlas)
- ⏳ Prisma ORM
- ⏳ JWT + Refresh tokens
- ⏳ Redis (cache)
- ⏳ Bull (job queues)

### APIs & Services
- ✅ Google Play Scraper
- ⏳ Exodus Privacy API
- ⏳ Supabase Auth
- ⏳ SendGrid/Resend (emails)
- ⏳ OpenAI API (chatbot)
- ⏳ Sentry (error tracking)
- ⏳ PostHog (analytics)

### DevOps
- ✅ Vercel (hosting)
- ⏳ GitHub Actions (CI/CD)
- ⏳ Docker (si besoin)
- ⏳ Playwright (E2E tests)
- ⏳ Vitest (unit tests)

---

## 📝 NOTES FINALES

**Points forts du code actuel:**
- Architecture propre et modulaire
- Hooks personnalisés bien structurés
- Mobile-first design
- Interface fluide et moderne

**Dettes techniques identifiées:**
- LocalStorage au lieu de BDD
- Pas de tests automatisés
- Scoring trop basique
- Sécurité admin inexistante
- Pas de monitoring/logs

**Recommandations:**
1. Prioriser le backend + BDD (Phase 4.5)
2. Implémenter les tests dès maintenant
3. Ajouter Sentry pour error tracking
4. Documenter l'API avec Swagger
5. Mettre en place CI/CD

---

**Contact Product Owner:** [À définir]  
**Repository:** https://github.com/notsogeek87/trusti  
**Documentation:** [README.md](README.md) | [API_INTEGRATION.md](API_INTEGRATION.md)

---

*Cette backlog est un document vivant qui doit être mis à jour régulièrement selon le feedback utilisateurs et les priorités business.*

### 4. Notifications & Alertes Utilisateur
**Estimation:** 5 jours  
**Objectif:** Alerter les utilisateurs des changements  
**Détails:**
- Notifications push web (PWA)
- Alertes email optionnelles
- Notifications pour :
  - Baisse du score d'une app suivie
  - Nouvelle TrustiApp disponible
  - Mise à jour de données importantes
- Centre de notifications in-app

**Critères d'acceptance:**
- [ ] Système de notifications push implémenté
- [ ] Emails optionnels configurables
- [ ] Centre de notifications consultable
- [ ] Préférences utilisateur

---

### 5. Comparateur d'Applications Avancé
**Estimation:** 6 jours  
**Objectif:** Permettre la comparaison côte à côte  
**Détails:**
- Interface de comparaison multi-apps (2-4 apps)
- Tableaux comparatifs des critères
- Graphiques de comparaison visuelle
- Export PDF/PNG du comparatif
- Partage du comparatif via URL

**Critères d'acceptance:**
- [ ] Sélection multi-apps (max 4)
- [ ] Interface comparative claire
- [ ] Graphiques visuels
- [ ] Export et partage fonctionnels

---

### 6. Module Statistiques & Analytics
**Estimation:** 7 jours  
**Objectif:** Dashboard personnel d'utilisation  
**Détails:**
- Statistiques personnelles :
  - Score moyen des apps utilisées
  - Évolution dans le temps
  - Nombre d'apps migrées
  - Économie de données/tracking évitée
- Graphiques d'évolution
- Badges de progression gamifiés
- Rapports mensuels automatiques

**Critères d'acceptance:**
- [ ] Dashboard statistiques complet
- [ ] Graphiques interactifs
- [ ] Système de badges
- [ ] Rapport mensuel par email

---

### 7. Système de Recommandations Intelligent
**Estimation:** 8 jours  
**Objectif:** Suggérer des alternatives personnalisées  
**Détails:**
- Algorithme de recommandation basé sur :
  - Apps actuellement utilisées
  - Préférences utilisateur
  - Score TrustiScore minimum souhaité
- ML pour apprendre des choix utilisateurs
- Suggestions contextuelles
- Raisons expliquées de chaque recommandation

**Critères d'acceptance:**
- [ ] Algorithme de recommandation fonctionnel
- [ ] Suggestions personnalisées affichées
- [ ] Explications claires des recommandations
- [ ] Feedback utilisateur sur pertinence

---

## 🟡 P2 - PRIORITÉ MOYENNE (Backlog)

### 8. Mode Hors Ligne (PWA Complète)
**Estimation:** 5 jours  
**Objectif:** Fonctionnement offline complet  
**Détails:**
- Service Worker robuste
- Cache stratégique des données
- Synchronisation différée
- Indicateur de statut réseau
- Installation comme app native

**Critères d'acceptance:**
- [ ] PWA installable (iOS/Android)
- [ ] Fonctionnement offline complet
- [ ] Sync automatique online
- [ ] Manifest configuré

---

### 9. Système de Communauté & Reviews
**Estimation:** 10 jours  
**Objectif:** Avis et retours communautaires  
**Détails:**
- Système de notes/avis utilisateurs
- Commentaires sur les apps
- Modération de contenu
- Votes utiles/pas utiles
- Signalement d'abus
- Gamification (badges contributeurs)

**Critères d'acceptance:**
- [ ] Système de reviews fonctionnel
- [ ] Modération active
- [ ] Badges de contribution
- [ ] API de filtrage/tri des avis

---

### 10. Intégration Réseaux Sociaux
**Estimation:** 4 jours  
**Objectif:** Améliorer le partage social  
**Détails:**
- Partage direct Twitter, Facebook, LinkedIn
- Preview cards optimisées (OpenGraph, Twitter Cards)
- Hashtags automatiques #Privacy #TrustiScore
- Tracking des partages
- Boutons de partage améliorés

**Critères d'acceptance:**
- [ ] Partage natif tous réseaux
- [ ] Preview cards belles et fonctionnelles
- [ ] Analytics de partage
- [ ] Tests cross-platform

---

### 11. Recherche Avancée & Filtres
**Estimation:** 5 jours  
**Objectif:** Recherche plus puissante  
**Détails:**
- Filtres multiples :
  - Par catégorie d'app (social, productivité, etc.)
  - Par fourchette de score (A-E)
  - Par présence TrustiApp
  - Par niveau de tracking
- Recherche par tags
- Tri personnalisé (popularité, score, récent)
- Sauvegarde des recherches favorites

**Critères d'acceptance:**
- [ ] Filtres multiples opérationnels
- [ ] Recherche performante (<200ms)
- [ ] Sauvegardes de recherches
- [ ] Interface intuitive

---

### 12. Export de Données Utilisateur (RGPD)
**Estimation:** 3 jours  
**Objectif:** Conformité RGPD complète  
**Détails:**
- Export complet des données JSON/CSV
- Suppression complète du compte
- Portabilité des données
- Historique des consentements
- Politique de confidentialité claire

**Critères d'acceptance:**
- [ ] Export en 1 clic (JSON + CSV)
- [ ] Suppression complète fonctionnelle
- [ ] Documentation RGPD à jour
- [ ] Tests de conformité

---

### 13. Support Multi-langues (i18n)
**Estimation:** 6 jours  
**Objectif:** Internationalisation de l'app  
**Détails:**
- Support FR, EN, ES, DE
- Détection automatique de langue
- Sélecteur de langue
- Traduction de tout le contenu
- Données apps localisées par pays
- Format date/heure localisé

**Critères d'acceptance:**
- [ ] 4 langues supportées
- [ ] Détection auto langue navigateur
- [ ] 100% du contenu traduit
- [ ] Tests de traduction

---

## 🟢 P3 - BASSE PRIORITÉ (Future)

### 14. Widget Navigateur (Extension)
**Estimation:** 8 jours  
**Objectif:** Extension Chrome/Firefox  
**Détails:**
- Extension navigateur officielle
- Affichage TrustiScore lors de visite Play Store
- Suggestions alternatives en temps réel
- Icône badge avec score
- Popup avec détails rapides

**Critères d'acceptance:**
- [ ] Extension Chrome publiée
- [ ] Extension Firefox publiée
- [ ] Overlay sur Play Store
- [ ] >1000 installations

---

### 15. API Publique TrustiScore
**Estimation:** 10 jours  
**Objectif:** Ouverture aux développeurs  
**Détails:**
- API REST publique documentée
- Authentification par clé API
- Rate limiting
- Documentation Swagger
- SDK JavaScript/Python
- Dashboard développeurs
- Pricing tiers (free, pro, enterprise)

**Critères d'acceptance:**
- [ ] API documentée (Swagger)
- [ ] Système d'API keys
- [ ] SDK publié sur npm
- [ ] 100+ développeurs inscrits

---

### 16. Application Mobile Native
**Estimation:** 20 jours  
**Objectif:** App iOS/Android natives  
**Détails:**
- Développement React Native ou Flutter
- Toutes les fonctionnalités web
- Notifications push natives
- Intégration store apps installées
- Scan automatique des apps installées
- Recommandations contextuelles

**Critères d'acceptance:**
- [ ] App iOS publiée (App Store)
- [ ] App Android publiée (Play Store)
- [ ] Scan apps installées fonctionnel
- [ ] >10k téléchargements

---

### 17. Mode Entreprise
**Estimation:** 15 jours  
**Objectif:** Dashboard pour organisations  
**Détails:**
- Gestion multi-utilisateurs
- Politique d'apps autorisées/interdites
- Rapports d'usage équipe
- Tableau de bord admin
- Gestion des licences
- Support prioritaire
- SSO/SAML

**Critères d'acceptance:**
- [ ] Interface admin complète
- [ ] Gestion utilisateurs/rôles
- [ ] Rapports exportables
- [ ] SSO implémenté

---

### 18. Intégration IA Conversationnelle
**Estimation:** 7 jours  
**Objectif:** Chatbot assistant TrustiScore  
**Détails:**
- Chatbot IA (GPT-4 ou open-source)
- Questions/réponses sur privacy
- Recommandations conversationnelles
- Explication des scores
- Support utilisateur automatisé

**Critères d'acceptance:**
- [ ] Chatbot fonctionnel
- [ ] Réponses pertinentes
- [ ] Intégré dans l'interface
- [ ] <2s temps de réponse

---

### 19. Programme de Bug Bounty
**Estimation:** 3 jours (setup)  
**Objectif:** Sécurité communautaire  
**Détails:**
- Programme de récompenses bugs
- Plateforme de soumission
- Grille de rémunération
- Hall of fame contributeurs
- Process de disclosure responsable

**Critères d'acceptance:**
- [ ] Plateforme configurée
- [ ] Règles publiées
- [ ] Budget alloué
- [ ] >10 chercheurs actifs

---

### 20. Partenariats & Intégrations
**Estimation:** Variable  
**Objectif:** Écosystème TrustiScore  
**Détails:**
- Partenariat avec Mozilla, EFF, CNIL
- Intégration dans autres apps privacy
- Badges TrustiScore pour développeurs
- Programme d'affiliation
- Intégration MDM entreprises

**Critères d'acceptance:**
- [ ] 3+ partenariats majeurs signés
- [ ] Badges intégrables publiés
- [ ] >50 intégrations tierces

---

## 📊 MÉTRIQUES DE SUCCÈS

### Objectifs Q1 2026
- [ ] 10 000 utilisateurs actifs mensuels
- [ ] 500+ apps avec TrustiScore
- [ ] Taux de rétention 30 jours > 40%
- [ ] 1000+ migrations effectuées
- [ ] NPS > 50

### Objectifs Q2 2026
- [ ] 50 000 utilisateurs actifs mensuels
- [ ] 2000+ apps avec TrustiScore
- [ ] Extension navigateur lancée
- [ ] API publique disponible
- [ ] Partenariat majeur signé

---

## 🔄 PROCESS DE PRIORISATION

**Critères d'évaluation:**
1. Impact utilisateur (1-5)
2. Effort de développement (1-5)
3. Valeur business (1-5)
4. Dépendances techniques
5. Feedback utilisateurs

**Review:** Hebdomadaire avec équipe produit  
**Mise à jour backlog:** Bi-hebdomadaire

---

## 📝 NOTES IMPORTANTES

- Ce backlog est vivant et doit être mis à jour régulièrement
- Les estimations sont indicatives (dev full-time)
- La priorité peut changer selon le feedback utilisateurs
- Chaque feature doit avoir des critères d'acceptance clairs
- Tests automatisés requis pour toutes les P0/P1

---

**Contact Product Owner:** [À définir]  
**Repository:** https://github.com/notsogeek87/trusti
