# Partage d'une fiche app

Bouton **Partager** (icône en haut de la fiche détail) → menu de partage natif
(APK : `@capacitor/share`, web : Web Share API, sinon copie dans le presse-papiers).

## Lien partagé

`https://trusti.lielu.eu/?app=<id>` — construit par `src/utils/appShareLink.js`.

- **Web** : au chargement, `App.jsx` lit `?app=`, charge l'app via
  `GET /api/apps?ids=<id>`, ouvre sa fiche puis nettoie l'URL.
- **APK** : le WebView tourne sur `https://localhost`, donc les liens sont
  toujours construits sur `https://trusti.lielu.eu` (corrige aussi les liens
  `?apps=`/`?mig=` qui pointaient vers localhost). Un lien `trusti.lielu.eu/`
  ouvert sur le téléphone lance Trusti (App Links, `AndroidManifest.xml`) ;
  `App.jsx` le lit via `CapacitorApp.getLaunchUrl()` / `appUrlOpen`.

## Vérification App Links

`public/.well-known/assetlinks.json` (servi sur
`https://trusti.lielu.eu/.well-known/assetlinks.json`) liste les empreintes
SHA-256 des clés autorisées. Seule la clé **debug** committée (APK des
releases GitHub) y figure.

**À faire pour la version Play Store** : ajouter l'empreinte SHA-256 de la clé
de signature d'application Google (Play Console → Intégrité de l'app →
Signature d'application) dans `sha256_cert_fingerprints`. Sans elle, le lien
s'ouvre dans le navigateur (la fiche fonctionne quand même sur le web).
