# Migration guidée

**Pour qui :** les mainteneurs qui veulent faire évoluer le parcours.
**Pourquoi :** Trusti ne se contente pas de signaler une app mal notée, il accompagne son remplacement par une alternative mieux notée.

## Ce que voit l'utilisateur

Deux points d'entrée, pour une app notée **C, D ou E** qui a au moins une alternative de meilleur grade :

- dans sa fiche, le bloc « Alternatives » affiche un bouton **Migrer pas à pas** ;
- dans « Mes Apps », la carte « Migrations en cours » liste les parcours commencés et pas terminés. « Reprendre » rouvre la fiche avec le parcours, à l'étape où il s'était arrêté.

Le lien ouvre un parcours en quatre étapes :

| Étape | Contenu |
|---|---|
| Choisir l'alternative | Liste des alternatives de meilleur grade, la recommandée en premier (`pickBestAlternative`) |
| Installer la nouvelle app | Liens Play Store / F-Droid / site officiel. Sur Android natif, l'installation est constatée automatiquement |
| Transférer vos données | Deux blocs, « Récupérer vos données de X » puis « Les mettre dans Y ». Quand un guide propre à l'app existe : résumé « En bref », étapes numérotées et encadré « À savoir », de quoi suivre sans quitter Trusti ; la source officielle est en petit en pied de bloc. Sinon, conseils selon la catégorie |
| Quitter l'ancienne app | Conseils (suppression du compte, accès) et bouton de désinstallation sur Android natif |

« Terminer la migration » (actif une fois la dernière case cochée) ajoute l'app à « Mes Apps », la marque comme migrée et enregistre l'alternative choisie, via `importMigrations`. La progression est reprise là où elle s'est arrêtée à la réouverture.

## Code

| Fichier | Rôle |
|---|---|
| `src/constants/migrationGuide.js` | Étapes, conseils par catégorie, conseils de nettoyage |
| Table `app_migration_guides` | Guides par app (export de l'app quittée, import dans l'alternative), avec source officielle, date et statut de vérification |
| `server/migrationGuides.js` | Mise en forme pour l'API (`buildTransferGuide`, import direct) |
| `src/hooks/useMigrationGuide.js` | Chargement du guide (`GET /api/apps?migration_guide_from=…&migration_guide_to=…`, cache 1 h) |
| `src/utils/migrationGuide.js` | Logique pure : `getDataTips`, `getMigrationCandidates`, `canStartMigration`, `computeProgress`, `getMigrationsInProgress` |
| `src/utils/migrationGuideStorage.js` | Lecture/écriture de la progression |
| `src/components/modals/MigrationGuideModal.jsx` | Interface du parcours |
| `src/components/modals/AppDetailModal.jsx` | Bouton de lancement depuis la fiche (prop `onCompleteMigration`) |
| `src/components/MigrationsInProgressCard.jsx` | Carte « Migrations en cours » de « Mes Apps » (prop `resumeMigration` de la fiche, état dans `src/hooks/useAppDetail.js`) |
| `tests/technical/migrationGuide.test.js` | Tests de la logique pure |

## Données et vie privée

La progression est stockée **uniquement** dans le `localStorage`, clé `trusti_migration_guides`. Rien n'est envoyé au serveur. Elle est effacée par « Vider le stockage » (préfixe `trusti_`).

## Limites actuelles

