# Alertes de changement de note

**Pour qui :** les mainteneurs qui font évoluer le suivi des notes.
**Pourquoi :** une note peut changer après une réévaluation (rachat, nouvelle politique, nouvelle source). Trusti prévient les personnes qui utilisent l'app, ce qui donne aussi une raison de revenir après l'onboarding.

## Ce que voit l'utilisateur

| Où | Quoi |
|---|---|
| « Mes Apps » (web et APK) | Carte « N notes ont changé » : apps suivies dont la note a changé depuis la dernière visite, baisses d'abord. Toucher une ligne ouvre la fiche, « J'ai vu » masque la carte |
| Fiche d'une app | « Historique de la note » sous le détail de l'évaluation : date de chaque changement, ou « note inchangée depuis la première évaluation » |
| Notification Android | « Gmail baisse : C → D » (une app) ou « 3 de tes apps ont changé de note » (résumé). Toucher la notification d'une seule app ouvre sa fiche |
| Espace de stockage (APK) | Réglage « Changements de note », actif par défaut, à côté de « Suggestions d'alternatives » |

## Données

- Source : table `app_assessment_history` (une ligne par évaluation, avec `previous_grade`), alimentée par le dépôt `trustillm`. Aucune table ajoutée.
- API : `GET /api/apps?grade_changes_since=AAAA-MM-JJ` (catalogue entier, même réponse pour tous) et `gradeHistory` dans `GET /api/apps?assessment_for=:id`. Voir [l'API](../api/README.md).
- Vie privée : la liste des apps suivies ne quitte jamais l'appareil. Le tri entre « mes apps » et le reste se fait en local.

## Règles anti-bruit

- Premier passage (web comme Android) : tout ce que l'API renvoie est marqué comme vu. Personne ne reçoit d'un coup des mois de changements.
- Un changement est identifié par `appId:date:note` et n'est signalé qu'une fois.
- On relit 14 jours avant la dernière visite, car une évaluation peut être publiée quelques jours après sa date.
- Android : passage toutes les ~12 h avec réseau, notification seulement entre 9 h et 21 h, une seule notification par passage.

## Code

| Fichier | Rôle |
|---|---|
| `server/gradeChanges.js` | Logique pure côté serveur : `parseSince`, `collapseGradeChanges`, `buildGradeTimeline` |
| `server/database/service-postgres.js` | `getGradeChangesSince`, `getGradeHistoryForApp` |
| `src/utils/gradeChanges.js` | Logique pure côté appareil (changements à afficher, « J'ai vu ») et réglage |
| `src/hooks/useGradeChanges.js` | Chargement, état « vu », synchronisation vers le natif |
| `src/components/GradeChangesCard.jsx` | Carte de « Mes Apps » |
| `src/components/assessment/AssessmentDetail.jsx` | Historique dans la fiche |
| `android/.../GradeChangeWorker.java` | Tâche de fond et notification |
| `android/.../AlternativeNudgesPlugin.java` | `syncGradeAlerts({ enabled, apiUrl, apps })` |
| `tests/server/gradeChanges.test.js`, `tests/technical/gradeChanges.test.js` | Tests |

## Stockage local

- Web : `trusti_grade_changes_seen` (`{ seenAt, ack[] }`) et `trusti_grade_alerts_enabled`. Effacés par « Vider le stockage » (préfixe `trusti_`).
- Android : SharedPreferences `trusti_grade_alerts` (apps suivies, état vu).
