---
name: build-ko
description: À utiliser quand David dit « build ko » ou signale qu'un build est cassé (CI rouge, déploiement en échec) : diagnostic, correction, puis push direct sur la branche en échec.
---

# Build ko

« Build ko » = le build est cassé sur une branche (souvent `main` ou `staging`). Ne pas lancer un build « pour voir » : diagnostiquer et réparer.

## Procédure

1. **Identifier la branche en échec** (celle citée, sinon `main`). C'est la branche cible.
2. **Reproduire en local** : `git fetch origin <branche>`, puis `npm ci` et `npm run build` sur cette branche.
3. **Lire la CI** (GitHub Actions : Web CI, Android APK) : derniers runs de la branche, étape en échec, logs si disponibles.
4. **Classer la panne** :
   - *Erreur de code* (le build local échoue aussi, ou la CI échoue sur une étape réelle) → corriger.
   - *Infrastructure* (job annulé ou bloqué, `npm ci` qui pend, runner perdu, build local OK) → relancer le run, une seule fois. Jamais de commit vide ni de fermeture/réouverture pour relancer.
5. **Corriger au plus petit** : uniquement ce que la panne exige. Ne jamais désactiver, sauter ou mettre en quarantaine un test pour passer au vert.
6. **Valider avant de pousser** : `npm run build` et les vérifications du dépôt (`node --check` sur `api/` et `server/`, `npm test` si pertinent) doivent passer en local.
7. **Pousser sur la branche en échec** (règle de David : systématiquement, pas de branche à part, pas de PR) :
   `git push origin <branche>`. Pas de force-push, pas de rebase ni d'amend : commit simple ou merge.
8. **Vérifier la CI** sur le nouveau commit jusqu'au vert ; si elle reste rouge, repartir à l'étape 3.
9. **Rendre compte** : ce qui était cassé, la cause, ce qui a été fait (commit poussé ou run relancé), l'état final de la CI.

## Pièges connus

- `dist/` est dans `.gitignore` : ne rien commiter du dossier de build.
- Un job Web CI normal dure environ 20 s. Au-delà de quelques minutes, suspecter un blocage du runner ou du registre npm (cas du 05/10/2026 : `npm ci` bloqué, build sain).
- Un commit qui ne touche que la doc ne peut pas casser le build : chercher côté infrastructure.
