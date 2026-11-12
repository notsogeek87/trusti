# Apps des mairies et collectivités à ajouter au catalogue (2026-11)

Statut : **écrit en base le 2026-11-12** (lot 49 de `trustillm`, validé par David), voir la section « Écriture » en bas. Chaque fiche demande une note
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
| `segilog` | Ségilog (Berger-Levrault) | Berger-Levrault | Gestion municipale | Société Ségilog radiée en 2023, rattachée à Berger-Levrault : fiche à garder sous ce nom (connu des mairies) ou à fusionner |
| `arpege` | Arpège | Arpège | Gestion municipale | État civil, élections, enfance |
| `logitud` | Logitud | Logitud Solutions | Gestion municipale | Police municipale, état civil |
| `openmairie` | OpenMairie | Communauté OpenMairie | Gestion municipale | Logiciels libres (openElec, openCimetière, openADS…) ; alternative du kit « libre » |
| `i-parapheur` | i-Parapheur | Libriciel SCOP | Dématérialisation | Libre ; choix du kit mairie |
| `s2low` | S²LOW | Libriciel SCOP / ADULLACT | Dématérialisation | Télétransmission des actes |
| `chorus-pro` | Chorus Pro | AIFE (État) | Dématérialisation | Badge « Service de l'État » |
| `demarches-simplifiees` | Démarches simplifiées | DINUM | Démarches en ligne | Badge « Service de l'État » ; choix du kit mairie. Fermé aux nouvelles collectivités depuis le 1er février 2021 ; proposé aux collectivités par l'ADULLACT (adhérents) |
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

## Notes proposées (2026-11-11, en attente de validation)

Calcul `trustiscore_pipeline.cli score` du dépôt `trustillm`, grille site-config-v8
(vérifiée identique à la config du site). Presque tout est provisoire : voir le tableau
de la conversation et la trace du lot, écrite après validation.

| id | Contrôle | Conform. | Gouv. | Local. | Transp. | Score | Note |
|---|---|---|---|---|---|---|---|
| `berger-levrault-emagnus` | 1 | 3 | 4 | 3 | 2 | 66 | B |
| `segilog` | 1 | 3 | 4 | 3 | 2 | 66 | B |
| `arpege` | 1 | 3 | 4 | 3 | 2 | 66 | B |
| `jvs-horizon` | 1 | 2 | 4 | 3 | 2 | 61 | B (limite) |
| `cosoluce` | 1 | 2 | 4 | 3 | 2 | 61 | B (limite) |
| `logitud` | 1 | 2 | 4 | 3 | 2 | 61 | B (limite) |
| `ciril-group` | 1 | 3 | 0 | 4 | 3 | 56 | C (B 66 si gouvernance 2) |
| `openmairie` | 4 | 2 | 4 | 4 | 3 | 86 | A |
| `i-parapheur` | 4 | 2 | 4 | 3 | 3 | 80 | A (limite) |
| `s2low` | 4 | 2 | 4 | 3 | 3 | 80 | A (limite) |
| `chorus-pro` | 2 | 3 | 4 | 4 | 3 | 81 | A (limite) |
| `demarches-simplifiees` | 4 | 4 | 4 | 4 | 3 | 96 | A |
| `france-transfert` | 2 | 4 | 4 | 4 | 3 | 86 | A |
| `panneaupocket` | 1 | 2 | 4 | 3 | 2 | 61 | B (limite) |
| `intramuros` | 1 | 2 | 4 | 3 | 2 | 61 | B (limite) |
| `illiwap` | 1 | 2 | 4 | 3 | 2 | 61 | B (limite) |
| `matomo` | 4 | 3 | 1 | 4 | 3 | 76 | B (A 91 si gouvernance 4) |
| `framadate` | 4 | 2 | 4 | 4 | 3 | 86 | A |

## Écriture (2026-11-12)

18 fiches créées avec `usage_pro = true`, notes calculées validées (PanneauPocket B 68 après lecture
des mentions légales : hébergement OVHcloud et Scaleway). 16 relations, détail des 5 critères exporté
(`app_assessments`, `app_assessment_history`). Catégories finales : France Transfert en
« Outils / Envoi de fichiers » (pas « Outils / Transfert », qui contient Quick Share), Matomo en
« Sites web & E-commerce / Mesure d'audience ». Icônes manquantes : Cosoluce et OpenMairie (sites injoignables).
Trace : `trustiscore_pipeline/data/assessments/2026-11-12_lot49_collectivites.json` (dépôt `trustillm`).
