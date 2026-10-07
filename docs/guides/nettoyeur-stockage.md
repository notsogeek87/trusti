# Nettoyeur de stockage

Section « Nettoyer le stockage » de la page **Espace de stockage** (app Android native
uniquement), inspirée du SystemCleaner de [SD Maid SE](https://github.com/d4rken-org/sdmaid-se).

## Fonctionnement

1. L'utilisateur autorise « Accès à tous les fichiers » (écran système Android).
2. **Analyser** parcourt le stockage partagé et liste, par catégorie, nombre d'éléments et taille. Rien n'est supprimé.
3. Il coche les catégories, puis **Nettoyer** (confirmation en deux temps).

## Catégories (`src/cleaner/filters.js`)

| Id | Cible | Coché par défaut |
|---|---|---|
| `incomplete-downloads` | `.crdownload`, `.part`… (> 1 jour) | oui |
| `temp-files` | `.tmp`, `.temp` (> 7 jours) | oui |
| `orphan-thumbnails` | dossiers `.thumbnails` | oui |
| `whatsapp-statuses` | statuts WhatsApp en cache (> 30 jours) | oui |
| `old-apks` | APK de `Download/` (> 30 jours) | non |
| `ota-leftovers` | `update*.zip` / `ota*.zip` de `Download/` (> 30 jours) | non |
| `logs-and-reports` | `.log`, `.trace`, `bugreports/` (> 30 jours) | non |
| `empty-directories` | dossiers vides (> 30 jours) | non |

Ajouter une catégorie = ajouter un objet dans `CLEANER_FILTERS` (la sémantique des règles est
documentée en tête du fichier) + un cas dans `tests/cleaner/filters.test.js`. La liste est envoyée
telle quelle au plugin natif ; `matchesFilter` (JS) et `matches` (`SystemCleanerPlugin.java`)
implémentent la même logique et doivent rester alignés.

## Garde-fous

- Le JS n'envoie **aucun chemin** à la suppression, seulement des ids de catégories : le plugin ne supprime que ce que le dernier scan a trouvé, et seulement si le fichier n'a pas changé depuis.
- `Android/data`, `Android/obb` et les liens symboliques ne sont jamais parcourus ; les règles globales ignorent `Android/`.
- Les dossiers sont supprimés par `File.delete()`, qui refuse un dossier non vide.

## Permission et distribution

`MANAGE_EXTERNAL_STORAGE` est déclarée dans le manifeste principal (APK des releases GitHub) et
**retirée du build Play Store** (`android/app/src/release/AndroidManifest.xml`), où Google la
restreint. Sur ce build, ou sous Android 11, la section est masquée. Aucune donnée ne quitte
l'appareil.

## Tests

`npm test` (inclut `tests/cleaner/`). Le plugin Java n'est pas couvert par des tests automatisés ;
à vérifier à la main sur un appareil (Android 11+).
