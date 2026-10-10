# Backlog Trusti

Idées de features à reprendre plus tard. Chaque entrée est une proposition, pas un engagement.
Statut : 💡 idée · 📝 à cadrer · 🚧 en cours · ✅ fait

## Features

| # | Feature | Priorité | Effort | Statut |
|---|---------|----------|--------|--------|
| 1 | Migration guidée vers une alternative | Haute | Moyen | 🚧 MVP fait (voir [guide](guides/migration-guidee.md)) |
| 2 | Alertes et suivi des notes dans le temps | Haute | Moyen–élevé | 💡 |
| 3 | Détail du score par critères sourcés | Haute | Moyen | 💡 |
| 4 | Contribution communautaire | Moyenne | Moyen | 💡 |
| 5 | Mode hors-ligne partiel | Moyenne | Moyen | 💡 |
| 6 | Portage (extension navigateur, iOS, services web) | Basse | Élevé | 💡 |
| 7 | Partage et gamification du bilan | Basse | Faible | 💡 |

### 1. Migration guidée
**MVP livré** : parcours en 4 étapes depuis la fiche d'une app C/D/E. Point d'entrée « Mes Apps » ajouté. Reste à faire : guides d'export par app, suivi des migrations en cours.

Pour une app notée D/E installée, proposer pas à pas le passage à l'alternative A/B :
lien de téléchargement, guide d'export des données, désinstallation (permission
`REQUEST_DELETE_PACKAGES` déjà déclarée), checklist de migration sauvegardée.
Prolonge le scan Android, la carte bilan et les alternatives existantes.

### 2. Alertes et suivi dans le temps
Notification quand la note d'une app installée change ou en cas d'incident (fuite,
changement de politique, rachat). Historique des notes par app. Canaux : email (Brevo)
et push Android. Donne une raison de revenir dans l'app après l'onboarding.

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

## Dette technique

- [ ] Découper `src/App.jsx` (~630 lignes) et `server/index.js` (~740 lignes)
- [ ] Nettoyer les scripts `test-*.js`, `fix-icons-*` et logs à la racine
- [ ] Étendre les tests au-delà de `tests/technical`
- [ ] Resynchroniser le README (scripts `db:init`, `db:backup` absents de `package.json`)
- [ ] Vérifier la présence de `android/app/debug.keystore` dans le dépôt
