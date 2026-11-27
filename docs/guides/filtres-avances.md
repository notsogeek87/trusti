# Filtres avancés du catalogue

Pastilles « Filtres avancés » sous les catégories de l'onglet Catalogue : on cumule des **profils**
(ET logique) avec la recherche et la catégorie.

| Profil | Clé | Règle (fiche factuelle `app_assessments.facts`) |
|---|---|---|
| Hors CLOUD Act | `hors_cloud_act` | `juridique.cloud_act` = `non_expose` |
| Données dans l'UE | `donnees_europe` | `technique.hebergement` en FR / UE / sur l'appareil ; aucune sauvegarde ni transfert hors UE connu |
| Respect de la vie privée | `vie_privee` | `rgpd.dpo`, `rgpd.base_legale`, `rgpd.suppression_donnees` favorables (ou non applicables) ; aucun transfert hors UE connu |
| Open source | `open_source` | `applications.is_open_source` |
| Certifiée | `certifiee` | au moins une certification trouvée (SecNumCloud, ISO 27001, HDS, SOC 2, sectorielle) |

- **Pas de « conforme au RGPD »** : les profils listent des faits observés, avec la même lecture que
  les points de couleur de la fiche (`factTone`). Une mention le rappelle sous les filtres.
- **Données non vérifiées** : une donnée `inconnu`, non renseignée, ou lue seulement sur le site de
  l'éditeur (`scope: 'site'`) ne valide pas un profil. L'option « Inclure les apps aux données non
  vérifiées » les ajoute (jamais une app dont une donnée est défavorable). Sans effet sur
  « Open source » et « Certifiée ».
- **Lien partageable** : `?f=hors_cloud_act,open_source` (et `&fu=1` pour les non vérifiées). Ouvrir
  ce lien affiche directement le catalogue filtré ; le bouton « Partager » le génère.

## Code

- `src/utils/appProfiles.js` : règles des profils, index, paramètres d'URL (pur, testé dans
  `tests/server/appProfiles.test.js`). Importé par le serveur : le `Dockerfile` copie ce fichier et
  `src/constants/assessmentFacts.js` dans l'image d'exécution.
- `GET /api/apps?profiles=index` (`getProfileIndex`, `server/database/postgres/app-insights.js`).
- Front : `useAppProfiles` (état, URL, index en cache), `ProfileFilterBar`, filtrage dans
  `computeFilteredApps` (le catalogue est chargé en entier dès qu'un filtre est actif).

Ajouter un profil : une entrée dans `APP_PROFILES`, une icône dans `ProfileFilterBar`, les libellés
`ui.profiles.items.<clé>` dans les 8 langues, un test.