- Textes en version unique.
- Guides par app (en base) pour une quinzaine d'apps quittées (WhatsApp, Telegram, Messenger, Facebook, Instagram, Gmail, Google Photos, Drive, Keep, YouTube, Chrome, LastPass, Dashlane, Google Authenticator, Evernote) et d'alternatives (Signal, Proton Mail, Infomaniak Mail, Tuta, Ente, kDrive, Pixelfed, Vivaldi, LibreTube, Bitwarden, KeePassXC, Passbolt, Proton Authenticator, Joplin). Les autres gardent les conseils par catégorie.
- Depuis « Mes Apps », les alternatives proposées viennent des apps déjà chargées du catalogue (comme le sélecteur d'alternative).

## Les guides par app sont en base

Les textes sont dans la table `app_migration_guides` (Neon, base `trusti-db`), une ligne par app et par sens (`export` pour l'app quittée, `import` pour l'alternative). Une correction est visible tout de suite sur le web **et dans l'APK, sans nouvelle version** : l'app les charge à l'étape « Transférer vos données » (cache 1 h). Hors connexion et sans cache, l'étape affiche les conseils par catégorie.

| Colonne | Contenu |
|---|---|
| `app_id`, `direction` | Clé : id de l'app (table `applications`) et `export` ou `import` |
| `summary` | « En bref » : ce qui est repris, où, combien de temps |
| `steps` | Étapes numérotées (tableau JSON de textes), menus exacts |
| `notes` | Tableau JSON. Chaque note est un texte (encadré ambre « À savoir ») ou `{"text": "…", "level": "danger"}` (encadré rouge « Attention ») pour un vrai risque : mots de passe en clair, perte d'accès à un compte |
| `direct_from`, `direct_export` | (import) apps depuis lesquelles l'alternative importe seule ; l'export est alors remplacé par la phrase `direct_export` |
| `source_url`, `checked_at` | Page d'aide officielle et date de vérification |
| `verified` | `true` seulement si chaque étape a été relue sur `source_url` |

Le guide doit se suffire à lui-même : l'utilisateur ne devrait pas avoir à ouvrir la source.

### Mise en forme des textes

`summary`, `steps`, `notes` et `direct_export` acceptent un **Markdown limité**, rendu par `src/components/ui/RichText.jsx` (`react-markdown`, règles dans `src/utils/richText.js`) :

| Écrire en base | Rendu | Usage |
|---|---|---|
| `**Paramètres > Exporter**` | gras | noms de menus et de boutons à repérer à l'écran |
| `*facultatif*` | italique | nuance |
| `` `subscriptions.csv` `` | code | noms de fichiers, adresses internes (`vivaldi://…`) |
| `[takeout.google.com](https://takeout.google.com)` | lien | adresse à ouvrir ; **https uniquement**, les autres liens sont neutralisés |

Tout le reste est ignoré (seul le texte est gardé) : titres, images, tableaux, listes, citations. Le HTML est supprimé, jamais interprété. Les couleurs ne s'écrivent pas en base : elles dépendent du champ (résumé, étape) et du niveau des notes (`info`, `danger`). Tests : `tests/technical/richText.test.js`.

Corriger une étape :

```sql
UPDATE app_migration_guides
SET steps = jsonb_set(steps, '{1}', to_jsonb('Touchez **⋮** > **Plus > Exporter la discussion**.'::text)),
    checked_at = CURRENT_DATE, verified = true, updated_at = now()
WHERE app_id = '1769879213451' AND direction = 'export';
```

Ajouter un guide :

```sql
INSERT INTO app_migration_guides (app_id, direction, summary, steps, notes, source_url, checked_at, verified)
VALUES ('mastodon', 'import', 'En bref…',
        '["Étape 1 : **Paramètres > Importer**", "Étape 2"]',
        '["À savoir", {"text": "Supprimez le fichier : il est en clair.", "level": "danger"}]',
        'https://docs.joinmastodon.org/…', CURRENT_DATE, true);
```

Création de la table (idempotent) : `npm run db:add-migration-guides`. Les 29 guides de départ ont été insérés le 2026-11-10 ; 10 étaient marqués `verified` (page officielle relue). Les 19 autres ont été relus le même jour sur leurs pages officielles et corrigés sur validation de David (17 corrigés, 2 exacts) : tous les guides sont maintenant `verified`. Erreurs notables corrigées : Pixelfed attend l'archive Instagram en ZIP sans la décompresser (300 publications par import), source de Signal remplacée (page WhatsApp), import Tuta réservé aux offres Legend et Unlimited, source de l'export Chrome remplacée (page Vivaldi). Evernote et Dashlane bloquent la lecture automatique : vérifiés sur les extraits de leurs pages officielles. Pour trouver un guide à revoir : `SELECT app_id, direction, source_url, checked_at FROM app_migration_guides WHERE NOT verified OR checked_at < now() - interval '6 months';`.

## Exemple

Ajouter des conseils pour une catégorie (`DATA_TIPS`, le premier motif qui correspond gagne) :

```js
{
  match: ['podcast'],
  export: ['Exportez vos abonnements au format OPML.'],
  import: ['Importez le fichier OPML dans la nouvelle app.'],
}
```
