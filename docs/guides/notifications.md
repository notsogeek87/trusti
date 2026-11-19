# Notifications

**Pour qui :** les mainteneurs qui font évoluer les notifications ou publient des événements.
**Pourquoi :** Trusti prévient de ce qui touche les apps de « Mes Apps » (note qui change, fuite, rachat…) et accompagne les migrations, sans spammer et sans envoyer la liste des apps de la personne.

## Principe

- **Tout se décide sur l'appareil.** L'API publie des listes identiques pour tout le monde (événements, changements de note, apps notées D/E). Le téléphone les compare avec ses propres apps. Pas de Firebase, pas de compte, pas de serveur de push.
- **Un seul moteur Android** (`NotificationEngineWorker`, toutes les ~6 h, même Trusti fermé) choisit quoi envoyer, avec un budget commun à tous les types.
- **Une boîte de réception** (cloche du header, web et APK) garde tout l'historique, y compris ce qui n'a pas été poussé. Sur le web, c'est le seul canal.

## Ce que voit l'utilisateur

| Type | Déclencheur | Priorité | Canal Android | Boutons |
|---|---|---|---|---|
| Événement critique | Événement `negative` + `high` (fuite grave) d'une app suivie | 100, passe toujours | `events` (importance haute) | Voir les alternatives · Ne plus m'alerter pour cette app |
| Événement négatif | `negative` + `medium` / `low` | 80 / 50 | `events` | idem |
| Note en baisse | Changement de note (voir [Alertes de note](alertes-notes.md)) | 70 | `grade_changes` | Voir les alternatives · Ne plus m'alerter |
| App à risque installée | App notée D ou E installée depuis le passage précédent, pas dans « Mes Apps » | 60 | `risky_installs` | Voir les alternatives (ajoute l'app à « Mes Apps ») · Ignorer |
| Alternative installée | Alternative du parcours installée, app quittée encore là | 45 | `migrations` | Reprendre |
| Relance de migration | Parcours sans progrès depuis 5 jours (une fois par étape atteinte) | 40 | `migrations` | Reprendre |
| Migration terminée | Alternative installée **et** app quittée désinstallée | 35 | `migrations` | (ouvre la fiche) |
| Événement positif / note en hausse | `positive`, ou note qui monte | 30 | `events` / `grade_changes` | Voir |
| Événement neutre | `neutral` | 20 | `events` | Voir |
| Suggestion d'alternative | App C/D/E avec une alternative mieux notée (règles historiques : 3 jours après la 1re synchro, 1 par semaine, même app jamais deux fois en 30 jours) | 10 | `alternatives` | Voir l'alternative · Démarrer la migration · Ne plus proposer |
| Bilan mensuel | Mode bilan actif, tous les 30 jours, s'il y a quelque chose à dire | — | `digest` (importance basse) | (ouvre Trusti) |

Une migration vue terminée par le téléphone est aussi marquée comme faite dans « Mes Apps » au prochain lancement (toast « Migration terminée »).

## Règles anti-spam (`NotificationPolicy.java`)

- Une notification par passage au plus, entre 9 h et 21 h.
- Budget : **2 notifications par 7 jours glissants**, tous types confondus. Une alerte critique passe toujours, même budget épuisé ou mode bilan actif.
- Ce qui n'a pas été envoyé reste en attente et sera reproposé ; la boîte de réception le montre déjà.
- Premier passage de chaque source : tout ce qui existe déjà est marqué comme vu (pas de rafale).
- Un événement publié il y a plus de 30 jours n'est plus poussé.
- Apps en sourdine (bouton « Ne plus m'alerter ») : plus aucune notification les concernant. Réactivation dans Espace de stockage > Notifications.
- **Mode bilan mensuel** (désactivé par défaut) : tout ce qui n'est pas critique est compté dans un bilan envoyé 30 jours après l'activation, puis tous les 30 jours. Pas de bilan si rien ne s'est passé. Les suggestions d'alternatives sont coupées dans ce mode.

Le barème de priorité est dupliqué dans `src/utils/notificationInbox.js` (`PRIORITY`) et `NotificationPolicy.java` : les garder alignés.

## Événements

Table `app_events` (migration `server/database/migrations/2026-11-19-app-events.sql`, **à appliquer après validation**). API : [`/api/app-events`](../api/README.md#apiapp-events--apiapp-eventsjs).

| Champ | Valeurs |
|---|---|
| `type` | `incident` (fuite, faille, sanction), `acquisition`, `policy_change`, `jurisdiction_change`, `open_source`, `closed_source`, `audit`, `shutdown`, `other` |
| `impact` | `negative`, `neutral`, `positive` |
| `severity` | `low`, `medium`, `high` (`negative` + `high` = critique, poussé tout de suite) |
| `status` | `proposed` (par défaut), `published`, `rejected`. Seul `published` est public |
| `source_url` | https, obligatoire ; une même source n'est proposée qu'une fois par app |

Cycle de vie :

1. La veille (workflow n8n) propose : `POST /api/app-events` avec la clé `x-api-key`.
2. Validation humaine : `GET /api/app-events?status=proposed`, puis `PATCH /api/app-events` `{ id, status: 'published' | 'rejected' }` (ou `UPDATE` via le connecteur Trusti_DB).
3. À la publication, `published_at` est fixé : les téléphones le voient au passage suivant (~6 h), la fiche de l'app et la boîte de réception aussitôt (cache CDN 5 min).

Les textes des événements (titre, résumé) sont en français uniquement pour l'instant (pas encore dans `content_translations`).

## Données sur l'appareil

- Web (`localStorage`, préfixe `trusti_`) : `trusti_inbox_state` (éléments lus), `trusti_event_alerts_enabled`, `trusti_install_alerts_enabled`, `trusti_migration_reminders_enabled`, `trusti_notification_digest`, et `updatedAt` dans `trusti_migration_guides` (date du dernier progrès d'un parcours).
- Android (SharedPreferences) : `trusti_notifications` (réglages, migrations en cours, journal des envois, historique, sourdine, bilan, événements vus, apps D/E connues), plus `trusti_grade_alerts` et `trusti_alt_nudges` (état historique conservé).
- La liste des apps D/E est relue une fois par jour (`GET /api/apps?grade=D,E`, publique) ; la détection d'installation se fait avec `PackageManager`, limitée aux paquets du catalogue déclarés dans `<queries>`.

## Code

| Fichier | Rôle |
|---|---|
| `server/appEvents.js` | Validation et mise en forme des événements (pur, testé) |
| `server/database/postgres/app-events.js` | Lecture, proposition, publication |
| `api/app-events.js` | Route `/api/app-events` |
| `src/utils/notificationInbox.js` | Boîte de réception, bilan, priorités, données envoyées au natif (pur, testé) |
| `src/utils/notificationSettings.js` | Nouveaux réglages |
| `src/hooks/useNotificationCenter.js` | Chargement, état lu, synchronisation avec le moteur natif |
| `src/components/NotificationInboxPage.jsx`, `layout/Header.jsx` | Boîte de réception, cloche et badge |
| `src/components/AlternativeNudgesSection.jsx` | Réglages (Espace de stockage) |
| `src/components/assessment/AppEventsList.jsx` | Événements dans la fiche |
| `android/.../NotificationEngineWorker.java` | Moteur : sources, décision, envoi, bilan, canaux |
| `android/.../NotificationSources.java` | Événements, notes, installations, migrations, suggestions |
| `android/.../NotificationPolicy.java` | Règles (budget, priorités, heures, bilan), testées en JUnit |
| `android/.../NotificationStore.java` | État persistant, historique, réseau |
| `android/.../NotificationActionReceiver.java` | Boutons « Ne plus m'alerter », « Ignorer », « Ne plus proposer » |
| `android/.../AlternativeNudgesPlugin.java` | Pont web ↔ natif (`syncEngine`, `getNotificationState`, `consumeCompletedMigrations`, `unmuteAll`) |
| `tests/server/appEvents.test.js`, `tests/technical/notificationInbox.test.js`, `android/app/src/test/.../NotificationPolicyTest.java` | Tests |

`AlternativeNudgeWorker` et `GradeChangeWorker` ne font plus rien : ils restent pour que les tâches déjà programmées sur les téléphones (versions précédentes) puissent s'instancier, puis s'annuler. Le moteur annule aussi ces tâches au démarrage de Trusti.
