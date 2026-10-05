# Mises à jour automatiques de l'app Android

**Pour qui / pourquoi** : mainteneurs de l'APK Trusti (`eu.trusti.app`) et
testeurs. Explique comment l'app détecte et installe les nouvelles releases
GitHub, et comment la numérotation de version doit rester cohérente pour que
ça continue de fonctionner.

## Principe

- Les APK des releases GitHub sont des **builds debug** : l'updater y est actif
  (`BuildConfig.UPDATER_ENABLED = true`).
- Les builds **release** (AAB Play Store) n'ont **pas** d'updater, et la
  permission `REQUEST_INSTALL_PACKAGES` (restreinte par Google Play) en est
  retirée (`android/app/src/release/AndroidManifest.xml`). Voir
  [Publication Play Store](play-store-publishing.md).
- La bibliothèque [`lielugit-updater`](../../android/libs/lielugit-maven) 1.0.0
  est vendorée dans un dépôt Maven local (aucun jeton requis).

## Comportement côté utilisateur

1. À chaque ouverture de l'app (`ON_START`), une vérification est forcée.
2. Si une version plus récente existe, une fenêtre Compose (`UpdatePrompt`)
   s'affiche par-dessus la WebView : « Installer » → téléchargement →
   autorisation Android « installer des applications » si besoin →
   « Mettre à jour ». Les données sont conservées.
3. Recherche manuelle : **Paramètres → « Espace de stockage » →
   « Rechercher une mise à jour »**.

## Pont JavaScript

```js
import AppUpdate from './native/AppUpdate';

const res = await AppUpdate.checkForUpdate();
// { status, currentVersion, version?, message? }
// status : 'available' | 'upToDate' | 'busy' | 'disabled' | 'error'
```

Implémenté par `AppUpdatePlugin.kt` (plugin Capacitor `AppUpdate`), enregistré
dans `MainActivity`. Disponible uniquement dans l'app Android native.

## Règles de versionnement (à ne pas casser)

| Élément | Valeur |
| --- | --- |
| `versionCode` | `BUILD_NUMBER` (= `github.run_number` en CI, `1` en local) |
| `versionName` | `<appVersionBase>.<BUILD_NUMBER>` (ex. `1.0.152`) |
| `appVersionBase` | `android/gradle.properties` (actuellement `1.0`) |
| Tag de release | `v<versionName>` (ex. `v1.0.152`) |

Le tag **doit** suivre exactement ce format : un tag du type `v1.0-25` serait
lu comme une pré-version inférieure à `1.0` et plus aucune mise à jour ne
serait proposée. `versionCode` et le tag doivent croître à chaque build.
Pour changer de version majeure/mineure, modifier `appVersionBase`.

## Release GitHub

Sur `main`, `.github/workflows/android.yml` publie une release permanente
(`--latest`) dont les notes décrivent l'installation (mise à jour depuis
l'app, ou première installation manuelle de l'APK).

L'APK reste signé avec la clé debug : même `applicationId` et même clé pour
toutes les releases, condition nécessaire pour qu'Android accepte la mise à
jour par-dessus l'installation existante.
