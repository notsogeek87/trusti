/**
 * Guides d'export / d'import propres à une app, pour l'étape « Transférer vos données »
 * de la migration guidée (voir getDataTips dans src/utils/migrationGuide.js). Quand une
 * app n'a pas de guide ici, les conseils génériques par catégorie (migrationGuide.js)
 * s'appliquent.
 *
 * Clés : id de l'app dans le catalogue (table applications). Chaque guide cite la page
 * d'aide officielle qui fait foi (`source`), vérifiée le `checkedAt` indiqué : les menus
 * des apps changent, revérifier la source avant de modifier un texte.
 *
 *  - APP_EXPORT_GUIDES[idAppQuittée] : comment récupérer ses données ;
 *  - APP_IMPORT_GUIDES[idAlternative] : comment les faire entrer dans l'alternative.
 *    `directFrom` : apps depuis lesquelles l'alternative importe toute seule (connexion
 *    au compte) ; l'étape d'export est alors remplacée par `directExport`.
 */

const TAKEOUT = 'https://support.google.com/accounts/answer/3024190?hl=fr';
const META_EXPORT = 'https://www.facebook.com/help/212802592074644';

const takeout = (product) => [
  `Ouvrez takeout.google.com, cliquez sur « Tout désélectionner » puis cochez seulement « ${product} ».`,
  'Choisissez « Envoyer le lien de téléchargement par e-mail », une archive ZIP, puis « Créer une exportation ».',
  'Le lien arrive par e-mail (souvent le jour même, parfois après plusieurs jours) et expire au bout d\'environ 7 jours.',
];

