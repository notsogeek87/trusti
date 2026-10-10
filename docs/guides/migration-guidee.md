# Migration guidée

**Pour qui :** les mainteneurs qui veulent faire évoluer le parcours.
**Pourquoi :** Trusti ne se contente pas de signaler une app mal notée, il accompagne son remplacement par une alternative mieux notée.

## Ce que voit l'utilisateur

Deux points d'entrée, pour une app notée **C, D ou E** qui a au moins une alternative de meilleur grade :

- dans sa fiche, le bloc « Alternatives » affiche un bouton **Migrer pas à pas** ;
- dans « Mes Apps », la carte de l'app affiche le même lien sous son alternative, tant que celle-ci n'est pas adoptée.

Le lien ouvre un parcours en quatre étapes :

| Étape | Contenu |
|---|---|
| Choisir l'alternative | Liste des alternatives de meilleur grade, la recommandée en premier (`pickBestAlternative`) |
| Installer la nouvelle app | Liens Play Store / F-Droid / site officiel. Sur Android natif, l'installation est constatée automatiquement |
| Transférer vos données | Conseils d'export et d'import selon la catégorie de l'app remplacée |
| Quitter l'ancienne app | Conseils (suppression du compte, accès) et bouton de désinstallation sur Android natif |

« Terminer la migration » (actif une fois la dernière case cochée) ajoute l'app à « Mes Apps », la marque comme migrée et enregistre l'alternative choisie, via `importMigrations`. La progression est reprise là où elle s'est arrêtée à la réouverture.

## Code

| Fichier | Rôle |
|---|---|
| `src/constants/migrationGuide.js` | Étapes, conseils par catégorie, conseils de nettoyage |
| `src/utils/migrationGuide.js` | Logique pure : `getDataTips`, `getMigrationCandidates`, `canStartMigration`, `computeProgress` |
| `src/utils/migrationGuideStorage.js` | Lecture/écriture de la progression |
| `src/components/modals/MigrationGuideModal.jsx` | Interface du parcours |
| `src/components/modals/AppDetailModal.jsx` | Bouton de lancement depuis la fiche (prop `onCompleteMigration`) |
| `src/components/AppCard.jsx` | Lien de lancement depuis « Mes Apps » (prop `onStartMigration`, état dans `App.jsx`) |
| `tests/technical/migrationGuide.test.js` | Tests de la logique pure |

## Données et vie privée

La progression est stockée **uniquement** dans le `localStorage`, clé `trusti_migration_guides`. Rien n'est envoyé au serveur. Elle est effacée par « Vider le stockage » (préfixe `trusti_`).

## Limites actuelles

- Textes en version unique.
- Conseils d'export génériques par catégorie, pas de guide propre à chaque app.
- Depuis « Mes Apps », les alternatives proposées viennent des apps déjà chargées du catalogue (comme le sélecteur d'alternative).

## Exemple

Ajouter des conseils pour une catégorie (`DATA_TIPS`, le premier motif qui correspond gagne) :

```js
{
  match: ['podcast'],
  export: ['Exportez vos abonnements au format OPML.'],
  import: ['Importez le fichier OPML dans la nouvelle app.'],
}
```
