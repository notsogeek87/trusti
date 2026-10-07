# Hygiène numérique (ligne de la carte bilan « Mes Apps »)

**Pour qui :** les mainteneurs qui veulent faire évoluer le contenu ou la logique de la carte.
**Pourquoi :** Trusti ne se limite pas à noter les apps, elle rappelle aussi les bonnes pratiques de gestion des mots de passe et propose des gestionnaires fiables.

## Ce que voit l'utilisateur

Sous le TrustiScore du téléphone (onglet « Mes Apps », hors recherche, si au moins une app suivie) :

- une **ligne compacte** intégrée à la carte du TrustiScore (même bloc, séparée par un filet) : statut court du gestionnaire de mots de passe (en orange s'il faut agir) et pastille `x/5` (verte à 5/5). Pas de carte séparée ni de bouton de masquage, pour ne pas empiler les blocs au-dessus de la liste ;
- une **fiche** (au tap) : bilan cochable, six bons réflexes, trois gestionnaires conseillés avec leur note Trusti.

Le conseil dépend des apps de « Mes Apps » :

| Situation détectée | Message |
|---|---|
| Gestionnaire dédié (catégorie `Gestionnaires de Mots de Passe` ou paquet connu) | « Bitwarden détecté » |
| Déclaré manuellement (case du bilan dans la fiche) | « Gestionnaire déclaré » |
| Seul Google Password (gestionnaire d'écosystème) | « … : préférez un indépendant » (orange) |
| Aucun | « Aucun gestionnaire de mots de passe » (orange) |

Le conseil détaillé, la déclaration manuelle (case « gestionnaire » du bilan) et les suggestions sont dans la fiche.

Tous les textes existent en version adulte et en version -15 ans (`useAgeMode`).

## Code

| Fichier | Rôle |
|---|---|
| `src/constants/dataHygiene.js` | Textes, gestionnaires recommandés, paquets connus, cases du bilan |
| `src/utils/passwordManagers.js` | Logique pure : `detectPasswordManagers`, `buildManagerSuggestions`, `computeHygiene` |
| `src/utils/hygieneStorage.js` | Lecture/écriture de l'état local |
| `src/components/DataHygieneCard.jsx` | Ligne compacte, passée en `children` de `MyAppsSummary` dans `App.jsx` |
| `src/components/modals/DataHygieneModal.jsx` | Fiche détaillée |
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
  pitchKid: 'Argument -15 ans.',
  url: 'https://play.google.com/store/apps/details?id=com.example.manager',
}
```

Ajouter une case au bilan (`HYGIENE_CHECKS`) : `{ id, label, labelKid }`. Le score `x/N` s'adapte automatiquement.

## Règles éditoriales

- Liens **officiels** uniquement (Play Store, site de l'éditeur), jamais d'affiliation : la neutralité du TrustiScore prime.
- Ne jamais demander à l'utilisateur de saisir un mot de passe dans Trusti.
- Les notes viennent du catalogue ; un gestionnaire absent du catalogue s'affiche sans note.