export const APP_EXPORT_GUIDES = {
  // WhatsApp
  '1769879213451': {
    tips: [
      'Dans chaque discussion à garder : ⋮ > Plus > Exporter la discussion, avec ou sans médias.',
      'Le fichier obtenu est une archive texte : aucune autre messagerie ne peut la réimporter. Gardez-la comme souvenir.',
      'Notez les groupes importants : il faudra les recréer.',
    ],
    source: 'https://faq.whatsapp.com/en/android/23756533',
    checkedAt: '2026-11-10',
  },
  // Telegram
  telegram: {
    tips: [
      'Installez Telegram Desktop sur un ordinateur : l\'export complet n\'existe que là.',
      'Paramètres > Exporter les données Telegram (ou … > Exporter l\'historique dans une discussion), au format HTML pour relire ou JSON.',
      'Cochez les photos et fichiers si vous voulez les garder.',
    ],
    source: 'https://telegram.org/blog/export-and-more',
    checkedAt: '2026-11-10',
  },
  // Messenger
  app_1770825745319_s7tu4atl7: {
    tips: [
      'Sur Facebook : Paramètres et confidentialité > Paramètres > Espace Comptes > Vos informations et autorisations > Exporter vos informations.',
      'Cochez « Messages », choisissez la période et le format HTML (pour relire), puis lancez l\'export.',
      'Vous êtes prévenu quand l\'archive est prête ; elle reste téléchargeable 4 jours.',
    ],
    source: META_EXPORT,
    checkedAt: '2026-11-10',
  },
  // Facebook
  facebook: {
    tips: [
      'Paramètres et confidentialité > Paramètres > Espace Comptes > Vos informations et autorisations > Exporter vos informations > Créer une exportation.',
      'Choisissez « Exporter vers l\'appareil », toute la période et le format JSON si vous voulez réutiliser les données ailleurs, HTML pour les relire.',
      'L\'archive reste téléchargeable 4 jours après la notification.',
    ],
    source: META_EXPORT,
    checkedAt: '2026-11-10',
  },
  // Instagram
  instagram: {
    tips: [
      'Profil > menu ☰ > Espace Comptes > Vos informations et autorisations > Télécharger vos informations.',
      'Choisissez toute la période et le format JSON (le format par défaut est HTML) : c\'est celui que les autres services savent lire.',
      'Votre mot de passe Instagram vous sera demandé pour lancer la demande.',
    ],
    source: 'https://help.instagram.com/181231772500920',
    checkedAt: '2026-11-10',
  },
  // Gmail
  '1769803097037': {
    tips: [
      ...takeout('Gmail').slice(0, 1),
      'Les messages arrivent au format MBOX, lisible par Thunderbird et importable par la plupart des messageries.',
      'Exportez aussi vos contacts : contacts.google.com > Exporter (format vCard).',
    ],
    source: TAKEOUT,
    checkedAt: '2026-11-10',
  },
  // Google Photos
  '1769805693753': {
    tips: [
      ...takeout('Google Photos'),
      'Les dates et lieux sont dans des fichiers .json à côté des photos : gardez-les, l\'import en a besoin.',
    ],
    source: TAKEOUT,
    checkedAt: '2026-11-10',
  },
  // Google Drive
  '1769805796367': {
    tips: [
      ...takeout('Drive'),
      'Les Google Docs, Sheets et Slides sont convertis au format Office (.docx, .xlsx, .pptx).',
    ],
    source: TAKEOUT,
    checkedAt: '2026-11-10',
  },
  // Google Keep
  '1769805162254': {
    tips: [
      ...takeout('Keep'),
      'Chaque note est fournie en HTML (lisible partout) et en JSON.',
    ],
    source: TAKEOUT,
    checkedAt: '2026-11-10',
  },
  // YouTube
  '1769878590420': {
    tips: [
      ...takeout('YouTube et YouTube Music').slice(0, 2),
      'Vos abonnements sont dans le fichier subscriptions.csv (son nom peut être traduit dans la langue de votre compte).',
    ],
    source: TAKEOUT,
    checkedAt: '2026-11-10',
  },
  // Google Chrome
  '1769805919501': {
    tips: [
      'Sur ordinateur, gardez Chrome installé le temps de l\'import : la plupart des navigateurs reprennent directement favoris, historique et mots de passe.',
      'Sinon, exportez les favoris : Gestionnaire de favoris > ⋮ > Exporter les favoris (fichier HTML).',
      'Mots de passe : le gestionnaire de mots de passe de Chrome peut les exporter en CSV (fichier en clair, à supprimer après l\'import).',
    ],
    source: 'https://help.vivaldi.com/desktop/tools/import-and-export-browser-data/',
    checkedAt: '2026-11-10',
  },
  // LastPass
  lastpass: {
    tips: [
      'Dans le coffre web : Options avancées > Exporter. LastPass envoie un e-mail de confirmation (lien valable 10 minutes).',
      'Après le lien, cliquez à nouveau sur Exporter et saisissez le mot de passe maître : un fichier CSV est créé.',
      'Les pièces jointes, champs personnalisés et éléments partagés avec vous ne sont pas exportés.',
    ],
    source: 'https://bitwarden.com/help/import-from-lastpass/',
    checkedAt: '2026-11-10',
  },
  // Dashlane
  dashlane: {
    tips: [
      'Dans l\'app web : menu Coffre (en haut à gauche) > Paramètres > Exporter les données > Exporter en CSV.',
      'Les pièces jointes des notes sécurisées et les passkeys ne sont pas exportées.',
    ],
    source: 'https://support.dashlane.com/hc/articles/32905278138002',
    checkedAt: '2026-11-10',
  },
  // Google Authenticator
  'google-authenticator': {
    tips: [
      'Menu > Transférer des comptes > Exporter des comptes, puis sélectionnez les comptes.',
      'Un ou plusieurs QR codes s\'affichent : gardez-les à l\'écran (ou en capture) le temps de l\'import.',
      'Ne supprimez rien dans Google Authenticator avant d\'avoir vérifié chaque code dans la nouvelle app.',
    ],
    source: 'https://support.google.com/accounts/answer/1066447?hl=fr',
    checkedAt: '2026-11-10',
  },
  // Evernote
  evernote: {
    tips: [
      'L\'export ne marche que dans l\'app Evernote pour Windows ou Mac, pas sur le web.',
      'Écran Carnets > ••• à côté du carnet > Exporter le carnet, au format ENEX (.enex).',
      'Répétez pour chaque carnet et gardez les fichiers ENEX en sauvegarde.',
    ],
    source: 'https://help.evernote.com/hc/articles/209005557',
    checkedAt: '2026-11-10',
  },
};

