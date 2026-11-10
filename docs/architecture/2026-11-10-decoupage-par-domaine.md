# 2026-11-10 : découpage par domaine du front et de l'accès aux données

**Pour qui / Pourquoi** : pour tout agent ou développeur qui ajoute une fonctionnalité. Trois
fichiers concentraient la logique : `src/App.jsx` (1170 lignes, 21 `useState`),
`src/hooks/useAppManagement.js` (798 lignes, normalisation des apps copiée 6 fois) et
`server/database/service-postgres.js` (1388 lignes). Chaque ajout les faisait grossir, et la
logique la plus sensible (liste affichée, filtres, mise en forme des apps) n'était pas testée.

## Décision

Découper par domaine, **sans changer le comportement ni les interfaces publiques** :

- `App.jsx` ne fait qu'assembler les hooks et choisir l'écran (landing, sélection des apps,
  fiche, stockage, vue à onglets). La navigation reste un état `activeTab`, sans router.
- `useAppManagement` renvoie toujours le même objet ; il assemble des hooks plus petits.
- `service-postgres.js` reste la porte d'entrée unique des routes `api/*.js` (mêmes
  20 fonctions, en export nommé et par défaut) ; c'est une façade.
- La logique sans React ni base de données est extraite en **fonctions pures**, testées par
  `node --test` : c'est là qu'on ajoute la logique métier en priorité.

## Où mettre quoi

### Front (`src/`)

| Fichier | Rôle |
|---|---|
| `App.jsx` | Assemblage et choix de l'écran, rien d'autre |
| `hooks/useAppManagement.js` | Onglet, recherche, listes d'apps (assemble les trois suivants) |
| `hooks/useUserSelections.js` | Mes Apps, favoris, migrations ; sauvegarde locale |
| `hooks/useCatalogApps.js` | Catalogue paginé, chargement complet, « charger plus » |
| `hooks/useRemoteAppLists.js` | Palmarès, données de « Mes Apps » par IDs, recherche |
| `hooks/useOnboardingFlow.js` | Bienvenue, sélection des apps, re-scan, propositions de re-scan |
| `hooks/useMyAppsView.js` | Tri et filtres de « Mes Apps » |
| `hooks/useAppDetail.js` | Ouverture/fermeture de fiche, défilement, reprise de migration |
| `hooks/useShareLinks.js` | Liens `?app=`, `?apps=`, `?mig=` |
| `hooks/useBackNavigation.js` | Retour navigateur et bouton retour Android |
| `utils/appListing.js` | **Pur** : normalisation, choix de l'alternative, liste affichée par onglet |
| `utils/myAppsFilters.js` | **Pur** : filtres migrée / à migrer, avec / sans alternative |

En-têtes et écrans extraits en composants : `CategoryFilterBar`, `MyAppsHeader`,
`AwardsHeader`, `MyAppsFilterNotice`, `AppsSelectionScreen`, `RescanPrompts`,
`layout/SplashScreen`, `ui/InlineSpinner`.

### Serveur (`server/database/`)

| Fichier | Rôle |
|---|---|
| `service-postgres.js` | Façade importée par `api/*.js` |
| `postgres/client.js` | Connexion Neon (`sql`) |
| `postgres/apps-read.js` | Catalogue, palmarès, onboarding, apps pro, recherche, stats |
| `postgres/apps-write.js` | Création, mise à jour, suppression |
| `postgres/relations-store.js` | Relations entre apps (alternatives / remplace) |
| `postgres/app-insights.js` | Évaluations, historique des notes, guides de migration, suggestions |
| `postgres/store-enrichment.js` | Nom, icône et URLs depuis Play Store, F-Droid, App Store |
| `postgres/schema-init.js` | `initDatabase` (tables et index) |
| `postgres/app-format.js` | **Pur** : `formatAppFromDB`, `extractPackageId`, `escapeLike`… |

## Exemples

Ajouter une requête : l'écrire dans le module du domaine, puis l'exposer dans la façade.

```js
// server/database/postgres/apps-read.js
export async function getAppsByDeveloper(developer) {
  const rows = await sql`SELECT * FROM applications WHERE developer = ${developer}`;
  const relations = await buildRelationsMap();
  return rows.map(app => formatAppFromDB(app, relations.get(String(app.id)) || EMPTY_RELATIONS));
}

// server/database/service-postgres.js : ajouter le nom à l'import, à l'export nommé et au défaut
```

Tester une règle d'affichage sans navigateur :

```js
import { computeFilteredApps } from '../../src/utils/appListing.js';
import { TABS } from '../../src/constants/tabs.js';

const list = computeFilteredApps({ activeTab: TABS.MY_APPS, searchTerm: '', /* … */ });
```

Les fichiers importés par les tests utilisent des imports avec extension (`./alternatives.js`),
exigés par Node en ESM.

## Conséquences

- 16 tests ajoutés (`tests/technical/appListing.test.js`, `myAppsFilters.test.js`,
  `tests/server/appFormat.test.js`).
- Le bouton retour pose ses écouteurs une seule fois et lit l'état courant via une ref, au lieu
  de les retirer et remettre à chaque changement d'état (même ordre de priorité).
- Correctif livré au passage : une app supprimée du catalogue est aussi retirée du stockage local.
- Scripts ponctuels de la racine supprimés (toujours dans l'historique git) ; le backfill Play
  Store est dans `scripts/` (`npm run db:backfill-playstore`).
