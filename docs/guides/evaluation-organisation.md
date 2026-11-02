# Évaluer mon organisation : parc applicatif d'une entreprise ou d'un organisme

**Pour qui / Pourquoi** : toute personne qui touche à la page « Évaluer mon organisation » ou au
marquage « usage pro » du catalogue. La page permet à un DSI ou à un responsable d'organisme de
cocher les outils utilisés dans sa structure et d'obtenir une note globale, des indicateurs et un
plan d'action, sans compte et sans rien envoyer au serveur.

## Accès

- Adresse : `https://<domaine>/?organisation`.
- Points d'entrée : bouton « Évaluer mon organisation » dans l'en-tête (`Header`, libellé dès
  768 px, icône seule sur téléphone) et en bas de la page d'accueil (`LandingPage`). Aussi dans
  l'APK : la page y appelle l'API de production (`API_URL` absolue en natif).
- Page autonome chargée à part (`React.lazy` dans `src/main.jsx`) : sans le paramètre
  `organisation`, l'app s'affiche comme avant. Seuls ajouts dans l'app principale : les deux
  boutons d'accès ; aucun onglet ni hook modifié.

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

## Stockage et exports

- Sélection et criticités dans `localStorage` (`trusti_organisation_v1`, accès protégés : la page
  marche sans stockage). Rien n'est envoyé au serveur.
- Export CSV (séparateur `;`, BOM UTF-8 pour Excel) et fichier JSON `trusti-organisation`
  rechargeable avec « Ouvrir une évaluation » (ids inconnus et criticités invalides ignorés).

## Limites connues

- L'app principale n'utilise pas `app_relations` pour ses alternatives (règle de catégorie
  seulement) : les relations choisies pendant les lots `trustillm` ne servent qu'à cette page.
- Pas encore de rapport PDF.
