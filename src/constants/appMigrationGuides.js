/**
 * Guides d'export / d'import propres à une app, pour l'étape « Transférer vos données »
 * de la migration guidée (voir getDataTips dans src/utils/migrationGuide.js). Quand une
 * app n'a pas de guide ici, les conseils génériques par catégorie (migrationGuide.js)
 * s'appliquent.
 *
 * Chaque guide doit se suffire à lui-même : l'utilisateur ne devrait pas avoir besoin
 * de quitter Trusti pour le suivre.
 *  - `summary` : « En bref », une ou deux phrases (ce qui est repris, où, combien de temps) ;
 *  - `steps` : étapes numérotées, dans l'ordre, avec les noms de menus exacts ;
 *  - `notes` : « À savoir » (ce qui ne suit pas, pièges, sécurité) ;
 *  - `source` : page d'aide officielle qui fait foi, vérifiée le `checkedAt` indiqué.
 *    Les menus des apps changent : revérifier la source avant de modifier un texte.
 *
 * Clés : id de l'app dans le catalogue (table applications).
 *  - APP_EXPORT_GUIDES[idAppQuittée] : comment récupérer ses données ;
 *  - APP_IMPORT_GUIDES[idAlternative] : comment les faire entrer dans l'alternative.
 *    `directFrom` : apps depuis lesquelles l'alternative importe toute seule (connexion
 *    au compte) ; l'étape d'export est alors remplacée par `directExport` (le résumé).
 */

const TAKEOUT = 'https://support.google.com/accounts/answer/3024190?hl=fr';
const META_EXPORT = 'https://www.facebook.com/help/212802592074644';
const CHECKED = '2026-11-10';

// Étapes communes à tous les exports Google Takeout.
const takeoutSteps = (product) => [
  'Sur un ordinateur de préférence, ouvrez takeout.google.com et connectez-vous à votre compte Google.',
  `Cliquez sur « Tout désélectionner », puis cochez uniquement « ${product} ».`,
  'Cliquez sur « Étape suivante ». Choisissez « Envoyer le lien de téléchargement par e-mail », « Archive ponctuelle » et le format ZIP.',
  'Pour éviter une archive découpée en plusieurs morceaux, choisissez la plus grande taille (50 Go), puis cliquez sur « Créer une exportation ».',
  'Attendez l\'e-mail de Google (souvent le jour même, parfois plusieurs jours pour de gros volumes), puis téléchargez l\'archive.',
];
const TAKEOUT_NOTE = 'Le lien de téléchargement expire au bout d\'environ 7 jours et ne fonctionne que 5 fois : téléchargez l\'archive dès sa réception.';

const metaSteps = (what) => [
  'Dans Facebook : votre photo de profil (en haut à droite) > Paramètres et confidentialité > Paramètres.',
  'Ouvrez Espace Comptes (ou « Compte Meta ») > Vos informations et autorisations > Exporter vos informations.',
  'Touchez « Créer une exportation », choisissez votre profil, puis « Exporter vers l\'appareil ».',
  `Sélectionnez ${what}, la période (« Depuis le début » pour tout garder) et le format, puis « Démarrer l'exportation ».`,
  'Facebook vous prévient par e-mail et par notification quand l\'archive est prête : téléchargez-la depuis « Téléchargements disponibles ».',
];

