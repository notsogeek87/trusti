# [Type] : [Description concise]

**Type** : ✅ Bugfix | ✅ Feature | ✅ Refactor | ✅ Docs | ✅ Chore | ✅ Security

---

## 📝 Description
[Expliquer le changement en 2-3 phrases claires. Qu'est-ce qui change ? Pourquoi ?]

---

## 🎯 Objectif / Problème résolu
[Pourquoi ce changement est-il nécessaire ? Quel problème résout-il ?]

Exemples :
- "Fix l'affichage des icônes qui ne s'affichent pas sur mobile"
- "Ajoute un filtre par catégorie pour faciliter la recherche"
- "Découpe App.jsx en composants plus petits pour améliorer la maintenabilité"
- "Met à jour la documentation API"

---

## ✅ Checklist de validation

### Code
- [ ] Le code suit les [conventions du projet](AGENTS.md#conventions-du-projet)
- [ ] Pas de nouvelle dépendance ajoutée (ou justifiée dans la description)
- [ ] Les noms de fichiers/composants respectent les conventions (PascalCase, camelCase, etc.)
- [ ] Le code est commenté là où c'est nécessaire (JSDoc pour les fonctions exportées)
- [ ] Pas de code dupliqué (DRY principle)

### Tests
- [ ] `npm test` passe ✅
- [ ] Les tests existants ne sont pas cassés
- [ ] Nouveaux tests ajoutés si applicable

### Build & Déploiement
- [ ] `npm run build` fonctionne ✅
- [ ] Si frontend modifié : `npm run cap:sync` testé ✅
- [ ] Le déploiement Vercel ne sera pas impacté
- [ ] Le build Android ne sera pas impacté (si applicable)

### Documentation
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les changements d'API sont documentés dans `docs/api/`
- [ ] Les changements d'architecture sont documentés dans `docs/architecture/`

### Git
- [ ] Je suis sur une branche dédiée (pas `main`) ✅
- [ ] Les commits sont atomiques et bien décrits
- [ ] Pas de secrets ou credentials dans le code

---

## 🔍 Tests effectués
[Décrivez comment vous avez testé vos changements]

Exemples :
- "Testé manuellement sur Chrome et Firefox"
- "Testé avec `npm test` - tous les tests passent"
- "Testé le build avec `npm run build` - pas d'erreur"
- "Testé sur Android via `npm run cap:sync` + Android Studio"
- "Vérifié que l'API retourne les bonnes données avec Postman"

---

## 📷 Captures d'écran / Vidéos (si applicable)
[Ajouter des captures pour les changements UI]

---

## 📎 Liens et références
- **Issue** : Closes #[numéro] (si applicable)
- **Documentation** : [Lien vers la doc mise à jour]
- **PR dépendante** : #[numéro] (si cette PR dépend d'une autre)
- **Discussion** : [Lien vers une discussion GitHub si applicable]

---

## ⚠️ Points d'attention / Notes
[Tout ce que les reviewers doivent savoir]

Exemples :
- "Ce changement casse temporairement X, mais sera fixé dans la PR #123"
- "Attention : il faut mettre à jour la variable d'environnement Y en production"
- "Ce refactor ne change pas le comportement, seulement l'organisation du code"
- "À tester spécifiquement : le filtre par catégorie sur mobile"

---

## 🏷️ Labels à ajouter
[Suggérer des labels pour cette PR]

Exemples :
- `enhancement` (pour les nouvelles features)
- `bug` (pour les corrections de bugs)
- `documentation` (pour les mises à jour de doc)
- `refactor` (pour le refactoring de code)
- `breaking-change` (si le changement casse la compatibilité)
- `needs-review` (si la PR a besoin d'une review approfondie)

---

---

*Merci pour ta contribution ! 🙌*
*Les reviewers mergeront ta PR une fois tous les checks validés.*
