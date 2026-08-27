# App Android native — scan automatique des apps installées

Trusti reste un site web (React + Vite, servi sur Vercel). L'app Android
([Capacitor](https://capacitorjs.com), `capacitor.config.json`, `android/`,
CI `.github/workflows/android.yml`) qui empaquette ce même site en APK existe
déjà. Ce document décrit la couche ajoutée **par-dessus cet empaquetage**
pour que l'onboarding, une fois dans l'app Android, scanne les apps
installées sur le téléphone au lieu de demander une sélection manuelle.

**Le mode web n'est pas affecté** : `OnboardingApps.jsx` (sélection manuelle
par étapes) reste utilisé partout sauf dans l'app Android empaquetée. Le
choix se fait à l'exécution via `src/utils/platform.js` (`isNativeAndroid`),
donc le même bundle web sert les deux — pas de build séparé à maintenir côté
front.

## Pourquoi Android uniquement

- Un navigateur (même en PWA) n'a aucune API pour lister les apps installées.
- iOS sandboxe totalement cette information — pas d'équivalent possible.
- Sur Android, ce n'est possible qu'en code natif, via `PackageManager`.

## Comment on évite `QUERY_ALL_PACKAGES`

Depuis Android 11, lister *toutes* les apps du téléphone nécessite la
permission `QUERY_ALL_PACKAGES`, très restreinte par Google Play (review
manuelle, justification stricte, souvent refusée pour ce cas d'usage).

On contourne ça : au lieu d'énumérer tout le téléphone, on ne demande la
visibilité que sur les apps **déjà connues du catalogue Trusti**, via la
balise manifest [`<queries>`](https://developer.android.com/training/package-visibility/declaring).
Le plugin natif se contente ensuite de tester, un par un, si chacun de ces
paquets connus est installé (`PackageManager.getPackageInfo`). Aucune
permission spéciale requise, et c'est plus respectueux de la vie privée :
Trusti ne voit jamais la liste complète des apps du téléphone, seulement
l'intersection avec son propre catalogue.

## Architecture

```
android/                                  Projet Android natif (Capacitor)
  app/src/main/
    AndroidManifest.xml                   Bloc <queries> généré (marqueurs TRUSTI_CATALOG_START/END)
    res/values/trusti_catalog.xml         string-array des package names connus (généré)
    java/com/trusti/app/
      MainActivity.java                   Enregistre InstalledAppsPlugin
      InstalledAppsPlugin.java            Plugin Capacitor : getInstalledPackages()

scripts/generate-android-catalog.js       Génère les 2 fichiers ci-dessus depuis la DB (ou apps.json en secours)

src/
  utils/apiConfig.js                      API_URL — bascule sur l'URL Vercel absolue en natif (pas de backend co-localisé dans l'APK)
  utils/platform.js                       isNativeAndroid (Capacitor.isNativePlatform() && platform === 'android')
  native/InstalledApps.js                 Wrapper JS du plugin Capacitor
  components/OnboardingAppsNative.jsx     Onboarding "scan auto" (Android natif)
  components/OnboardingApps.jsx           Onboarding "sélection manuelle" (web, inchangé)

capacitor.config.json                     appId com.trusti.app, appName TrustiScore, webDir dist
```

Flow de `OnboardingAppsNative.jsx` :
1. Récupère tout le catalogue onboarding (`GET /api/apps?onboarding=true`) et,
   en parallèle, la liste des paquets installés via le plugin natif.
2. Fait l'intersection par package name (extrait de `playStoreUrl`, ex.
   `id=org.thoughtcrime.securesms`).
3. Affiche les apps trouvées, pré-cochées, modifiables par l'utilisateur avant
   validation (jamais d'ajout silencieux).
4. Un lien permet de basculer sur la sélection manuelle classique
   (`OnboardingApps.jsx`) si le scan ne trouve rien ou échoue.

## Workflow de développement

```bash
# Régénère le catalogue de paquets connus (nécessite DATABASE_URL, sinon
# bascule sur server/database/data/apps.json en secours), build le web,
# puis sync vers le projet Android — c'est ce que lance aussi la CI.
npm run cap:sync

# Ouvrir dans Android Studio pour builder/lancer sur device ou émulateur
npm run android:open
```

À relancer après toute mise à jour significative du catalogue d'apps (nouvelle
app ajoutée), sinon elle ne sera simplement pas détectable par le scan tant
que l'APK n'est pas reconstruit.

## Notes Play Store

- Même sans `QUERY_ALL_PACKAGES`, Google Play peut demander une justification
  pour un usage massif de `<queries>` — garder le formulaire de déclaration
  Play Console à jour si le catalogue grossit beaucoup.
- `appId` actuel : `com.trusti.app` (à changer dans `capacitor.config.json`
  + `android/app/build.gradle` si un autre identifiant est souhaité avant la
  première publication — il ne peut plus être changé après).
