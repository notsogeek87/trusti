# 2026-11-26 : points de couleur des critères, alignés sur les barres

**Pour qui / Pourquoi** : pour comprendre ce que veulent dire les points de couleur sous chaque critère
du détail d'évaluation, et pourquoi ils ne reprennent pas toujours la barre de niveau.

## Contexte

Chaque critère du détail d'évaluation (`src/components/assessment/AssessmentDetail.jsx`) affiche :

- une **barre de niveau** (0 à 4 segments) : la note du critère, un jugement d'ensemble ;
- des **points de couleur** (`FactDots`) : un point par donnée vérifiée de la fiche factuelle rattachée au
  critère (`CRITERION_FACTS`).

Signalé sur Brave : Contrôle technique 3/4 avec seulement un point rouge et un point jaune. Les points ne
montraient que l'infrastructure (AWS) et les sous-traitants (inconnus), pas l'open source qui fait monter la
note. Un audit des 581 évaluations a trouvé environ 8 % de critères où barre et points semblaient se
contredire, pour trois raisons : ce qui pèse le plus dans la note n'avait pas de point, une même donnée
comptait deux fois, et beaucoup de données restaient `inconnu`.

## Décision

Les points ne reproduisent pas la note (ce sont des faits isolés), mais ils ne doivent plus la contredire
visiblement. Règles dans `src/constants/assessmentFacts.js` (`factTone`, `factToneInContext`,
`APP_CRITERION_FACTS`, `MERGED_CRITERION_FACTS`) et `src/utils/assessmentFacts.js` (`buildCriterionFacts`) :

| Règle | Effet |
|---|---|
| **Code source** en tête du Contrôle technique, tiré de la fiche de l'app (`isOpenSource`, `license`) | vert si open source (licence en détail) ; rouge « Propriétaire » **seulement si `license` est renseignée** ; sinon « Non renseigné ». `is_open_source` vaut `false` par défaut en base, ce n'est pas une preuve. |
| **Contrôle étranger : non** | vert seulement si le siège est dans l'UE/EEE ; neutre sinon (une société américaine non contrôlée reste soumise au CLOUD Act). |
| **Transferts** (`transferts_internationaux` et `transferts_hors_ue`) fusionnés en un point en Localisation | orange si l'hébergement reste en UE, en France, sur l'appareil ou en pays adéquat (Suisse) ; rouge si l'hébergement est déjà hors UE. |
| **Certifications inconnues** | gris (souvent sans objet pour une app grand public), plus jaune. |
| **Durée de conservation non chiffrée** | orange (à surveiller) : « tant que nécessaire » reste conforme au RGPD, et presque aucun grand éditeur ne chiffre ses durées. |

Côté données (dépôt `trustillm`) :

- 361 apps marquées « Propriétaire » dans `applications.license` quand la justification du Contrôle le disait
  explicitement ; 15 apps marquées open source avec leur licence ;
- les fiches sont complétées par lecture des politiques officielles, par lots
  (`trustillm/docs/guides/completer-les-fiches-factuelles.md`).

## Conséquences

- Une note qui contredit des faits trouvés est signalée et renotée seulement après validation de David
  (Netflix et Docusign : Conformité 3 → 2, Docusign C → D).
- Toute nouvelle donnée de `facts.json` doit être rattachée à un critère dans `CRITERION_FACTS` et avoir sa
  lecture (couleur) dans `factTone` ; les tests `tests/technical/assessmentFacts.test.js` le vérifient.
- Les points restent gris ou jaunes tant que la fiche n'est pas complétée : ce n'est pas une contradiction,
  c'est une donnée manquante.
