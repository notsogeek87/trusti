// Tri de la liste "Mes Apps" : réglage discret (persisté en local) permettant
// de choisir le critère de tri et son sens, en plus du tri par défaut
// (TrustiScore, du plus risqué au plus sûr) déjà en place historiquement.
const MY_APPS_SORT_KEY = 'trusti_my_apps_sort';

// Rang du grade pour le tri : A (meilleur) = 1 ... E (pire) = 5.
// En "décroissant" (réglage par défaut), on obtient E, D, C, B, A — c'est le
// tri historique de l'onglet, conservé tel quel.
const GRADE_RANK = { A: 1, B: 2, C: 3, D: 4, E: 5 };

export const SORT_OPTIONS = [
  { id: 'trustiScore', label: 'TrustiScore', defaultDirection: 'desc' },
  { id: 'category', label: 'Catégorie', defaultDirection: 'asc' },
  { id: 'alphabetical', label: 'Alphabétique', defaultDirection: 'asc' },
  { id: 'dateAdded', label: "Date d'ajout", defaultDirection: 'desc' },
  { id: 'popularity', label: 'Popularité', defaultDirection: 'asc' },
  // Uniquement pertinent là où `app.sizeBytes` est renseigné (écran "Espace de
  // stockage", voir StoragePage) — ailleurs, absent sur toutes les apps, il se
  // rabat silencieusement sur l'ordre alphabétique (voir sortMyApps ci-dessous).
  { id: 'size', label: 'Taille', defaultDirection: 'desc' },
];

export const DEFAULT_MY_APPS_SORT = { sortBy: 'trustiScore', direction: 'desc' };

export const getMyAppsSortPref = () => {
  try {
    const raw = localStorage.getItem(MY_APPS_SORT_KEY);
    if (!raw) return DEFAULT_MY_APPS_SORT;
    const parsed = JSON.parse(raw);
    const sortBy = SORT_OPTIONS.some(({ id }) => id === parsed.sortBy)
      ? parsed.sortBy
      : DEFAULT_MY_APPS_SORT.sortBy;
    const direction = parsed.direction === 'asc' ? 'asc' : 'desc';
    return { sortBy, direction };
  } catch {
    return DEFAULT_MY_APPS_SORT;
  }
};

export const setMyAppsSortPref = (pref) => {
  try {
    localStorage.setItem(MY_APPS_SORT_KEY, JSON.stringify(pref));
  } catch {
    // localStorage indisponible (navigation privée stricte) : le réglage ne
    // sera pas mémorisé, tant pis, l'app reste fonctionnelle.
  }
};

// `addedOrder` : Map id(string) -> index d'insertion dans le Set "Mes Apps",
// utilisée pour reconstituer l'ordre d'ajout (le Set ne garde pas de date,
// mais préserve l'ordre d'insertion).
export const sortMyApps = (apps, { sortBy, direction } = DEFAULT_MY_APPS_SORT, addedOrder) => {
  const sign = direction === 'asc' ? 1 : -1;
  const compareName = (a, b) => (a.name || '').localeCompare(b.name || '', 'fr');

  return [...apps].sort((a, b) => {
    if (a.isLoadingSkeleton || b.isLoadingSkeleton) return 0;

    let cmp = 0;
    switch (sortBy) {
      case 'category':
        cmp = (a.category || '').localeCompare(b.category || '', 'fr');
        break;
      case 'alphabetical':
        cmp = compareName(a, b);
        break;
      case 'dateAdded': {
        const orderA = addedOrder?.get(String(a.id)) ?? 0;
        const orderB = addedOrder?.get(String(b.id)) ?? 0;
        cmp = orderA - orderB;
        break;
      }
      case 'popularity': {
        const popA = a.popularity ?? 9999;
        const popB = b.popularity ?? 9999;
        cmp = popA - popB;
        break;
      }
      case 'size': {
        const sizeA = a.sizeBytes ?? -1;
        const sizeB = b.sizeBytes ?? -1;
        cmp = sizeA - sizeB;
        break;
      }
      case 'trustiScore':
      default:
        cmp = (GRADE_RANK[a.grade] || 0) - (GRADE_RANK[b.grade] || 0);
        break;
    }

    if (cmp !== 0) return cmp * sign;
    return compareName(a, b);
  });
};