export const APP_EXPORT_GUIDES = {
  // WhatsApp
  '1769879213451': {
    summary: 'WhatsApp ne permet d\'exporter que discussion par discussion, sous forme d\'un fichier texte à garder comme souvenir. Aucune autre messagerie ne peut le réimporter.',
    steps: [
      'Ouvrez la discussion (individuelle ou de groupe) que vous voulez garder.',
      'Touchez ⋮ (en haut à droite) > Plus > Exporter la discussion.',
      'Choisissez « Inclure les médias » pour garder photos et vidéos, ou « Sans médias » pour un fichier plus léger.',
      'Envoyez le fichier vers un endroit sûr : votre e-mail, vos fichiers ou un cloud.',
      'Recommencez pour chaque discussion importante, puis notez les groupes que vous voudrez recréer.',
    ],
    notes: [
      'L\'export est un fichier texte, pas une sauvegarde : il se relit, mais ne se restaure dans aucune app.',
      'Les messages éphémères et les médias à vue unique ne sont pas exportés.',
    ],
    source: 'https://faq.whatsapp.com/en/android/23756533',
    checkedAt: CHECKED,
  },
  // Telegram
  telegram: {
    summary: 'L\'export complet de Telegram se fait uniquement depuis Telegram Desktop, sur ordinateur. Vous obtenez vos discussions, photos et fichiers dans un dossier lisible hors ligne.',
    steps: [
      'Installez la dernière version de Telegram Desktop sur un ordinateur et connectez-vous.',
      'Pour tout récupérer : Paramètres > Exporter les données Telegram.',
      'Pour une seule discussion : ouvrez-la, cliquez sur … (en haut à droite) > Exporter l\'historique.',
      'Cochez les éléments à garder (photos, vidéos, fichiers) et choisissez le format HTML, le plus simple à relire.',
      'Lancez l\'export et gardez le dossier obtenu en lieu sûr.',
    ],
    notes: [
      'Le format JSON sert à réutiliser les données dans un autre logiciel ; pour les relire vous-même, prenez HTML.',
    ],
    source: 'https://telegram.org/blog/export-and-more',
    checkedAt: CHECKED,
  },
  // Messenger
  app_1770825745319_s7tu4atl7: {
    summary: 'Vos conversations Messenger se récupèrent avec l\'export de données Facebook, en ne cochant que les messages.',
    steps: metaSteps('uniquement « Messages »').map(s => s.replace('le format, puis', 'le format HTML (lisible dans un navigateur), puis')),
    notes: [
      'L\'archive reste téléchargeable 4 jours après la notification.',
      'Pour la relire : décompressez le ZIP et ouvrez le fichier « index » dans un navigateur.',
    ],
    source: META_EXPORT,
    checkedAt: CHECKED,
  },
  // Facebook
  facebook: {
    summary: 'Facebook fournit une archive de vos publications, photos, messages et contacts. Elle se lit dans un navigateur (HTML) ou se réutilise ailleurs (JSON).',
    steps: metaSteps('les informations à garder (ou tout)'),
    notes: [
      'HTML pour relire vous-même, JSON pour importer dans un autre service.',
      'L\'archive reste téléchargeable 4 jours après la notification.',
    ],
    source: META_EXPORT,
    checkedAt: CHECKED,
  },
  // Instagram
  instagram: {
    summary: 'Instagram fournit une archive de vos publications, stories et messages. Prenez le format JSON : c\'est celui que les autres services, comme Pixelfed, savent lire.',
    steps: [
      'Dans Instagram : votre profil > menu ☰ (en haut à droite) > Espace Comptes.',
      'Ouvrez Vos informations et autorisations > Télécharger vos informations.',
      'Choisissez la période « Depuis le début » et changez le format en JSON (HTML est proposé par défaut).',
      'Confirmez avec votre mot de passe Instagram pour lancer la demande.',
      'Téléchargez l\'archive quand Instagram vous prévient qu\'elle est prête.',
    ],
    notes: [
      'Selon votre compte, le menu peut s\'appeler « Compte Meta » au lieu d\'« Espace Comptes ».',
    ],
    source: 'https://help.instagram.com/181231772500920',
    checkedAt: CHECKED,
  },
  // Gmail
  '1769803097037': {
    summary: 'Google fournit tous vos e-mails dans un fichier MBOX, que la plupart des messageries savent importer. Vos contacts s\'exportent à part.',
    steps: [
      ...takeoutSteps('Mail'),
      'Pour les contacts : ouvrez contacts.google.com > Exporter, au format vCard.',
    ],
    notes: [
      TAKEOUT_NOTE,
      'Si votre nouvelle messagerie propose un import direct depuis Gmail, c\'est plus simple : pas de fichier à manipuler.',
    ],
    source: TAKEOUT,
    checkedAt: CHECKED,
  },
  // Google Photos
  '1769805693753': {
    summary: 'Google Takeout fournit toutes vos photos et vidéos, avec les dates et lieux dans des fichiers à côté. Gardez l\'archive entière : l\'import en a besoin.',
    steps: takeoutSteps('Google Photos'),
    notes: [
      TAKEOUT_NOTE,
      'Les dates et lieux sont dans des fichiers .json à côté des photos : ne les supprimez pas.',
      'Les albums partagés ne sont pas toujours exportés : enregistrez à part les photos qui comptent.',
    ],
    source: TAKEOUT,
    checkedAt: CHECKED,
  },
  // Google Drive
  '1769805796367': {
    summary: 'Google Takeout fournit tous vos fichiers Drive. Les Google Docs, Sheets et Slides sont convertis au format Office.',
    steps: takeoutSteps('Drive'),
    notes: [
      TAKEOUT_NOTE,
      'Docs, Sheets et Slides arrivent en .docx, .xlsx et .pptx : la mise en forme peut légèrement changer.',
      'Les liens de partage ne suivent pas : notez qui avait accès à quoi.',
    ],
    source: TAKEOUT,
    checkedAt: CHECKED,
  },
  // Google Keep
  '1769805162254': {
    summary: 'Google Takeout fournit chacune de vos notes Keep, lisible dans un navigateur.',
    steps: takeoutSteps('Keep'),
    notes: [TAKEOUT_NOTE],
    source: TAKEOUT,
    checkedAt: CHECKED,
  },
  // YouTube
  '1769878590420': {
    summary: 'Google Takeout fournit la liste de vos abonnements (fichier subscriptions.csv), que les apps alternatives savent importer.',
    steps: takeoutSteps('YouTube et YouTube Music'),
    notes: [
      TAKEOUT_NOTE,
      'Le fichier des abonnements peut porter un nom traduit dans la langue de votre compte.',
    ],
    source: TAKEOUT,
    checkedAt: CHECKED,
  },
  // Google Chrome
  '1769805919501': {
    summary: 'Sur ordinateur, la plupart des navigateurs reprennent directement les favoris, l\'historique et les mots de passe de Chrome. Gardez Chrome installé le temps de l\'import.',
    steps: [
      'Laissez Chrome installé sur l\'ordinateur jusqu\'à la fin de l\'import.',
      'Si le nouveau navigateur ne trouve pas Chrome, exportez les favoris : Chrome > Gestionnaire de favoris > ⋮ > Exporter les favoris (fichier HTML).',
      'Exportez aussi les mots de passe depuis le gestionnaire de mots de passe de Chrome (fichier CSV).',
    ],
    notes: [
      'Le fichier CSV contient vos mots de passe en clair : supprimez-le (corbeille comprise) dès l\'import terminé.',
    ],
    source: 'https://help.vivaldi.com/desktop/tools/import-and-export-browser-data/',
    checkedAt: CHECKED,
  },
  // LastPass
  lastpass: {
    summary: 'LastPass exporte votre coffre dans un fichier CSV, après une confirmation par e-mail.',
    steps: [
      'Ouvrez votre coffre LastPass dans un navigateur, sur ordinateur.',
      'Cliquez sur Options avancées > Exporter.',
      'LastPass vous envoie un e-mail de confirmation : cliquez sur le lien dans les 10 minutes.',
      'Revenez au coffre, cliquez à nouveau sur Exporter et saisissez votre mot de passe maître.',
      'Enregistrez le fichier CSV obtenu.',
    ],
    notes: [
      'Ne sont pas exportés : pièces jointes, champs personnalisés, codes de double authentification et éléments partagés avec vous.',
      'Le CSV contient vos mots de passe en clair : supprimez-le dès l\'import vérifié.',
    ],
    source: 'https://bitwarden.com/help/import-from-lastpass/',
    checkedAt: CHECKED,
  },
  // Dashlane
  dashlane: {
    summary: 'Dashlane exporte vos identifiants en CSV depuis son app web.',
    steps: [
      'Ouvrez l\'app web Dashlane dans un navigateur.',
      'Menu Coffre (en haut à gauche) > Paramètres > Exporter les données.',
      'Choisissez « Exporter en CSV » et enregistrez le fichier (parfois un ZIP contenant plusieurs CSV).',
    ],
    notes: [
      'Ne sont pas exportés : pièces jointes des notes sécurisées et passkeys (à recréer dans le nouveau gestionnaire).',
      'Le CSV contient vos mots de passe en clair : supprimez-le dès l\'import vérifié.',
    ],
    source: 'https://support.dashlane.com/hc/articles/32905278138002',
    checkedAt: CHECKED,
  },
  // Google Authenticator
  'google-authenticator': {
    summary: 'Google Authenticator affiche vos comptes sous forme de QR codes, que la nouvelle app scanne. Ne supprimez rien avant d\'avoir tout vérifié.',
    steps: [
      'Dans Google Authenticator : menu (⋮ ou ☰) > Transférer des comptes > Exporter des comptes.',
      'Sélectionnez les comptes à transférer, puis validez.',
      'Un ou plusieurs QR codes s\'affichent : scannez-les avec la nouvelle app, ou faites une capture d\'écran si elle importe des images.',
    ],
    notes: [
      'Gardez Google Authenticator tant que chaque code n\'a pas été testé sur son site : sans code, vous pourriez perdre l\'accès à un compte.',
      'Supprimez les captures d\'écran des QR codes une fois l\'import fini : elles donnent accès à vos codes.',
    ],
    source: 'https://support.google.com/accounts/answer/1066447?hl=fr',
    checkedAt: CHECKED,
  },
  // Evernote
  evernote: {
    summary: 'Evernote exporte chaque carnet dans un fichier ENEX, que les autres apps de notes savent importer. Uniquement depuis l\'app pour ordinateur.',
    steps: [
      'Ouvrez l\'app Evernote pour Windows ou Mac (l\'export n\'existe pas sur le web).',
      'Allez sur l\'écran Carnets.',
      'Cliquez sur ••• à côté d\'un carnet > Exporter le carnet, puis choisissez le format ENEX (.enex).',
      'Recommencez pour chaque carnet et rangez les fichiers dans un même dossier.',
    ],
    notes: [
      'Gardez les fichiers ENEX en sauvegarde même après l\'import.',
    ],
    source: 'https://help.evernote.com/hc/articles/209005557',
    checkedAt: CHECKED,
  },
};

