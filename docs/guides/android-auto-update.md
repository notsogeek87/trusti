# Mises à jour automatiques de l'app Android

**Pour qui / pourquoi** : mainteneurs de l'APK Trusti (`eu.trusti.app`) et
testeurs. Explique comment l'app détecte et installe les nouvelles releases
GitHub, et comment la numérotation de version doit rester cohérente pour que
ça continue de fonctionner.

## Principe

- Les APK stables GitHub utilisent la variante `githubRelease` avec une clé de
  publication dédiée et l’updater actif (`BuildConfig.UPDATER_ENABLED = true`).
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

Le workflow construit `assembleGithubRelease` et vérifie la signature de
l’APK avec `apksigner` avant la publication. L’empreinte SHA-256 du certificat
figure dans les notes de version. Les pré-releases de test gardent la
signature debug. Google Play utilise son workflow de publication dédié.

### Migration depuis la clé debug

Cette procédure concerne les installations issues des anciens APK GitHub
signés avec la clé debug. Android exige une réinstallation au changement de
certificat. Si vous avez installé Trusti depuis Google Play, continuez à
mettre à jour l’application depuis le Play Store.

1. Dans Trusti, ouvrez **Paramètres → Espace de stockage → Exporter / importer
   mes données**, puis exportez vos données et conservez le fichier en dehors
   de l’application.
2. Désinstallez Trusti et installez l’APK de la nouvelle release stable sur
   [GitHub](https://github.com/notsogeek87/trusti/releases/latest).
3. Importez le fichier de sauvegarde depuis le même écran. Les prochaines
   mises à jour GitHub signées avec la clé de publication s’installent par-dessus
   cette version.

### Configuration de la clé de publication

Avant la première publication signée, créez un keystore PKCS12 dédié hors du
dépôt et archivez le fichier et son mot de passe dans votre gestionnaire de
mots de passe.

```sh
keytool -genkeypair -keystore trusti-github.p12 -storetype PKCS12 -alias trusti-github -keyalg RSA -keysize 4096 -validity 36500 -dname "CN=Trusti GitHub, O=Lielu, C=FR"
```

Renseignez ces [secrets GitHub Actions](https://github.com/notsogeek87/trusti/settings/secrets/actions).

| Secret | Valeur |
| --- | --- |
| `GITHUB_APK_KEYSTORE_BASE64` | Contenu du keystore encodé en Base64 sur une ligne |
| `GITHUB_APK_KEYSTORE_PASSWORD` | Mot de passe du keystore |
| `GITHUB_APK_KEY_ALIAS` | `trusti-github` |
| `GITHUB_APK_KEY_PASSWORD` | Même mot de passe pour ce keystore PKCS12 |

Définissez la [variable GitHub Actions](https://github.com/notsogeek87/trusti/settings/variables/actions)
`GITHUB_APK_CERT_SHA256` à l’empreinte SHA-256 affichée par la commande ci-dessous.
La CI bloque si la configuration manque ou si le certificat diffère.

```sh
keytool -list -v -keystore trusti-github.p12 -alias trusti-github
```
