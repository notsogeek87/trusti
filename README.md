# TrustiScore

Application web moderne pour évaluer et comparer la fiabilité et la protection de la vie privée des applications numériques.

## 📁 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── layout/          # Composants de mise en page (Header, Navigation)
│   ├── modals/          # Composants modales
│   ├── ui/              # Composants UI réutilisables (Logo, ScoreIndicator, etc.)
│   ├── AppCard.jsx      # Carte d'application dans la liste
│   ├── AppsList.jsx     # Liste d'applications
│   ├── ExplainerPanel.jsx    # Panneau explicatif
│   └── ShareButton.jsx  # Bouton de partage
├── constants/           # Constantes et données
│   ├── appsData.js      # Base de données des applications
│   ├── grades.js        # Configuration des notes A-E
│   └── tabs.js          # Configuration des onglets
├── hooks/               # Hooks React personnalisés
│   ├── useAppManagement.js   # Gestion de l'état des apps
│   └── useModals.js          # Gestion des modales
├── utils/               # Fonctions utilitaires
│   └── shareUtils.js    # Utilitaires de partage
├── styles/              # Styles CSS
│   └── index.css        # Styles globaux et Tailwind
├── App.jsx              # Composant principal
└── main.jsx             # Point d'entrée

```

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build
npm run preview
```

## 🏗️ Architecture

### Composants

- **Layout** : Header, Navigation
- **Modals** : AppDetailModal, ShareModal, TrustiShareModal, MigrationSelectorModal
- **UI** : TrustiLogo, ScoreIndicator, SearchBar
- **Features** : AppCard, AppsList, ExplainerPanel, ShareButton

### Hooks Personnalisés

- **useAppManagement** : Gère l'état global des applications, filtres, et recherche
- **useModals** : Gère l'ouverture/fermeture des différentes modales

### Constantes

- **appsData.js** : Base de données centralisée des applications
- **grades.js** : Configuration des notes et couleurs
- **tabs.js** : Configuration des onglets de navigation

### Utilitaires

- **shareUtils.js** : Fonctions de partage et copie dans le presse-papiers

## 🎨 Technologies

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes

## 📝 Bonnes Pratiques Implémentées

✅ Séparation des préoccupations (components, hooks, constants, utils)
✅ Composants réutilisables et modulaires
✅ Hooks personnalisés pour la logique métier
✅ Constantes centralisées
✅ Documentation JSDoc
✅ Structure de dossiers claire et scalable
✅ Nommage cohérent et explicite
