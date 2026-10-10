# Hygiène numérique (pastille de la carte bilan « Mes Apps »)

**Pour qui :** les mainteneurs qui veulent faire évoluer le contenu ou la logique de la carte.
**Pourquoi :** Trusti ne se limite pas à noter les apps, elle rappelle aussi les bonnes pratiques de gestion des mots de passe et propose des gestionnaires fiables.

## Ce que voit l'utilisateur

Sous le TrustiScore du téléphone (onglet « Mes Apps », hors recherche, si au moins une app suivie) :

- une **pastille** `Hygiène x/5` (icône clé) dans le pied de la carte du TrustiScore, à côté du compteur de migrations : orange si aucun gestionnaire indépendant n'est utilisé, verte à 5/5, indigo sinon. Le statut détaillé est dans l'infobulle et le libellé accessible. Pas de carte séparée, pour ne pas empiler les blocs au-dessus de la liste ;
- une **fiche** (au tap) : bilan cochable, six bons réflexes, trois gestionnaires conseillés avec leur note Trusti.

Le bilan est aussi demandé **en fin de scan** (onboarding et re-scan manuel, natif comme sélection à la main) : après l'écran du TrustiScore, une étape « Et vos comptes, bien protégés ? » propose les cases du bilan, pré-remplies avec les réponses existantes ; le gestionnaire détecté parmi les apps scannées est coché d'office. Pas d'étape si aucune app n'est sélectionnée.

Le statut (infobulle de la pastille) dépend des apps de « Mes Apps » :

| Situation détectée | Message |
|---|---|
| Gestionnaire dédié (catégorie `Gestionnaires de Mots de Passe` ou paquet connu) | « Bitwarden détecté » |
| Déclaré manuellement (case du bilan dans la fiche) | « Gestionnaire déclaré » |
| Seul Google Password (gestionnaire d'écosystème) | « … : un gestionnaire indépendant est conseillé » (orange) |
| Aucun | « Aucun gestionnaire de mots de passe » (orange) |

Le conseil détaillé, la déclaration manuelle (case « gestionnaire » du bilan) et les suggestions sont dans la fiche.

Les textes n'existent qu'en une version (le mode -15 ans a été retiré).

## Code

| Fichier | Rôle |
|---|---|
| `src/constants/dataHygiene.js` | Textes, gestionnaires recommandés, paquets connus, cases du bilan |
| `src/utils/passwordManagers.js` | Logique pure : `detectPasswordManagers`, `buildManagerSuggestions`, `computeHygiene` |
| `src/utils/hygieneStorage.js` | Lecture/écriture de l'état local |
| `src/components/DataHygieneCard.jsx` | Pastille, passée en `children` de `MyAppsSummary` (pied de carte) dans `App.jsx` |
| `src/components/modals/DataHygieneModal.jsx` | Fiche détaillée |
| `src/components/OnboardingHygiene.jsx` | Étape bilan de fin de scan, affichée par `OnboardingSummary` |
| `tests/technical/passwordManagers.test.js` | Tests de la logique pure |

## Données et vie privée

L'état (cases cochées) est stocké **uniquement** dans le `localStorage`, clé `trusti_hygiene`. Rien n'est envoyé au serveur. Il est effacé par « Vider le stockage » (préfixe `trusti_`) mais n'est pas inclus dans l'export/import.

## Exemples

Ajouter un gestionnaire recommandé (`RECOMMENDED_MANAGERS`) :

```js
{
  key: 'mon-gestionnaire',
  name: 'Mon Gestionnaire',          // doit correspondre au nom du catalogue pour afficher la note
  packageId: 'com.example.manager',  // identifiant Play Store
  pitch: 'Argument adulte.',
  url: 'https://play.google.com/store/apps/details?id=com.example.manager',
}
```

Ajouter une case au bilan (`HYGIENE_CHECKS`) : `{ id, label }`. Le score `x/N` s'adapte automatiquement.

## Règles éditoriales

- Liens **officiels** uniquement (Play Store, site de l'éditeur), jamais d'affiliation : la neutralité du TrustiScore prime.
- Ne jamais demander à l'utilisateur de saisir un mot de passe dans Trusti.
- Les notes viennent du catalogue ; un gestionnaire absent du catalogue s'affiche sans note.
