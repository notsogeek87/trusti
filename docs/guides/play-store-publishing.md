# Publier Trusti sur le Play Store

Ce guide reprend la démarche déjà suivie pour swipernews (`eu.lielu.news`),
adaptée à Trusti (`eu.trusti.app`). Le code (signature release, workflow
`play-store-bundle.yml`, `tools/publish_play_store.py`) est déjà en place ;
ce qui suit est **la partie qui ne peut pas être automatisée depuis un
environnement de dev sans accès à la Play Console**.

Le compte développeur Google Play existe déjà (celui utilisé pour
swipernews) : pas de nouveau paiement, pas de nouveau compte — Trusti est
juste une nouvelle app dans ce même compte.

## 1. Créer l'app dans la Play Console

Avec le compte déjà utilisé pour swipernews : Play Console → **Créer une
application**.

- Nom : Trusti
- Langue par défaut : français
- Type : Application
- Gratuite
- `applicationId` : **`eu.trusti.app`** (déjà figé dans
  `android/app/build.gradle` et `capacitor.config.json` — ne pas en choisir
  un autre, il est définitif une fois la première version publiée).

## 2. Compte de service (pour l'automatisation)

Le compte de service Google Cloud utilisé pour publier swipernews (celui
dont le JSON alimente le secret `PLAY_STORE_SERVICE_ACCOUNT_JSON` de ce
dépôt-là) peut être **réutilisé tel quel** — un compte de service est lié au
compte développeur, pas à une app en particulier. Selon la façon dont il a
été invité à l'époque, deux cas :

- **Accès donné au niveau du compte développeur entier** (Play Console →
  **Utilisateurs et autorisations**, au niveau du compte plutôt que d'une
  app précise) : rien à faire, il voit déjà Trusti dès qu'elle existe.
