# Évaluer mon organisation : parc applicatif d'une entreprise ou d'un organisme

**Pour qui / Pourquoi** : toute personne qui touche à la page « Évaluer mon organisation » ou au
marquage « usage pro » du catalogue. La page permet à un DSI ou à un responsable d'organisme de
cocher les outils utilisés dans sa structure et d'obtenir une note globale, des indicateurs et un
plan d'action, sans compte et sans rien envoyer au serveur.

## Accès

- Adresse : `https://<domaine>/?organisation`.
- Points d'entrée : la page n'est plus liée directement depuis l'app. Le bouton « Organisations »
  de l'en-tête (`Header`, libellé dès 768 px, icône seule sur téléphone) et du bas de la page
  d'accueil (`LandingPage`) ouvre la rubrique « Organisations » (`?organisations`), dont la carte
  « Évaluer mon organisation » mène à `?organisation`. Aussi dans l'APK : la page y appelle l'API
  de production (`API_URL` absolue en natif).
- Page autonome chargée à part (`React.lazy` dans `src/main.jsx`) : sans le paramètre
  `organisation`, l'app s'affiche comme avant. Seuls ajouts dans l'app principale : les deux
  boutons d'accès ; aucun onglet ni hook modifié.

## Rubrique « Organisations »

Pages autonomes, comme `?organisation`, choisies par `resolveStandalonePage`
(`src/utils/standalonePage.js`, testé dans `tests/technical/standalonePage.test.js`) ;
`?organisation` garde la priorité.

| Adresse | Composant | Contenu |
|---------|-----------|---------|
| `?organisations` | `OrganisationsPage.jsx` | Deux cartes : « Évaluer mon organisation » (→ `?organisation`) et « Créer mon organisation » (→ `?creer-organisation`) |
| `?creer-organisation` | `CreateOrganisationPage.jsx` | Assistant « Créer mon organisation » (V1, voir ci-dessous) |

L'évaluation (`OrganisationPage.jsx`, calculs, sauvegarde `localStorage`) n'est pas modifiée.

### Assistant « Créer mon organisation » (V1)

