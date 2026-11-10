# Backlog Trusti

Idées de features à reprendre plus tard. Chaque entrée est une proposition, pas un engagement.
Statut : 💡 idée · 📝 à cadrer · 🚧 en cours · ✅ fait

## Features

| # | Feature | Priorité | Effort | Statut |
|---|---------|----------|--------|--------|
| 1 | Migration guidée vers une alternative | Haute | Moyen | 🚧 MVP + guides par app faits (voir [guide](guides/migration-guidee.md)) |
| 2 | Alertes et suivi des notes dans le temps | Haute | Moyen–élevé | 🚧 Changements de note faits (voir [guide](guides/alertes-notes.md)) |
| 3 | Détail du score par critères sourcés | Haute | Moyen | 💡 |
| 4 | Contribution communautaire | Moyenne | Moyen | 💡 |
| 5 | Mode hors-ligne partiel | Moyenne | Moyen | 💡 |
| 6 | Portage (extension navigateur, iOS, services web) | Basse | Élevé | 💡 |
| 7 | Partage et gamification du bilan | Basse | Faible | 💡 |
| 8 | Évaluer le parc applicatif d'une organisation | Haute | Moyen | 🚧 MVP fait (voir [guide](guides/evaluation-organisation.md)) |
| 9 | Créer mon organisation : kit numérique de démarrage | Haute | Moyen | 🚧 V1 faite (voir [guide](guides/evaluation-organisation.md#assistant--créer-mon-organisation--v1)) |

### 1. Migration guidée
**MVP livré** : parcours en 4 étapes depuis la fiche d'une app C/D/E. Guides d'export/import par app vérifiés aux sources officielles (une quinzaine d'apps de chaque côté), carte « Migrations en cours » dans « Mes Apps ». Les guides sont en base (`app_migration_guides`) : corrigés sans nouvelle version de l'APK. Reste à faire : vérifier les 19 guides `verified = false`, couvrir les alternatives recommandées manquantes (Mastodon, Proton Drive, PeerTube, Google Maps vers OsmAnd/Organic Maps, export TikTok et Snapchat).

Pour une app notée D/E installée, proposer pas à pas le passage à l'alternative A/B :
lien de téléchargement, guide d'export des données, désinstallation (permission
`REQUEST_DELETE_PACKAGES` déjà déclarée), checklist de migration sauvegardée.
Prolonge le scan Android, la carte bilan et les alternatives existantes.

### 2. Alertes et suivi dans le temps
**Premier volet livré (Android)** : suggestions d'alternatives par notification locale. Une tâche
WorkManager (`AlternativeNudgeWorker`, toutes les ~8 h, même Trusti fermé) propose au plus une app
C/D/E par semaine (10 h–20 h, 3 jours après la première synchro, même app jamais deux fois en 30 jours)
dont l'alternative est mieux notée ; candidates calculées sur le téléphone
(`src/utils/alternativeNudges.js`), action « Ne plus proposer », réglage dans « Espace de stockage ».
**Deuxième volet livré** : alertes de changement de note (carte « Notes mises à jour » dans « Mes Apps », historique dans la fiche, notification Android), à partir de `app_assessment_history`.
Reste à faire : alertes d'incident (fuite, rachat) indépendantes d'un changement de note.
Notification quand la note d'une app installée change ou en cas d'incident (fuite,
changement de politique, rachat). Historique des notes par app. Canal : push Android
(plus d'e-mail : la connexion a été supprimée). Donne une raison de revenir dans l'app après l'onboarding.

### 3. Détail du score par critères
Décomposer le score : juridiction, open source, trackers, permissions, modèle
économique, audits. Afficher la source et la date de dernière vérification de chaque
critère. Peut s'appuyer sur l'analyse technique (`TechnicalAnalysisPlugin`,
`docs/architecture/technical-analysis.md`). Renforce la crédibilité d'un catalogue
aujourd'hui centralisé.

### 4. Contribution communautaire
Suggestion d'apps ou d'alternatives, signalement de note erronée, file de modération
côté admin. Réduit la maintenance manuelle du catalogue (scripts ponctuels à la racine).

### 5. Mode hors-ligne partiel
Cache local du catalogue (IndexedDB ou fichier généré) pour consulter le scan sans
réseau. Réduit la dépendance à Vercel/Neon, cohérent avec l'argument souveraineté.

### 6. Portage
Extension navigateur (note du site visité), version iOS, scanner de services web
(comptes Google, Meta…). iOS limité par la visibilité sur les trackers.

### 7. Partage et gamification
Carte de partage du bilan (« score B, 3 apps remplacées »), badges et progression.
S'appuie sur `ShareButton` et `TrustiShareModal`.

### 8. Évaluer le parc applicatif d'une organisation
**MVP livré** (page `?organisation`, web) : sélection des outils par famille de besoins parmi les
apps « usage pro », criticité par outil, note pondérée, indicateurs, plan d'action, exports CSV et
JSON, tout en local, lien depuis la page d'accueil, rapport PDF téléchargeable, profils
d'organisation, suggestions d'outils manquants. Reste à faire : comparaison
dans le temps, alerte automatique sur les suggestions, alternatives choisies
(`app_relations`) aussi dans l'app principale.

## Dette technique

- [x] Découper `server/index.js` (modules `server/*.js`)
- [x] Découper `src/App.jsx` : état dans des hooks (`useOnboardingFlow`, `useMyAppsView`, `useAppDetail`, `useShareLinks`, `useBackNavigation`), en-têtes d'onglets et écrans en composants
- [x] Découper `src/hooks/useAppManagement.js` : choix de l'utilisateur (`useUserSelections`), catalogue paginé (`useCatalogApps`), palmarès / « Mes Apps » / recherche (`useRemoteAppLists`), liste affichée en fonctions pures testées (`utils/appListing.js`)
- [ ] Découper `server/database/service-postgres.js` (~1400 lignes) par domaine
- [ ] Nettoyer les scripts `test-*.js`, `fix-icons-*` et logs à la racine
- [ ] Étendre les tests au-delà de `tests/technical`
- [ ] Resynchroniser le README (scripts `db:init`, `db:backup` absents de `package.json`)
- [ ] Vérifier la présence de `android/app/debug.keystore` dans le dépôt

### 9. Créer mon organisation
**V1 livrée** : assistant en 3 questions (associations et petites entreprises), kits choisis à la
main, Trusti Score projeté, enregistrement dans « Évaluer mon organisation ». Reste à faire :
questions sur les données sensibles (santé, mineurs) et les compétences techniques, variantes
par besoin, plan de mise en place exportable en PDF, autres types de structure (collectivités,
santé, enseignement), infos de coût et d'hébergement en base plutôt que dans les kits.
