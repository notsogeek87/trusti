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
| Transférer vos données | Guide propre à l'app quittée et à l'alternative quand il existe, avec un lien « Aide officielle ». Sinon, conseils selon la catégorie |
| Quitter l'ancienne app | Conseils (suppression du compte, accès) et bouton de désinstallation sur Android natif |

« Terminer la migration » (actif une fois la dernière case cochée) ajoute l'app à « Mes Apps », la marque comme migrée et enregistre l'alternative choisie, via `importMigrations`. La progression est reprise là où elle s'est arrêtée à la réouverture.

## Code

| Fichier | Rôle |
|---|---|
| `src/constants/migrationGuide.js` | Étapes, conseils par catégorie, conseils de nettoyage |
| `src/constants/appMigrationGuides.js` | Guides par app (export de l'app quittée, import dans l'alternative), avec source officielle et date de vérification |
| `src/utils/migrationGuide.js` | Logique pure : `getDataTips`, `getMigrationCandidates`, `canStartMigration`, `computeProgress`, `getMigrationsInProgress` |
| `src/utils/migrationGuideStorage.js` | Lecture/écriture de la progression |
| `src/components/modals/MigrationGuideModal.jsx` | Interface du parcours |
| `src/components/modals/AppDetailModal.jsx` | Bouton de lancement depuis la fiche (prop `onCompleteMigration`) |
| `src/components/MigrationsInProgressCard.jsx` | Carte « Migrations en cours » de « Mes Apps » (prop `resumeMigration` de la fiche, état dans `App.jsx`) |
| `tests/technical/migrationGuide.test.js` | Tests de la logique pure |

## Données et vie privée

La progression est stockée **uniquement** dans le `localStorage`, clé `trusti_migration_guides`. Rien n'est envoyé au serveur. Elle est effacée par « Vider le stockage » (préfixe `trusti_`).

## Limites actuelles

- Textes en version unique.
- Guides par app pour une quinzaine d'apps quittées (WhatsApp, Telegram, Messenger, Facebook, Instagram, Gmail, Google Photos, Drive, Keep, YouTube, Chrome, LastPass, Dashlane, Google Authenticator, Evernote) et d'alternatives (Signal, Proton Mail, Infomaniak Mail, Tuta, Ente, kDrive, Pixelfed, Vivaldi, LibreTube, Bitwarden, KeePassXC, Passbolt, Proton Authenticator, Joplin). Les autres gardent les conseils par catégorie.
- Depuis « Mes Apps », les alternatives proposées viennent des apps déjà chargées du catalogue (comme le sélecteur d'alternative).

## Ajouter un guide par app

Dans `src/constants/appMigrationGuides.js`, clé = id de l'app dans la table `applications`. Vérifier chaque étape sur la page d'aide officielle de l'éditeur, la citer dans `source` et dater la vérification dans `checkedAt` :

```js
// Dans APP_IMPORT_GUIDES
'1769541460710': {
  tips: ['Sur mail.proton.me : Paramètres > Tous les paramètres > Importer via Easy Switch.'],
  directFrom: ['1769803097037'],   // Gmail : l'alternative importe seule
  directExport: ['Pas besoin d\'exporter : Proton se connecte à votre compte Gmail.'],
  source: 'https://proton.me/support/switch-from-gmail-to-proton',
  checkedAt: '2026-11-10',
},
```

Un test vérifie que chaque guide a des conseils, une source `https://` et une date.

## Exemple

Ajouter des conseils pour une catégorie (`DATA_TIPS`, le premier motif qui correspond gagne) :

```js
{
  match: ['podcast'],
  export: ['Exportez vos abonnements au format OPML.'],
  import: ['Importez le fichier OPML dans la nouvelle app.'],
}
```
