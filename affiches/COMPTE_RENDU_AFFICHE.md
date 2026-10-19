# Compte Rendu - Création de l'affiche Trusti-Score

## Concept Retenue

### Nom du concept : **"La confiance ne se devine pas, elle se note."**

### Idée visuelle principale

**Métaphore du tableau noir et de la notation scolaire** : Une affiche qui reprend le code visuel d'un tableau d'école avec des notes écrites à la craie. Cette métaphore est particulièrement adaptée car :

1. **Pertinence thématique** : Trusti-Score attribue des notes (A à E) aux applications, tout comme un professeur note ses élèves.
2. **Mémorable** : L'image d'un tableau noir évoque immédiatement l'apprentissage et l'évaluation.
3. **Humain et authentique** : L'utilisation de la craie et du tableau noir donne une impression artisanale, loin des clichés technologiques.
4. **Contraste fort** : Les couleurs vives des notes (vert, orange, rouge) ressortent parfaitement sur le fond noir.

### Accroche

**"La confiance ne se devine pas, elle se note."**

Cette accroche est :
- **Courte** : 7 mots seulement
- **Mémorable** : Structure en chiasme (A-B, B-A) facile à retenir
- **Pertinente** : Résume parfaitement la mission de Trusti-Score
- **Naturelle** : Pas de slogan marketing générique
- **Provocante** : Sous-entend que la confiance aveugle est un problème

## Ressources de marque utilisées

### Couleurs officielles (extrait de `src/styles/index.css`)
- **Bleu nuit** : `#1F3A5F` (utilisé pour le fond du logo et la section invitation)
- **Bleu azur** : `#3B82C4` (utilisé pour les bordures et accents)
- **Fond clair** : `#E9F0F6` (utilisé comme fond de l'affiche)
- **Encre** : `#1B2A3A` (utilisé pour les textes sombres)

### Couleurs des notes (extrait de `src/constants/grades.js`)
- **Note A** : `#006837` (vert foncé)
- **Note B** : `#8dc63f` (vert clair)
- **Note C** : `#fbb03b` (orange)
- **Note D** : `#f7931e` (orange foncé)
- **Note E** : `#c1272d` (rouge)

### Logo
- **Structure** : Réinterprétation du logo avec "Trusti" et "Score" empilés
- **Couleurs** : Fond clair (#E9F0F6) avec texte bleu nuit (#1F3A5F)
- **Étoile** : Ajout d'une étoile bleue (#3B82C4) comme symbole distinctif

### Typographie
- **Police** : Nunito (police utilisée dans le projet, extrait de l'analyse du site)
- **Poids** : 700, 800, 900 pour la hiérarchie visuelle

## Composition de l'affiche

### Structure verticale (1080x1350px)

1. **Haut (150-650px)** : Tableau noir avec accroche et notes
   - Accroche principale en deux parties
   - Notes A-E à la craie colorée
   - Logo Trusti-Score

2. **Milieu (750-950px)** : Section explication
   - Fond blanc avec bordure bleue
   - Texte explicatif sur les 5 critères

3. **Bas (1000-1150px)** : Section invitation
   - Fond bleu nuit
   - URL officielle

4. **Éléments décoratifs** : Craies colorées en bas à gauche

### Hiérarchie visuelle

1. **Accroche** (80px) - Le plus visible
2. **Notes A-E** (120px) - Éléments graphiques dominants
3. **Logo** (32px) - Identifiable mais discret
4. **Explication** (36px/24px) - Informations complémentaires
5. **URL** (28px) - Appel à l'action

## Originalité et conformité aux exigences

### ✅ Respect des interdictions
- **Pas de dégradés bleu-violet** : Utilisation de couleurs pleines et définies
- **Pas de clichés technologiques** : Pas de cerveau, robot, boule lumineuse, etc.
- **Pas de personnages 3D** : Design épuré et graphique
- **Pas d'accumulation d'icônes** : Seules les notes A-E sont mises en avant
- **Pas de template SaaS** : Design unique inspiré des affiches éducatives
- **Pas de faux éléments** : Toutes les informations sont vérifiées

### ✅ Éléments distinctifs
- **Métaphore éducative** : Tableau noir = apprentissage = évaluation
- **Typographie humaine** : Police Nunito avec effets de craie
- **Contraste fort** : Noir/blanc + couleurs vives des notes
- **Texture réaliste** : Effet ardoise et bois pour le tableau
- **Décoration subtile** : Craies colorées en bas

### ✅ Professionnalisme
- **Lisibilité** : Texte clair et bien hiérarchisé
- **Cohérence** : Respect des couleurs de la marque
- **Précision** : URL exacte et vérifiée
- **Accessibilité** : Contraste élevé entre texte et fond

## Limites techniques

### Version SVG
- **Avantages** : Vectoriel, scalable à l'infini, léger (15,5 Ko)
- **Limitations** : Les polices externes (Nunito) nécessitent une connexion internet pour s'afficher correctement dans certains viewers

### Version HTML
- **Avantages** : Fidélité parfaite au rendu, responsive pour prévisualisation
- **Limitations** : Nécessite un navigateur pour l'affichage, taille de fichier plus importante (21,6 Ko)

### Export recommandé
Pour une impression professionnelle :
1. Utiliser la version SVG avec un logiciel comme Inkscape ou Illustrator
2. Ou capturer la version HTML avec html2canvas pour obtenir un PNG haute résolution

## Vérification qualité finale

- ✅ **Accroche compréhensible en 2 secondes** : "La confiance ne se devine pas, elle se note."
- ✅ **Personnalité graphique forte** : Tableau noir + craie + notes colorées
- ✅ **Rendu humain** : Effets de texture, ombres, métaphore éducative
- ✅ **Nom et URL exacts** : Trusti-Score, https://trusti-score.lielu.eu/
- ✅ **Textes lisibles à distance** : Typographie grande et contrastée
- ✅ **Message clair** : L'affiche explique l'intérêt sans surcharger
- ✅ **Informations confirmées** : Basé sur l'analyse du code source et du site
- ✅ **Cohérence avec le projet** : Respect des couleurs, de l'esprit communautaire et éducatif

## Fichiers produits

1. **`affiche-trusti-score.svg`** (15,5 Ko) - Version vectorielle pour impression
2. **`affiche-trusti-score.html`** (21,6 Ko) - Version HTML/CSS pour prévisualisation
3. **`COMPTE_RENDU_AFFICHE.md`** - Ce document

## Comment utiliser

### Pour impression
```bash
# Avec Inkscape (recommandé)
inkscape affiche-trusti-score.svg --export-filename=affiche-trusti-score.pdf --export-type=pdf

# Avec un navigateur (pour PNG)
# Ouvrir affiche-trusti-score.html et utiliser la fonction d'export
```

### Pour partage web
- Utiliser directement le fichier SVG (scalable)
- Ou capturer le HTML en PNG pour les réseaux sociaux

---

**Date de création** : 19 octobre 2024  
**Créateur** : Vibe Code (Mistral AI)  
**Projet** : Trusti-Score - https://trusti-score.lielu.eu/