export const APP_IMPORT_GUIDES = {
  // Signal
  '1769540367871': {
    tips: [
      'Signal ne reprend pas l\'historique des autres messageries : on repart d\'une conversation vierge.',
      'Prévenez vos contacts proches et recréez les groupes, par exemple avec un lien d\'invitation au groupe.',
      'Gardez l\'ancienne app quelques semaines, le temps que vos contacts suivent.',
    ],
    // L'export WhatsApp « ne peut pas être réimporté » (FAQ WhatsApp) ; Signal n'a pas d'import.
    source: 'https://faq.whatsapp.com/en/android/23756533',
    checkedAt: '2026-11-10',
  },
  // Proton Mail
  '1769541460710': {
    tips: [
      'Sur mail.proton.me (web) : Paramètres > Tous les paramètres > Importer via Easy Switch.',
      'Pour Gmail : Google > Connecter à Gmail, puis autorisez tout (« Tout sélectionner »). Messages, contacts (jusqu\'à 10 000) et agendas sont repris.',
      'Easy Switch peut aussi faire suivre les nouveaux e-mails Gmail vers Proton pendant la transition.',
    ],
    directFrom: ['1769803097037'],
    directExport: ['Pas besoin d\'exporter : Proton se connecte à votre compte Gmail et copie tout lui-même.'],
    source: 'https://proton.me/support/switch-from-gmail-to-proton',
    checkedAt: '2026-11-10',
  },
  // Infomaniak Mail
  '1769804133553': {
    tips: [
      'Ouvrez l\'outil d\'import import-email.infomaniak.com, choisissez IMAP puis « Import unique ».',
      'Pour Gmail, autorisez l\'accès avec le bouton Google ; les libellés deviennent des dossiers.',
      'L\'import tourne en arrière-plan (environ 1 Go par jour depuis Gmail) ; un e-mail récapitulatif arrive à la fin.',
    ],
    directFrom: ['1769803097037'],
    directExport: ['Pas besoin d\'exporter : l\'outil d\'Infomaniak se connecte à Gmail et copie les messages.'],
    source: 'https://www.infomaniak.com/fr/support/faq/1785/importer-votre-boite-gmail-sur-infomaniak',
    checkedAt: '2026-11-10',
  },
  // Tuta Mail
  tutanota: {
    tips: [
      'Installez l\'app Tuta pour ordinateur : l\'import de fichiers .eml et .mbox se fait depuis Paramètres > Import d\'e-mails.',
      'Choisissez le dossier de destination ; un gros import peut prendre du temps.',
    ],
    source: 'https://tuta.com/blog/desktop-clients-tutanota',
    checkedAt: '2026-11-10',
  },
  // Ente Photos
  '1769805734714': {
    tips: [
      'Installez l\'app Ente pour ordinateur, puis Importer > Google Takeout.',
      'Décompressez toutes les archives dans un même dossier parent avant l\'import : les dates et albums sont mieux repris.',
      'Ente écarte les doublons des albums. Comparez le nombre de photos avant de vider Google Photos.',
    ],
    source: 'https://ente.io/help/photos/migration/from-google-photos',
    checkedAt: '2026-11-10',
  },
  // Infomaniak kDrive
  '1769805814704': {
    tips: [
      'kDrive propose un outil d\'import depuis un autre cloud (Google Drive, Dropbox, OneDrive) : voir la FAQ Infomaniak.',
      'Sinon, déposez le contenu de l\'archive Takeout dans kDrive (app ordinateur ou web), puis vérifiez le nombre de fichiers.',
      'Partagez de nouveau les dossiers que vous partagiez : les liens Google Drive ne suivent pas.',
    ],
    source: 'https://www.infomaniak.com/fr/support/faq/2406/importer-des-donnees-externes-sur-kdrive',
    checkedAt: '2026-11-10',
  },
  // Pixelfed
  '1769543537349': {
    tips: [
      'Dans Pixelfed : Paramètres > Importer, puis choisissez l\'archive Instagram (format JSON) et les publications à reprendre.',
      'Seules les publications choisies (photos, légendes, dates) sont envoyées.',
      'Certaines instances désactivent l\'import : vérifiez avant de choisir votre serveur.',
    ],
    source: 'https://fedi.tips/?p=5357',
    checkedAt: '2026-11-10',
  },
  // Vivaldi
  vivaldi: {
    tips: [
      'Sur ordinateur : menu Vivaldi > Fichier > Importer depuis des applications ou des fichiers, puis Chrome (favoris, historique, mots de passe).',
      'Si les mots de passe arrivent vides : importez le CSV de Chrome dans vivaldi://password-manager/settings.',
      'Sur Android, Vivaldi ne reprend pas les données de Chrome : passez par l\'ordinateur et la synchronisation Vivaldi.',
    ],
    source: 'https://help.vivaldi.com/desktop/tools/import-and-export-browser-data/',
    checkedAt: '2026-11-10',
  },
  // LibreTube
  '1769878626276': {
    tips: [
      'LibreTube : ⋮ > Paramètres > Sauvegarde et restauration > Importer les abonnements > YouTube (CSV).',
      'Choisissez le fichier subscriptions.csv de l\'archive Takeout.',
      'LibreTube ne se connecte pas à un compte Google : historique et playlists privées ne suivent pas.',
    ],
    source: 'https://libretube.dev/',
    checkedAt: '2026-11-10',
  },
  // Bitwarden
  '1769804898711': {
    tips: [
      'Depuis LastPass : l\'extension de navigateur ou l\'app ordinateur Bitwarden importent directement depuis votre compte LastPass, sans fichier.',
      'Avec un fichier : coffre web Bitwarden > Outils > Importer des données, choisissez le format de l\'ancien gestionnaire.',
      'Les pièces jointes ne sont pas importées : ajoutez-les à la main. Supprimez le fichier CSV ensuite.',
    ],
    directFrom: ['lastpass'],
    directExport: ['Pas besoin de fichier si vous utilisez l\'extension ou l\'app ordinateur Bitwarden : elle lit votre coffre LastPass directement.'],
    source: 'https://bitwarden.com/help/import-from-lastpass/',
    checkedAt: '2026-11-10',
  },
  // KeePassXC
  keepassxc: {
    tips: [
      'Sur ordinateur : bouton « Importer un fichier » de l\'écran d\'accueil, ou Base de données > Importer.',
      'Pour un CSV, vérifiez la correspondance des colonnes (titre, identifiant, mot de passe, URL) avant de valider.',
      'Supprimez le fichier CSV dès l\'import vérifié : il est en clair.',
    ],
    source: 'https://keepassxc.org/docs/KeePassXC_UserGuide#_importing_databases',
    checkedAt: '2026-11-10',
  },
  // Passbolt
  passbolt: {
    tips: [
      'Bouton « Importer » en haut à gauche, à côté de « Créer », puis choisissez le fichier CSV ou KDBX.',
      'Colonnes CSV attendues : Group, Title, Username, Password, URL, Notes, TOTP (renommez l\'en-tête si l\'import est refusé).',
      'Supprimez le fichier CSV dès l\'import vérifié.',
    ],
    source: 'https://www.passbolt.com/docs/user/basic-features/browser/import/lastpass',
    checkedAt: '2026-11-10',
  },
  // Proton Authenticator
  '704ba443-e876-4512-888e-8ea2edc1adbc': {
    tips: [
      'Paramètres > Importer, choisissez Google Authenticator, puis scannez ou importez l\'image du QR code (bouton +).',
      'Avec beaucoup de comptes, exportez-les par petits groupes si le QR code n\'est pas reconnu.',
      'Testez chaque code sur un site avant de les supprimer de l\'ancienne app.',
    ],
    source: 'https://proton.me/support/import-2fa-codes',
    checkedAt: '2026-11-10',
  },
  // Joplin
  '4cc90381-be9a-483b-8d5c-59b471737e6f': {
    tips: [
      'Dans Joplin pour ordinateur : Fichier > Importer > ENEX (Markdown conseillé), un carnet par fichier.',
      'Plusieurs carnets : « ENEX (dossier) » importe tous les fichiers d\'un dossier d\'un coup.',
      'Comparez le nombre de notes après l\'import et gardez les fichiers ENEX.',
    ],
    source: 'https://joplinapp.org/help/apps/import_export',
    checkedAt: '2026-11-10',
  },
};