- Public : associations et petites entreprises (jusqu'à 50 personnes). Les autres structures
  sont renvoyées vers l'évaluation.
- Trois questions : type de structure, taille (seul·e, 2 à 10, 11 à 50), approche (« Simple et
  européen », « Confidentialité maximale », « Libre et autonome »).
- Kits choisis à la main dans `src/constants/creationKits.js` : un outil par besoin et par
  approche, avec une phrase d'explication et un coût indicatif (`libre`, `freemium`, `payant`).
  Un besoin apparaît selon la taille (`minSize`), le type (`types`) ou l'approche (`approaches`).
  Les outils de La Suite numérique sont exclus (réservés aux agents publics). Relire les kits
  et mettre à jour `KITS_REVIEWED_AT` quand les offres changent.
- Logique pure dans `src/utils/creationKit.js` (`buildStarterKit`, `mergeKitIntoSelection`),
  testée dans `tests/technical/creationKit.test.js`. Un id absent du catalogue est ignoré.
- Résultat : outils regroupés par étape de mise en place, Trusti Score projeté du kit
  (`computeOrganisationSummary`, sans pondération).
- « Enregistrer ce kit » écrit la sélection dans la sauvegarde de l'évaluation
  (`trusti_organisation_v1`) puis ouvre `?organisation`. Si une évaluation existe déjà, la
  personne choisit : ajouter (rien n'est perdu, criticités et nom conservés) ou remplacer.
- Ni compte, ni formulaire, ni donnée envoyée. Pas de lien commercial avec les éditeurs.
- Navigation : chaque étape est une entrée d'historique (`history.state.trustiCreateOrg`, avec
  les réponses) : le retour revient à la question précédente et un rechargement garde le kit.
- Coûts et descriptions relus aux sources le 2026-11-04 (pages des éditeurs et FAQ ; quelques
  points sur sources secondes concordantes : Bitwarden, Doodle, Brevo, Yousign, Vikunja). À
  relire à chaque révision des kits.

### Bouton retour Android (APK)

Dans le WebView natif, le bouton retour matériel n'émet pas `popstate` et ferme l'app par
défaut. Pour les trois pages autonomes, `src/main.jsx` écoute l'événement Capacitor
`backButton` : retour dans l'historique s'il existe, sinon retour à l'accueil.

## Données

- Colonne `applications.usage_pro BOOLEAN DEFAULT FALSE`, ajoutée le 2026-11-02 sur validation de
  David. 195 apps marquées : catégories professionnelles entières (bureautique, messagerie et
  e-mail, visio, stockage, CRM, comptabilité, RH, signature, sécurité, métiers…) moins quelques
  apps perso ou techniques, plus des apps grand public courantes en entreprise (IA, messageries,
  navigateurs, LinkedIn, Canva…). Liste et règle dans la trace du lot 42 de `trustillm`.
- Marquer ou retirer une app : `UPDATE applications SET usage_pro = TRUE|FALSE WHERE id = '<id>'`
  (validation de David, comme toute écriture). Retour arrière complet :
  `UPDATE applications SET usage_pro = FALSE` ou `ALTER TABLE applications DROP COLUMN usage_pro`.
- API : `GET /api/apps?pro=true` (`getProApps` dans `server/database/service-postgres.js`). Le
  format commun `formatAppFromDB` n'est pas modifié ; la réponse ajoute seulement
  `curatedAlternativeIds` (relations `alternative` de `app_relations`).

## Calculs (`src/utils/organisationAssessment.js`, testés dans `tests/technical/organisationAssessment.test.js`)

- **Familles de besoins** : correspondance catégories → familles dans
  `src/constants/proFamilies.js` (pas de table). Catégorie inconnue → « Autres outils ».
- **Note du parc** : moyenne des notes (A = 4 … E = 0) pondérée par la criticité
  (vitale 3, importante 2 par défaut, secondaire 1), arrondie à la note la plus proche. La note
  brute (sans pondération) est affichée si elle diffère.
- **Indicateurs** : part des outils notés D ou E ; outils vitaux notés D ou E ; part du premier
  éditeur (au moins 2 outils, éditeurs regroupés par premier mot du champ `developer`) ; part
  d'éditeurs européens parmi les fiches où `is_european` est renseigné.
- **Plan d'action** : chaque outil noté C, D ou E, trié par criticité puis note, avec l'alternative
  mieux notée : d'abord parmi les alternatives choisies (`app_relations`), sinon parmi les apps
  mieux notées de la même catégorie ; choix final par `pickRecommendedAlternative`.

## Fiches détail

- Chaque outil sélectionné et chaque alternative du plan d'action ouvre la fiche détail habituelle
  (`AppDetailModal`), affichée par-dessus la page : la position dans la page est conservée et le
  bouton retour du navigateur referme la fiche (entrée d'historique `trustiOrgDetail`).
- Dans ce contexte, la fiche n'a pas de bouton « Mes Apps » : `AppDetailModal` n'affiche ce bouton
  que si `onToggleMyApp` est fourni (toujours le cas dans l'app principale, inchangée).

## Profils d'organisation

- « Votre structure » : association, collectivité, entreprise, santé, enseignement
  (`src/constants/orgProfiles.js`). Le profil choisi ajoute en tête un groupe « Outils fréquents »
  (outils courants dans ce type de structure, pas des recommandations). Liste d'ids d'apps
  « usage pro » ; un id absent du catalogue est ignoré (test dans
  `tests/technical/organisationAssessment.test.js`).

## Rapport PDF

- Bouton « Télécharger le rapport (PDF) » : fichier généré dans le navigateur
  (`src/utils/organisationPdf.js`, bibliothèques `jspdf` et `jspdf-autotable` chargées seulement
  au clic, dans un fichier à part) puis téléchargé directement, sans passer par l'impression.
- Contenu A4 : nom de l'organisation (champ facultatif), profil, date, note, indicateurs, plan
  d'action, annexe des outils, rappel de méthode, pied de page « Page x / n ». Les tableaux
  continuent sur les pages suivantes avec leur en-tête répété.
- Polices standard du PDF : `pdfText` retire les caractères invisibles et remplace ceux hors
  Latin-1. Tests : `tests/technical/organisationPdf.test.js` (rapport de 90 outils sur plusieurs pages).
- Masqué dans l'APK : le téléchargement de fichiers générés n'y est pas encore géré.

## « Il manque un outil »

- Formulaire (nom, site et usage facultatifs, champ piège anti-robot) envoyé à
  `POST /api/suggest-tool` (`api/suggest-tool.js`, validation pure dans `server/toolSuggestion.js`,
  testée dans `tests/server/toolSuggestion.test.js`). Aucune donnée personnelle : ni e-mail ni IP.
- Table `tool_suggestions` (créée le 2026-11-02 à la demande de David) : une ligne par outil
  (`name_key` normalisé), `count` incrémenté à chaque nouvelle demande, `status` (`new` par
  défaut, à passer à `added` ou `rejected` une fois traité). Plafond de 2 000 suggestions
  distinctes en attente (réponse 429 au-delà) pour borner la table en cas de spam.
- Relever les suggestions : `SELECT name, website, comment, count, last_at FROM tool_suggestions
  WHERE status = 'new' ORDER BY count DESC, last_at DESC`. Pas encore d'alerte automatique (le
  secret du webhook n8n n'est pas configuré sur Vercel).

## Stockage et exports

- Sélection et criticités dans `localStorage` (`trusti_organisation_v1`, accès protégés : la page
  marche sans stockage). Rien n'est envoyé au serveur.
- Export CSV (séparateur `;`, BOM UTF-8 pour Excel) et fichier JSON `trusti-organisation`
  rechargeable avec « Ouvrir une évaluation » (ids inconnus et criticités invalides ignorés).

## Limites connues

- L'app principale n'utilise pas `app_relations` pour ses alternatives (règle de catégorie
  seulement) : les relations choisies pendant les lots `trustillm` ne servent qu'à cette page.
