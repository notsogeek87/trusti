# Apps des mairies et collectivités à ajouter au catalogue (2026-11)

Statut : **proposition, rien n'est écrit en base.** Chaque fiche demande une note
TrustiScore (skill `trusti-update-score`), une icône, le détail des 5 critères et
`usage_pro = true`, puis la validation de David avant tout INSERT
(procédure : skill `ajout-alternative-trusti`).

Les ids ci-dessous sont déjà référencés dans le code (profil « Collectivité »
de `src/constants/orgProfiles.js`, kit mairie de `src/constants/creationKits.js`,
badge de `src/constants/publicServices.js`). Tant qu'une fiche n'existe pas,
l'id est ignoré et le kit affiche un conseil écrit à la place.

## Catégories créées

| Catégorie | Contenu |
|---|---|
| `Collectivités / Gestion municipale` | état civil, élections, finances, paie, cimetière, urbanisme |
| `Collectivités / Dématérialisation` | parapheur, télétransmission des actes, facturation publique |
| `Collectivités / Démarches en ligne` | formulaires et téléservices pour les habitants |
| `Collectivités / Information des habitants` | applications d'information et d'alerte |

Famille « Logiciels des mairies et collectivités » dans `src/constants/proFamilies.js`.

## Fiches à créer

| id | Nom | Éditeur (à vérifier) | Catégorie | Remarque |
|---|---|---|---|---|
| `berger-levrault-emagnus` | Berger-Levrault e.magnus | Berger-Levrault | Gestion municipale | Éditeur dominant ; à remplacer, alternatives `openmairie`, offre des OPSN |
| `jvs-horizon` | JVS-Mairistem Horizon | JVS-Mairistem | Gestion municipale | Très présent dans les petites communes |
| `cosoluce` | Cosoluce | Cosoluce | Gestion municipale | |
| `ciril-group` | Ciril GROUP (Civil Net) | Ciril GROUP | Gestion municipale | |
| `segilog` | Ségilog | Ségilog | Gestion municipale | |
| `arpege` | Arpège | Arpège | Gestion municipale | État civil, élections, enfance |
| `logitud` | Logitud | Logitud Solutions | Gestion municipale | Police municipale, état civil |
| `openmairie` | OpenMairie | Communauté OpenMairie | Gestion municipale | Logiciels libres (openElec, openCimetière, openADS…) ; alternative du kit « libre » |
| `i-parapheur` | i-Parapheur | Libriciel SCOP | Dématérialisation | Libre ; choix du kit mairie |
| `s2low` | S²LOW | Libriciel SCOP / ADULLACT | Dématérialisation | Télétransmission des actes |
| `chorus-pro` | Chorus Pro | AIFE (État) | Dématérialisation | Badge « Service de l'État » |
| `demarches-simplifiees` | Démarches simplifiées | DINUM | Démarches en ligne | Badge « Service de l'État » ; choix du kit mairie |
| `panneaupocket` | PanneauPocket | PanneauPocket | Information des habitants | Choix du kit mairie ; alternative de `facebook` |
| `intramuros` | IntraMuros | à vérifier | Information des habitants | Alternative de `facebook` |
| `illiwap` | Illiwap | à vérifier | Information des habitants | Alternative de `facebook` |
| `matomo` | Matomo | InnoCraft | Sauvegarde & Supervision / Supervision (à confirmer) | Choix du kit « libre » pour le site |
| `france-transfert` | France Transfert | DINUM | Outils / Transfert | Badge « Service de l'État » |
| `framadate` | Framadate | Framasoft | Productivité / Rendez-vous | Alternative de `doodle` |

## Relations proposées

- `facebook` → alternative → `panneaupocket`, `intramuros`, `illiwap` (usage « page de la commune »)
- `berger-levrault-emagnus`, `jvs-horizon`, `cosoluce`, `segilog` → alternative → `openmairie`
- `doodle` → alternative → `framadate`
