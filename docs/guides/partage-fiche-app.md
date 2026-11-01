# Partage d'une fiche app

Bouton **Partager** (icône en haut de la fiche détail) → menu de partage natif
(APK : `@capacitor/share`, web : Web Share API, sinon copie dans le presse-papiers).

## Lien partagé

`https://trusti.lielu.eu/?app=<id>` — construit par `src/utils/appShareLink.js`.

- Au chargement du site, `App.jsx` lit `?app=`, charge l'app via
  `GET /api/apps?ids=<id>`, ouvre sa fiche puis nettoie l'URL.
- Dans l'APK, le WebView tourne sur `https://localhost` : les liens sont donc
  toujours construits sur `https://trusti.lielu.eu` (vaut aussi pour les liens
  `?apps=`/`?mig=`). Le lien s'ouvre sur le site, pas dans l'APK (pas d'App Links).
