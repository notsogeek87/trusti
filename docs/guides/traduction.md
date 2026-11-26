# Traduction de Trusti

Langues : français (source), anglais, allemand, espagnol, italien, néerlandais, polonais,
portugais (`fr`, `en`, `de`, `es`, `it`, `nl`, `pl`, `pt`).

Le français est la langue source et la langue de repli des textes : un texte non traduit
s'affiche en français, jamais une clé vide. Pour choisir la langue d'affichage, une langue
non prise en charge (suédois, grec…) donne l'anglais, compris par plus de monde.

Il y a trois couches, traduites séparément :

| Couche | Où | Langue utilisée |
|---|---|---|
| Interface (web et APK) | `src/i18n/locales/<langue>/` | celle choisie dans l'app (sinon celle du téléphone, sinon l'anglais) |
| Textes natifs Android (notifications, mise à jour) | `android/app/src/main/res/values*/strings_i18n.xml` | celle du téléphone (sinon l'anglais) |
| Contenu en base (raisons, descriptions, évaluations, guides) | table `content_translations` | celle de l'app, envoyée à l'API (`?lang=`), sinon l'anglais, sinon le français |

## 1. Interface

- `t('namespace.cle', { variable })` depuis `src/i18n/index.js`, utilisable hors React.
- Pluriels : clés `_one` / `_other` et `t(key, { count })` (`Intl.PluralRules`). Le polonais
  ajoute `_few` (2-4, 22-24…) et `_many` (5-21…) ; `_other` reste obligatoire. Le test accepte
  ces formes supplémentaires si le français a la clé `_other` correspondante.
- Dates et nombres : `formatDate`, `formatNumber` (locale de la langue active).
- Le français est inclus dans le bundle ; les autres langues sont chargées à la demande.
- Choix de la langue : `?lang=xx`, puis le choix mémorisé (`localStorage` `trusti-lang`),
  puis la langue du navigateur ou du téléphone, sinon l'anglais (`FALLBACK_LANGUAGE`).
  Changer de langue recharge l'app.
- Les catégories et les étapes du kit restent des clés françaises en base et dans le code ;
  elles sont traduites à l'affichage (`categoryLabel`, `kitStepLabel`, `auditThemeLabel`).

Ajouter un texte : créer la clé dans `fr/`, puis dans chaque autre langue. Contrôles :

```bash
npm test                          # tests/technical/i18n.test.js : clés, variables, pluriels
node scripts/i18n-report.js       # repère le français resté en dur dans src/
```

### Activer une langue

Une langue n'apparaît dans le sélecteur que si elle figure dans `ENABLED_LANGUAGES`
(`src/i18n/languages.js`). Le test refuse d'activer une langue incomplète. Sans
activation, `?lang=en` fonctionne quand même, ce qui permet de relire avant d'ouvrir.

## 2. Textes natifs Android

`res/values-fr/strings_i18n.xml` (français, la source), `values/` (anglais : c'est le
dossier par défaut, utilisé pour toute langue sans dossier propre), `values-de/`,
`values-es/`, `values-it/`, `values-nl/`, `values-pl/`, `values-pt/`. Android choisit
selon la langue du téléphone, pas selon celle de l'app : un téléphone en allemand reçoit
les notifications en allemand même si l'app est réglée en français. Toute nouvelle
chaîne doit exister dans chaque fichier, avec les mêmes paramètres (`%1$s`…) :
`tests/technical/android-strings.test.js` le vérifie.

Fiche Play Store et notes de version : `play-store/fiche/README.md`,
`play-store/notes-de-version/<code Play>.txt` (`en-US`, `de-DE`, `es-ES`, `it-IT`, `nl-NL`,
`pl-PL`, `pt-PT`).

Politique de confidentialité : `public/<langue>/privacy-policy.html` ; le français fait foi.

## 3. Contenu en base

Les textes du catalogue restent en français dans leurs tables (`applications`,
`app_assessments`, `app_migration_guides`). Les traductions vont dans
`content_translations` (migration `server/database/migrations/2026-11-15-content-translations.sql`) :

| entity | entity_id | field |
|---|---|---|
| `application` | id de l'app | `reason`, `description`, `teamPickReason` |
| `assessment` | id de l'app | `rationale.<critère>` |
| `migration_guide` | `<id app>:export` ou `<id app>:import` | `summary`, `steps`, `notes`, `directExport` |

- `value` : chaîne JSON pour un texte, liste de chaînes pour `steps` et `notes` (même
  nombre d'éléments que le français ; le niveau des notes reste celui du français).
- `source_hash` : md5 du texte français traduit, tel que l'API le renvoie (pour une liste,
  md5 de son JSON). Fonction `sourceHash()` de `server/contentTranslations.js`.
  Si le français change, l'empreinte ne correspond plus et l'API repasse en français
  jusqu'à la nouvelle traduction : on ne sert jamais une traduction périmée.

L'app ajoute `lang=<langue>` (hors français) à toutes les requêtes `/api/apps` (`appsUrl()` dans
`src/utils/apiConfig.js`). Le serveur lit les traductions utiles (langue demandée et
anglais) en une requête et les superpose à la réponse : pour chaque texte, la traduction
dans la langue demandée si elle est à jour, sinon l'anglais s'il est à jour, sinon le
français (`contentLanguages()` dans `server/contentTranslations.js`). Si la table n'existe pas ou si la lecture échoue, la réponse
reste en français.

