# AGENTS.md - Guide pour les agents IA sur Trusti

Ce fichier standardise l'interaction avec tous les agents IA (Vibe Code, Claude Code, etc.) travaillant sur le projet Trusti.

---

## 🤖 Rôle des agents dans ce projet

### Vibe Code (Mistral AI)
- **Rôle principal** : Développement, refactoring, fix de bugs, optimisation de code
- **Accès** : Sandbox complet avec exécution de commandes
- **Capacités** : Peut lire/écrire des fichiers, exécuter des commandes bash, utiliser git
- **Objectif** : Implémenter des features, corriger des bugs, améliorer la qualité du code

### Claude Code (Anthropic)
- **Rôle principal** : Analyse de code, review, suggestions d'amélioration
- **Accès** : Lecture seule (d'après la configuration existante dans `.claude/context.md`)
- **Capacités** : Analyse statique, compréhension du codebase, suggestions
- **Objectif** : Review de PR, analyse de sécurité, optimisation d'architecture

### Autres agents
- **GitHub Copilot** : Autocomplétion et suggestions inline
- **Autres** : À documenter ici si ajouté

---

## 📋 Tâches récurrentes par agent

### Pour Vibe Code (Mistral) ✅

| Catégorie | Tâches | Priorité |
|----------|--------|----------|
| **Bugfix** | Corriger des bugs dans `src/components/` | Haute |
| **Bugfix** | Corriger des bugs dans `api/*.js` ou `server/*.js` | Haute |
| **Refactor** | Découper `src/App.jsx` (631L) en composants/hooks | Haute |
| **Refactor** | Découper `server/index.js` (740L) en modules | Haute |
| **Feature** | Ajouter de nouvelles routes API dans `api/` | Moyenne |
| **Feature** | Ajouter de nouveaux composants React | Moyenne |
| **Docs** | Mettre à jour la documentation dans `docs/` | Moyenne |
| **Chore** | Nettoyer les scripts racine (test-*.js, fix-icons-*.js) | Basse |
| **Chore** | Mettre à jour les dépendances dans `package.json` | Basse |

### Pour Claude Code ✅

| Catégorie | Tâches | Priorité |
|----------|--------|----------|
| **Review** | Review de PR avant merge | Haute |
| **Sécurité** | Analyse de sécurité du code | Haute |
| **Architecture** | Optimisation des requêtes SQL | Moyenne |
| **Architecture** | Review de l'architecture globale | Moyenne |
| **Docs** | Vérifier la cohérence de la documentation | Moyenne |

---

## 🚫 INTERDICTIONS ABSOLUES (pour TOUS les agents)

### ❌ Ne JAMAIS modifier

| Fichier/Path | Raison | Conséquence |
|--------------|--------|--------------|
| `android/app/debug.keystore` | Clé de signature debug Android | Brise la signature des APK |
| `capacitor.config.json` (sauf validation) | Configuration Capacitor | Brise le build Android |
| `.github/workflows/*.yml` (sauf validation) | CI/CD GitHub Actions | Brise le déploiement |
| `API_KEY` ou `DATABASE_URL` dans les fichiers | Sécurité | Fuite de credentials |
| `android/gradle.properties` | Versioning Android | Brise le versioning APK |

### ❌ Ne JAMAIS faire

| Action | Raison | Alternative |
|--------|--------|-------------|
| Pousser directement sur `main` | Branche protégée | Toujours via PR |
| Force push (`git push --force`) | Perte d'histoire | Utiliser `--force-with-lease` si vraiment nécessaire |
| Supprimer des workflows GitHub | Brise la CI/CD | Désactiver via UI GitHub |
| Modifier les tags Git | Brise le versioning | Créer de nouveaux tags |
| Changer `appId` dans Capacitor | Brise l'identité de l'app | Garder `eu.trusti.app` |

---

## ✅ Bonnes pratiques (pour TOUS les agents)

### Git
- ✅ **Toujours créer une branche** pour les changements : `feature/xxx`, `fix/xxx`, `refactor/xxx`
- ✅ **Commits atomiques** : Un commit = une seule logique de changement
- ✅ **Messages de commit clairs** : `[type] description` (ex: `feat: add search filter`)
- ✅ **PR avec description détaillée** : Expliquer le pourquoi et le comment
- ✅ **Rebaser sur main** avant de merger une PR

### Code
- ✅ **Respecter les conventions** du projet (voir ci-dessous)
- ✅ **Toujours tester** : `npm test` avant de commiter
- ✅ **Vérifier le build** : `npm run build` avant de commiter
- ✅ **Tester Android** : `npm run cap:sync` si changement frontend
- ✅ **Documenter** : Mettre à jour `docs/` si changement d'architecture

### Sécurité
- ✅ **Ne jamais commiter de secrets** : Vérifier `.env`, `.env.local`
- ✅ **Utiliser des variables d'environnement** pour les credentials
- ✅ **Valider les entrées utilisateur** : Toujours sanitize/validate
- ✅ **Éviter les dépendances inutiles** : Vérifier `package.json`

---

## 📝 Conventions du projet

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants React | PascalCase | `AppCard.jsx`, `ScoreIndicator.jsx` |
| Hooks React | `use` + PascalCase | `useAppManagement.js`, `useAuth.js` |
| Constantes | UPPER_SNAKE_CASE | `APP_CATEGORIES`, `TRUSTI_GRADES`, `API_URL` |
| Variables/Fonctions | camelCase | `getAppById()`, `currentUser` |
| Fichiers | kebab-case | `app-card.jsx`, `use-app-management.js` |
| Dossiers | kebab-case | `components/`, `hooks/`, `utils/` |

### Organisation

```
src/
├── components/           # Composants React (PascalCase)
│   ├── layout/          # Composants de layout
│   ├── modals/          # Composants modaux
│   ├── ui/              # Composants UI réutilisables
│   └── *.jsx           # Autres composants
├── hooks/               # Hooks personnalisés (use*.js)
├── constants/           # Constantes (UPPER_SNAKE_CASE)
├── utils/               # Fonctions utilitaires
└── styles/              # Styles (Tailwind uniquement)

api/                    # Routes serverless Vercel
├── *.js                # Une route = un fichier

server/                 # Backend Express (dev)
├── index.js             # Point d'entrée (à découper)
└── database/           # Accès base de données
```

### Style de code

- **Pas de Redux** : Utiliser React hooks + localStorage
- **Pas de router** : Navigation par `activeTab` state dans `App.jsx`
- **Pas de CSS modules** : Uniquement Tailwind CSS
- **Mobile-first** : Toujours penser mobile en premier
- **Memoization** : `React.memo` pour les composants dans des listes
- **Types** : JSDoc pour l'autocomplétion (pas de TypeScript natif)

---

## 🎯 Configuration spécifique par agent

### Pour Vibe Code

**Fichier de configuration** : `.vibe/instructions.md` (priorité maximale)

**Comportement attendu** :
- Lire `.vibe/instructions.md` en premier
- Respecter les restrictions listées
- Demander validation pour les changements critiques
- Toujours vérifier l'impact avant de modifier

**Fichiers de référence** :
1. `.vibe/instructions.md` - Instructions principales
2. `.vibe/config.json` - Configuration fine (si existe)
3. `AGENTS.md` - Ce fichier

### Pour Claude Code

**Fichier de configuration** : `.claude/context.md`

**Comportement attendu** :
- Lire `.claude/context.md` en premier
- Respecter les restrictions listées
- Se concentrer sur l'analyse et la review
- Ne pas modifier de code sans validation

**Fichiers de référence** :
1. `.claude/context.md` - Contexte principal
2. `AGENTS.md` - Ce fichier

---

## 🔍 Checklist avant modification

### Pour TOUS les agents

- [ ] J'ai lu et compris `AGENTS.md`
- [ ] J'ai vérifié les restrictions dans la section 🚫
- [ ] Je connais le rôle spécifique de mon agent
- [ ] J'ai identifié les fichiers concernés par ma tâche

### Pour Vibe Code (avant de coder)

- [ ] J'ai lu `.vibe/instructions.md`
- [ ] J'ai vérifié que ma tâche est dans mes responsabilités
- [ ] J'ai identifié les pièges à éviter pour cette tâche
- [ ] J'ai une stratégie claire pour implémenter la solution
- [ ] J'ai vérifié que je ne vais pas casser le build

### Pour Vibe Code (avant de commiter)

- [ ] `npm test` passe ✅
- [ ] `npm run build` fonctionne ✅
- [ ] Si frontend modifié : `npm run cap:sync` testé ✅
- [ ] Les conventions de nommage sont respectées ✅
- [ ] La documentation est mise à jour si nécessaire ✅
- [ ] Je suis sur la bonne branche (pas main) ✅

---

## 📞 Communication entre agents

Si plusieurs agents travaillent sur le même projet :

1. **Vibe Code** peut implémenter du code
2. **Claude Code** peut reviewer le code de Vibe Code
3. **Toujours documenter** les changements dans les PR
4. **Éviter les conflits** en communiquant via les commits/PR

---

## 💡 Conseils pour les utilisateurs humains

### Pour travailler avec Vibe Code

1. **Donner des tâches claires** : "Fix le bug dans AppCard.jsx qui empêche l'affichage des icônes"
2. **Préciser le contexte** : "Le bug apparaît quand on filtre par catégorie"
3. **Définir les limites** : "Ne touche pas à server/index.js, concentre-toi sur le frontend"
4. **Valider les changements** : Review le code avant de merger

### Pour travailler avec Claude Code

1. **Demander des analyses** : "Analyse la sécurité de api/apps.js"
2. **Demander des reviews** : "Review cette PR #123"
3. **Demander des suggestions** : "Comment améliorer les performances de AppsList.jsx ?"

---

## 📚 Documentation liée

- [README principal](README.md) - Présentation du projet
- [.vibe/instructions.md](.vibe/instructions.md) - Instructions détaillées pour Vibe Code
- [.claude/context.md](.claude/context.md) - Contexte pour Claude Code
- [docs/README.md](docs/README.md) - Index de la documentation
- [docs/BACKLOG.md](docs/BACKLOG.md) - Roadmap et backlog

---

## 📝 Historique

| Date | Agent | Changement | Auteur |
|------|-------|------------|--------|
| [Date] | Tous | Création de AGENTS.md | Vibe Code |

---

*Ce fichier est un contrat entre les agents IA et les mainteneurs humains du projet.*
*Toute violation des règles peut entraîner la révocation des accès.*
