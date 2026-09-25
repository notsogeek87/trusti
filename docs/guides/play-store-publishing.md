# Publier Trusti sur le Play Store

Ce guide reprend la démarche déjà suivie pour swipernews (`eu.lielu.news`),
adaptée à Trusti (`com.trusti.app`). Le code (signature release, workflow
`play-store-bundle.yml`, `tools/publish_play_store.py`) est déjà en place ;
ce qui suit est **la partie qui ne peut pas être automatisée depuis un
environnement de dev sans accès à la Play Console** — elle demande un compte
Google, un paiement, et des formulaires à remplir dans le navigateur.

## 1. Compte développeur Google Play

Si ce n'est pas déjà fait : https://play.google.com/console/signup — 25 $
US, paiement unique, par compte développeur (pas par app).

## 2. Créer l'app dans la Play Console

- Nom : Trusti
- Langue par défaut : français
- Type : Application
- Gratuite
- `applicationId` : **`com.trusti.app`** (déjà figé dans
  `android/app/build.gradle` et `capacitor.config.json` — ne pas en choisir
  un autre, il est définitif une fois la première version publiée).

## 3. Compte de service (pour l'automatisation)

L'API Android Publisher (utilisée par `tools/publish_play_store.py`) a
besoin d'un compte de service Google Cloud, lié à la Play Console :

1. Play Console → **Configuration** → **Accès à l'API** → suivre le lien vers
   Google Cloud Console pour créer un compte de service (ou en réutiliser un
   existant si un projet GCP est déjà lié).
2. Dans Google Cloud Console → IAM & Admin → Comptes de service → créer une
   clé JSON pour ce compte.
3. Revenir dans Play Console → **Accès à l'API** → inviter ce compte de
   service, avec au minimum la permission **"Gérer les versions de
   production, sur des canaux de tests et sur des canaux internes de l'app"**
   pour Trusti.
4. Garder le contenu du fichier JSON téléchargé : c'est la valeur du secret
   GitHub `PLAY_STORE_SERVICE_ACCOUNT_JSON` (tout le fichier, tel quel).

## 4. Première version : obligatoirement manuelle

**L'API Android Publisher refuse de créer la toute première version d'une
app** — il faut un premier envoi fait à la main dans la Console avant que
l'automatisation ne puisse prendre le relai sur les suivantes. C'est la
même contrainte que swipernews a rencontrée.

1. Générer un premier AAB signé avec la clé d'upload (voir §5 pour comment
   la CI le fait — en local, il faut le SDK Android, indisponible dans cet
   environnement de dev, voir `CLAUDE.md` § « Environnement de développement »
   si ce fichier existe, sinon utiliser une machine avec Android Studio /
   `sdkmanager`, ou déclencher le workflow une première fois avec seulement
   l'étape de build — voir note ci-dessous).
2. Play Console → **Tests internes** (canal créé par défaut, jusqu'à 100
   testeurs, pas de revue) → **Créer une version** → envoyer le `.aab`.
3. Remplir ce que Google exige avant toute publication, même en test :
   - **Fiche du Play Store** : description courte/longue, captures d'écran
     (au moins 2, format téléphone), icône 512×512, image de présentation
     (feature graphic) 1024×500.
   - **Politique de confidentialité** : une URL publique est obligatoire
     (Trusti étant déployé sur Vercel, une page `/privacy` ou équivalent
     hébergée dessus convient).
   - **Formulaire "Sécurité des données"** (Data safety) : quelles données
     Trusti collecte (email pour l'OTP, a priori) et pourquoi.
   - **Classification du contenu** : questionnaire IARC.
   - **Public cible et contenu** (âge).
   - **Coordonnées de contact** développeur.
4. Envoyer aux testeurs internes (ajouter au moins une adresse email, la
   tienne) et valider que l'app s'installe et se lance depuis le lien de
   test.

Une fois cette première version publiée sur un canal (même "Tests internes"),
l'API peut prendre le relai pour les suivantes.

## 5. Secrets GitHub à configurer

Dans les paramètres du dépôt (`Settings` → `Secrets and variables` →
`Actions`), ajouter :

| Secret | Contenu |
| --- | --- |
| `PLAY_STORE_KEYSTORE_B64` | La clé d'upload `.jks`, encodée en base64 (`base64 -w0 trusti-upload.jks`) |
| `PLAY_STORE_KEYSTORE_PASSWORD` | Mot de passe du keystore |
| `PLAY_STORE_KEYSTORE_ALIAS` | Alias de la clé dans le keystore |
| `PLAY_STORE_KEY_PASSWORD` | Mot de passe de la clé (peut être identique au mot de passe du keystore) |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Le contenu JSON complet du compte de service (§3) |

**Ne jamais committer le fichier `.jks` ni ces valeurs dans le dépôt** — le
perdre après la première publication empêcherait de mettre à jour l'app sans
perdre tous les utilisateurs existants (Google exige la même clé d'upload à
chaque version). Le conserver aussi dans un gestionnaire de mots de passe, en
dehors de GitHub.

## 6. Publications suivantes

Une fois le premier envoi manuel fait et les secrets configurés :

```
GitHub → Actions → "Play Store AAB" → Run workflow → choisir le canal
(par défaut "internal" ; passer à un canal de tests fermés ou "production"
une fois créé/prêt dans la Console)
```

Le workflow (`.github/workflows/play-store-bundle.yml`) compile, signe avec
la clé d'upload et publie via `tools/publish_play_store.py`, qui liste
d'abord les canaux réels de l'app pour échouer vite si `--track` ne
correspond à aucun (voir le script pour le contexte : un nom de canal
supposé, comme "alpha", peut ne correspondre à rien de réel).

## Différence avec android.yml / F-Droid

- `android.yml` (déjà existant) : build **debug**, signé de la clé debug
  committée — pour tester, jamais pour Play Store.
- `play-store-bundle.yml` (nouveau) : build **release**, signé de la clé
  d'upload Play Store dédiée — jamais la même clé qu'un éventuel futur canal
  F-Droid, les deux écosystèmes restant indépendants.