Exemple d'écriture (à faire valider avant exécution, comme toute écriture en base) :

```sql
INSERT INTO content_translations (entity, entity_id, field, lang, value, source_hash, translated_by)
VALUES ('application', '42', 'reason', 'en', to_jsonb('Hosted in France, open source'::text),
        md5('Hébergé en France, open source'), 'relu par David')
ON CONFLICT (entity, entity_id, field, lang)
DO UPDATE SET value = EXCLUDED.value, source_hash = EXCLUDED.source_hash,
              translated_by = EXCLUDED.translated_by, updated_at = NOW();
```

### Rafraîchir les traductions

Le contenu en base évolue (nouvelles fiches, évaluations révisées, guides). Une traduction
dont le français a changé est ignorée par l'API, qui sert alors le français : il faut donc
la refaire. Pour savoir quoi :

```bash
node scripts/translations-report.js           # résumé par type de texte et par langue
node scripts/translations-report.js --list    # + les 50 premiers textes à traduire
node scripts/translations-report.js --check   # code de sortie 1 s'il reste quelque chose
```

Le rapport est en lecture seule (`--lang=pl` pour une seule langue). Il dit pour chaque
ligne attendue (français non vide × chaque langue de `CONTENT_LANGUAGES`) si la traduction est `missing` (absente), `stale` (empreinte différente : le
français a changé) ou `invalid` (valeur vide, ou liste de longueur différente du français).
Les traductions orphelines (fiche supprimée) sont comptées à part ; les supprimer demande
la même validation que toute écriture en base. Logique et tests : `server/translationsReport.js`,
`tests/server/translationsReport.test.js`.

Pour traduire une série :

1. Lister les textes français à traduire (même requête que l'API, par exemple les raisons
   dont l'empreinte ne correspond plus).
2. Traduire en gardant le style des textes existants : phrases courtes, vouvoiement
   (« Sie ») en allemand, citations anglaises de politiques laissées telles quelles,
   guillemets typographiques « … » remplacés par `"…"` en anglais, `„…“` en allemand et
   en polonais, conservés en espagnol, italien et portugais, `'…'` en néerlandais,
   Markdown (`**gras**`, liens, `code`) conservé.
3. Faire valider l'écriture, puis insérer avec `ON CONFLICT … DO UPDATE` (exemple ci-dessus).
   Pour les textes qui se répètent (justifications identiques d'une app à l'autre), on
   traduit chaque texte distinct une fois et on l'écrit pour toutes les fiches concernées,
   en calculant `source_hash` avec `md5()` dans la requête.
4. Relancer le rapport : tout doit repasser à `ok`.

Pour les listes (`steps`, `notes`), l'empreinte est celle du JSON compact de la liste de
chaînes : en SQL `md5('[' || string_agg(to_json(e)::text, ',' ORDER BY o) || ']')`, avec
le texte seul des notes (le niveau `danger` reste celui du français). Les libellés
d'interface cités dans les guides (Google Takeout, Facebook, Instagram…) ont été traduits
de mémoire : à relire quand un service change son interface.

## État des traductions

Au 2026-11-19, tout le contenu du catalogue est traduit en anglais et en allemand
(traduction par Claude, style validé par David, `translated_by` en base) : raisons,
descriptions et raisons « choix de l'équipe » des fiches, justifications de toutes les
évaluations, 29 guides de migration. Le rapport ci-dessus doit afficher « Tout est
traduit et à jour » pour `--lang=en,de`. Toute nouvelle fiche ou révision d'évaluation ajoute des lignes à
traduire : lancer le rapport après chaque lot d'évaluation.

Au 2026-11-26, l'interface, les textes Android, la fiche Play Store et la politique de
confidentialité existent aussi en espagnol, italien, néerlandais, polonais et portugais
(traduction par Claude, à relire). Le contenu en base de ces cinq langues est à traduire
(voir le rapport) ; en attendant, l'API sert l'anglais.

## Non traduit à ce jour

- Messages d'erreur renvoyés par le serveur ou le système Android (affichés tels quels).
- `public/retours.html` (page des bêta-testeurs).
