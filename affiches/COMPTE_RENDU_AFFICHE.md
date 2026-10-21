# Affiche Trusti-Score

**Accroche** : « La confiance ne se devine pas, elle se note. »

**Visuel** : un tableau noir à cadre en bois avec les notes A à E (vert → rouge), un encart explicatif et un bandeau d'appel à l'action vers `trusti.lielu.eu`.

## Fichiers

- `affiche-trusti-score.html` : source de l'affiche (1080×1350 px, HTML/CSS seul, aucune dépendance externe).
- `affiche-trusti-score.png` : rendu 1080×1350 px, généré depuis le HTML.
- `affiche-trusti-score.svg` : ancienne version vectorielle, **obsolète et défectueuse** (texte minuscule, accents cassés). À supprimer.

## Régénérer le PNG

Ouvrir le HTML dans Chromium en fenêtre 1080×1350 et faire une capture d'écran (par exemple avec Playwright : `page.setViewportSize({ width: 1080, height: 1350 })` puis `page.screenshot()`).

## Couleurs

- Marque : bleu nuit `#1F3A5F`, fond `#E9F0F6`, encre `#1B2A3A`.
- Notes : A `#2E9E5B`, B `#8dc63f`, C `#fbb03b`, D `#f7931e`, E `#e5484d` (versions éclaircies de `src/constants/grades.js` pour rester lisibles sur fond noir).

## Historique

La première version (commit `02a2aba`) était défectueuse : texte illisible, accents remplacés par des carrés, notes absentes du tableau. Elle a été refaite.