export const APP_IMPORT_GUIDES = {
  // Signal
  '1769540367871': {
    summary: 'Signal ne reprend pas l\'historique des autres messageries : vous repartez de conversations vierges. Le vrai travail, c\'est de faire venir vos contacts.',
    steps: [
      'Installez Signal et inscrivez-vous avec votre numéro de téléphone.',
      'Ouvrez la liste des contacts : ceux qui utilisent déjà Signal apparaissent directement.',
      'Prévenez vos proches (par exemple dans l\'ancienne app) que vous passez sur Signal.',
      'Recréez vos groupes et partagez-leur un lien d\'invitation au groupe.',
    ],
    notes: [
      'Gardez l\'ancienne app quelques semaines, le temps que vos contacts suivent.',
    ],
    // L'export WhatsApp « ne peut pas être réimporté » (FAQ WhatsApp) ; Signal n'a pas d'import.
    source: 'https://faq.whatsapp.com/en/android/23756533',
    checkedAt: CHECKED,
  },
  // Proton Mail
  '1769541460710': {
    summary: 'Easy Switch copie vos e-mails, contacts et agendas dans Proton Mail. Tout se fait depuis le site web de Proton.',
    steps: [
      'Sur un ordinateur, connectez-vous à mail.proton.me.',
      'Allez dans Paramètres > Tous les paramètres > Importer via Easy Switch.',
      'Choisissez Google, puis « Connecter à Gmail » (ou le service que vous quittez).',
      'Autorisez tous les accès demandés (« Tout sélectionner »), puis « Continuer » : un accès manquant fait échouer l\'import.',
      'L\'import démarre par les messages les plus récents ; laissez-le tourner, il peut durer des heures, voire des jours pour une grosse boîte.',
    ],
    notes: [
      'Contacts (jusqu\'à 10 000) et agendas sont repris avec les e-mails.',
      'Easy Switch peut aussi faire suivre vers Proton les nouveaux e-mails reçus sur Gmail pendant la transition.',
      'Comptes Google Workspace (professionnels) non pris en charge par cette méthode.',
    ],
    directFrom: ['1769803097037'],
    directExport: 'Pas besoin d\'exporter : Proton se connecte à votre compte Gmail et copie tout lui-même.',
    source: 'https://proton.me/support/switch-from-gmail-to-proton',
    checkedAt: CHECKED,
  },
  // Infomaniak Mail
  '1769804133553': {
    summary: 'L\'outil d\'import d\'Infomaniak copie votre boîte Gmail dans votre adresse Infomaniak, en arrière-plan.',
    steps: [
      'Créez d\'abord votre adresse Infomaniak Mail.',
      'Ouvrez l\'outil d\'import : import-email.infomaniak.com.',
      'Choisissez l\'import par IMAP, puis « Import unique ».',
      'Saisissez votre adresse Gmail et autorisez l\'accès avec le bouton Google.',
      'Choisissez l\'adresse Infomaniak de destination et lancez l\'import.',
    ],
    notes: [
      'Depuis Gmail, l\'import est volontairement lent (environ 1 Go par jour) ; un e-mail récapitulatif arrive à la fin.',
      'Une fois lancé, l\'import ne peut plus être arrêté.',
      'Les libellés Gmail deviennent des dossiers : un message classé dans plusieurs libellés est copié plusieurs fois.',
    ],
    directFrom: ['1769803097037'],
    directExport: 'Pas besoin d\'exporter : l\'outil d\'Infomaniak se connecte à Gmail et copie les messages.',
    source: 'https://www.infomaniak.com/fr/support/faq/1785/importer-votre-boite-gmail-sur-infomaniak',
    checkedAt: CHECKED,
  },
  // Tuta Mail
  tutanota: {
    summary: 'Tuta importe des e-mails exportés en fichiers (.eml ou .mbox), depuis son app pour ordinateur.',
    steps: [
      'Installez l\'app Tuta pour ordinateur (Windows, Mac ou Linux) et connectez-vous.',
      'Ouvrez Paramètres > Import d\'e-mails.',
      'Sélectionnez le fichier .mbox (ou le dossier de fichiers .eml) exporté depuis l\'ancienne messagerie.',
      'Choisissez le dossier de destination et lancez l\'import.',
    ],
    notes: [
      'Un gros import peut prendre du temps : laissez l\'app ouverte.',
    ],
    source: 'https://tuta.com/blog/desktop-clients-tutanota',
    checkedAt: CHECKED,
  },
  // Ente Photos
  '1769805734714': {
    summary: 'Ente importe directement une archive Google Takeout, avec les dates et les albums, depuis son app pour ordinateur.',
    steps: [
      'Si Google vous a donné plusieurs fichiers ZIP, décompressez-les tous dans un même dossier.',
      'Installez l\'app Ente pour ordinateur et connectez-vous.',
      'Cliquez sur Importer, puis choisissez « Google Takeout ».',
      'Sélectionnez le dossier (ou les fichiers ZIP) et laissez l\'import se terminer.',
      'Comparez le nombre de photos avec celui de Google Photos.',
    ],
    notes: [
      'Ente écarte les doublons présents dans plusieurs albums ; l\'espace nécessaire correspond à votre bibliothèque, pas à la taille de l\'archive.',
      'N\'activez la sauvegarde automatique du téléphone qu\'après l\'import, pour éviter des doublons.',
      'Gardez Google Photos tant que vous n\'avez pas vérifié la copie.',
    ],
    source: 'https://ente.io/help/photos/migration/from-google-photos',
    checkedAt: CHECKED,
  },
  // Infomaniak kDrive
  '1769805814704': {
    summary: 'Le plus simple : déposer dans kDrive le contenu de l\'archive exportée. Infomaniak propose aussi un outil d\'import depuis un autre cloud.',
    steps: [
      'Décompressez l\'archive de l\'ancien service sur votre ordinateur.',
      'Installez l\'app kDrive pour ordinateur, ou ouvrez kDrive dans le navigateur.',
      'Déposez les dossiers dans kDrive et laissez la synchronisation se terminer.',
      'Vérifiez le nombre de fichiers, puis partagez à nouveau les dossiers que vous partagiez.',
    ],
    notes: [
      'Les liens de partage de l\'ancien service ne suivent pas.',
    ],
    source: 'https://www.infomaniak.com/fr/support/faq/2406/importer-des-donnees-externes-sur-kdrive',
    checkedAt: CHECKED,
  },
  // Pixelfed
  '1769543537349': {
    summary: 'Pixelfed sait importer vos publications Instagram (photos, légendes, dates) depuis l\'archive JSON, si votre serveur l\'autorise.',
    steps: [
      'Décompressez l\'archive Instagram (format JSON).',
      'Dans Pixelfed, sur le web : Paramètres > Importer.',
      'Sélectionnez les fichiers de l\'archive, puis cochez les publications à reprendre.',
      'Lancez l\'import.',
    ],
    notes: [
      'Seules les publications choisies sont envoyées ; le reste de l\'archive reste sur votre appareil.',
      'Certains serveurs désactivent l\'import : vérifiez avant de choisir le vôtre.',
    ],
    source: 'https://fedi.tips/?p=5357',
    checkedAt: CHECKED,
  },
  // Vivaldi
  vivaldi: {
    summary: 'Sur ordinateur, Vivaldi reprend favoris, historique et mots de passe de Chrome en quelques clics. Sur Android, passez par l\'ordinateur.',
    steps: [
      'Installez Vivaldi sur l\'ordinateur où se trouve Chrome.',
      'Menu Vivaldi > Fichier > Importer depuis des applications ou des fichiers.',
      'Choisissez Chrome, cochez favoris, historique et mots de passe, puis importez.',
      'Activez la synchronisation Vivaldi pour retrouver ces données sur votre téléphone.',
    ],
    notes: [
      'Si les mots de passe arrivent vides : importez le CSV exporté de Chrome dans vivaldi://password-manager/settings.',
      'Sur Android, Vivaldi ne peut pas reprendre directement les données de Chrome.',
    ],
    source: 'https://help.vivaldi.com/desktop/tools/import-and-export-browser-data/',
    checkedAt: CHECKED,
  },
  // LibreTube
  '1769878626276': {
    summary: 'LibreTube importe vos abonnements YouTube depuis le fichier de Google Takeout. Pas de compte Google à connecter.',
    steps: [
      'Copiez sur le téléphone le fichier subscriptions.csv tiré de l\'archive Takeout.',
      'Dans LibreTube : ⋮ > Paramètres > Sauvegarde et restauration.',
      'Touchez « Importer les abonnements », puis choisissez « YouTube (CSV) ».',
      'Sélectionnez le fichier subscriptions.csv.',
    ],
    notes: [
      'Historique et playlists privées ne suivent pas.',
    ],
    source: 'https://libretube.dev/',
    checkedAt: CHECKED,
  },
  // Bitwarden
  '1769804898711': {
    summary: 'Bitwarden importe la plupart des gestionnaires de mots de passe. Depuis LastPass, l\'extension de navigateur le fait même sans fichier.',
    steps: [
      'Depuis LastPass : dans l\'extension de navigateur ou l\'app ordinateur Bitwarden, utilisez l\'import direct et connectez-vous à LastPass.',
      'Depuis un autre gestionnaire : ouvrez le coffre web Bitwarden > Outils > Importer des données.',
      'Choisissez le format de l\'ancien gestionnaire et sélectionnez le fichier exporté.',
      'Vérifiez quelques comptes, puis supprimez le fichier exporté.',
    ],
    notes: [
      'Les pièces jointes ne sont pas importées : ajoutez-les à la main.',
      'En cas d\'« Erreur d\'importation », rien n\'a été ajouté : corrigez le fichier et recommencez.',
    ],
    directFrom: ['lastpass'],
    directExport: 'Pas besoin de fichier avec l\'extension de navigateur ou l\'app ordinateur Bitwarden : elle lit votre coffre LastPass directement.',
    source: 'https://bitwarden.com/help/import-from-lastpass/',
    checkedAt: CHECKED,
  },
  // KeePassXC
  keepassxc: {
    summary: 'KeePassXC importe un fichier CSV (et les exports 1Password ou Bitwarden) dans une base chiffrée stockée sur votre ordinateur.',
    steps: [
      'Installez KeePassXC sur l\'ordinateur.',
      'Cliquez sur « Importer un fichier » (écran d\'accueil) ou Base de données > Importer.',
      'Choisissez le type de fichier (CSV, 1Password, Bitwarden…) et sélectionnez-le.',
      'Pour un CSV, vérifiez que chaque colonne (titre, identifiant, mot de passe, URL) est bien associée.',
      'Enregistrez la nouvelle base avec un mot de passe maître solide.',
    ],
    notes: [
      'Supprimez le fichier exporté dès l\'import vérifié : il est en clair.',
    ],
    source: 'https://keepassxc.org/docs/KeePassXC_UserGuide#_importing_databases',
    checkedAt: CHECKED,
  },
  // Passbolt
  passbolt: {
    summary: 'Passbolt importe un fichier CSV ou une base KeePass (KDBX) depuis son extension de navigateur.',
    steps: [
      'Ouvrez Passbolt dans le navigateur.',
      'Cliquez sur « Importer » (en haut à gauche, à côté de « Créer »).',
      'Sélectionnez le fichier CSV ou KDBX ; pour un KDBX, saisissez son mot de passe.',
      'Lancez l\'import et vérifiez quelques comptes.',
    ],
    notes: [
      'Colonnes CSV attendues : Group, Title, Username, Password, URL, Notes, TOTP. Si l\'import est refusé, renommez l\'en-tête du fichier.',
      'Supprimez le fichier exporté dès l\'import vérifié.',
    ],
    source: 'https://www.passbolt.com/docs/user/basic-features/browser/import/lastpass',
    checkedAt: CHECKED,
  },
  // Proton Authenticator
  '704ba443-e876-4512-888e-8ea2edc1adbc': {
    summary: 'Proton Authenticator reprend vos codes de double authentification en scannant les QR codes de l\'ancienne app.',
    steps: [
      'Dans Proton Authenticator : Paramètres > Importer, puis choisissez l\'app que vous quittez.',
      'Touchez + pour scanner le QR code affiché par l\'ancienne app, ou importez une capture d\'écran.',
      'Répétez pour chaque QR code.',
      'Testez chaque code sur son site avant de supprimer quoi que ce soit dans l\'ancienne app.',
    ],
    notes: [
      'Avec beaucoup de comptes, exportez-les par petits groupes si le QR code n\'est pas reconnu.',
    ],
    source: 'https://proton.me/support/import-2fa-codes',
    checkedAt: CHECKED,
  },
  // Joplin
  '4cc90381-be9a-483b-8d5c-59b471737e6f': {
    summary: 'Joplin importe vos carnets Evernote (notes, étiquettes, pièces jointes) depuis les fichiers ENEX, dans son app pour ordinateur.',
    steps: [
      'Installez Joplin sur l\'ordinateur.',
      'Un seul carnet : Fichier > Importer > ENEX (en Markdown, plus simple à modifier).',
      'Plusieurs carnets : Fichier > Importer > ENEX (dossier) importe d\'un coup tous les fichiers d\'un dossier.',
      'Activez la synchronisation pour retrouver vos notes sur le téléphone.',
    ],
    notes: [
      'Comparez le nombre de notes après l\'import et gardez les fichiers ENEX.',
    ],
    source: 'https://joplinapp.org/help/apps/import_export',
    checkedAt: CHECKED,
  },
};