- **Accès donné app par app** (invité uniquement sur la fiche swipernews) :
  il faut l'inviter une deuxième fois, sur Trusti cette fois — Play Console →
  Trusti → **Utilisateurs et autorisations** (ou **Configuration** → **Accès
  à l'API** selon la version de la Console) → **Inviter des utilisateurs
  existants** → sélectionner ce même compte de service (par son adresse
  e-mail `...@...iam.gserviceaccount.com`) → lui donner au minimum la
  permission **"Gérer les versions de production, sur des canaux de tests et
  sur des canaux internes de l'app"** pour Trusti.

Dans les deux cas, **aucun nouveau JSON n'est nécessaire** : le secret
GitHub `PLAY_STORE_SERVICE_ACCOUNT_JSON` de ce dépôt peut recevoir exactement
la même valeur que celle configurée pour swipernews (le compte de service ne
change pas, seule l'app à laquelle il a accès change).

Si ce compte de service n'est plus retrouvable (JSON perdu, accès révoqué),
seulement alors en créer un nouveau : Play Console → **Utilisateurs et
autorisations** → **Inviter de nouveaux utilisateurs** → lien vers Google
Cloud Console pour créer le compte de service et sa clé JSON, puis l'inviter
comme ci-dessus.

## 3. Première version : obligatoirement manuelle

**L'API Android Publisher refuse de créer la toute première version d'une
app** — il faut un premier envoi fait à la main dans la Console avant que
l'automatisation ne puisse prendre le relai sur les suivantes. C'est la
même contrainte que swipernews a rencontrée.

1. Générer un premier AAB signé avec la clé d'upload (voir §4 pour comment
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
     (`/privacy-policy.html`, servie par le site sur Hyperfluid).
   - **Formulaire "Sécurité des données"** (Data safety) : quelles données
     Trusti collecte : aucune donnée personnelle envoyée aux serveurs (plus de compte ni d'e-mail
     depuis le 2026-10-11) ; à compléter selon les autorisations du manifeste (voir la politique de confidentialité).
   - **Classification du contenu** : questionnaire IARC.
   - **Public cible et contenu** (âge).
   - **Coordonnées de contact** développeur.
4. Envoyer aux testeurs internes (ajouter au moins une adresse email, la
   tienne) et valider que l'app s'installe et se lance depuis le lien de
   test.

Une fois cette première version publiée sur un canal (même "Tests internes"),
l'API peut prendre le relai pour les suivantes.

## 4. Secrets GitHub à configurer

Dans les paramètres du dépôt (`Settings` → `Secrets and variables` →
`Actions`), ajouter :

| Secret | Contenu |
| --- | --- |
| `PLAY_STORE_KEYSTORE_B64` | La clé d'upload `.jks`, encodée en base64 (`base64 -w0 trusti-upload.jks`) |
| `PLAY_STORE_KEYSTORE_PASSWORD` | Mot de passe du keystore |
| `PLAY_STORE_KEYSTORE_ALIAS` | Alias de la clé dans le keystore |
| `PLAY_STORE_KEY_PASSWORD` | Mot de passe de la clé (peut être identique au mot de passe du keystore) |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Le contenu JSON complet du compte de service (§2 — réutilisable tel quel depuis swipernews) |

**Ne jamais committer le fichier `.jks` ni ces valeurs dans le dépôt** — le
perdre après la première publication empêcherait de mettre à jour l'app sans
perdre tous les utilisateurs existants (Google exige la même clé d'upload à
chaque version). Le conserver aussi dans un gestionnaire de mots de passe, en
dehors de GitHub.

## 5. Publications suivantes

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

### Notes de version (« Nouveautés » sur la fiche)

Le texte affiché dans « Nouveautés » vient de
`play-store/notes-de-version/<code Play>.txt`, un fichier par langue : `fr-FR`,
`en-US`, `de-DE`, `es-ES`, `it-IT`, `nl-NL`, `pl-PL`, `pt-PT`. Il est envoyé
avec la release par `tools/publish_play_store.py`.

**À mettre à jour avant chaque envoi en production, dans toutes les langues** :
résumé des nouveautés visibles depuis la dernière publication, en langage
utilisateur (pas de jargon technique), 500 caractères maximum par langue.
Une langue sans fichier n'affiche aucune nouveauté pour cette version.

### Langues de la fiche et pays

Les nouveautés et la fiche se règlent **par langue, pas par pays** : Google
affiche la traduction correspondant à la langue de l'appareil, sinon la langue
par défaut de la fiche (français). Un pays dont la langue n'a pas de traduction
(Suède, Grèce, Roumanie…) voit donc la fiche et les nouveautés en français.

- **Fiche traduite** (titre, description courte, description complète) :
  `play-store/fiche/README.md`, une section `## <code Play>` par langue.
  À chaque publication, le script **ajoute à la fiche les langues qui y
  manquent** ; une traduction déjà présente dans la Play Console n'est pas
  modifiée (modifier une fiche existante se fait à la main dans la Console).
- **Nouveautés** : envoyées seulement pour les langues présentes dans la
  fiche (l'API refuse les autres ; le script le signale par un avertissement).
- **Nouvelle langue** : ajouter sa section dans `play-store/fiche/README.md`
  et son fichier `play-store/notes-de-version/<code>.txt`. `npm test` vérifie
  les limites de Google (titre 30, description courte 80, description
  complète 4 000 caractères) et que chaque fichier de nouveautés a sa fiche.
- **Langue par défaut** : à régler à la main dans la Play Console (Présence
  sur le Store → Fiche principale → Gérer les traductions → Langue par
  défaut). Passer `en-US` en langue par défaut ferait voir l'anglais, au lieu
  du français, aux pays sans traduction.

### Pays de diffusion

Les pays se règlent dans la Play Console (Production → Pays/régions). Par
défaut, le script publie sur **tous les pays configurés pour le canal**
(aujourd'hui les pays de l'UE). `--countries FR,BE` limite un déploiement
progressif (`--fraction` < 1) à certains pays ; une release à 100 % couvre
toujours tous les pays du canal.

### Vérifier après la publication

Dans les traces de l'étape « Publie sur Google Play » du workflow :

- `Fiche ajoutée : <code>` pour chaque langue ajoutée à la fiche ;
- `Notes de version [<code>]` pour chaque langue envoyée ;
- aucun avertissement `Notes ignorées` (sinon, une langue de nouveautés n'est
  pas dans la fiche) ;
- `Pays du canal : [...] ; ciblage : tous`.

## Différence avec android.yml / F-Droid

- `android.yml` publie les APK stables GitHub avec la variante
  `githubRelease` et la clé de publication dédiée à GitHub. Les APK de test
  utilisent la variante `debug` et la clé debug versionnée.
- `play-store-bundle.yml` construit la variante `release` et signe l’AAB avec
  la clé d’envoi Google Play. Play App Signing signe ensuite les APK
  distribués par le Play Store. Un éventuel canal F-Droid utiliserait sa
  propre clé.
