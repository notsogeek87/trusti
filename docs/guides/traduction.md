# Traduction de Trusti (anglais, allemand)

Le français est la langue source et la langue de repli partout : un texte non traduit
s'affiche en français, jamais une clé vide.

Il y a trois couches, traduites séparément :

| Couche | Où | Langue utilisée |
|---|---|---|
| Interface (web et APK) | `src/i18n/locales/{fr,en,de}/` | celle choisie dans l'app |
| Textes natifs Android (notifications, mise à jour) | `android/app/src/main/res/values*/strings_i18n.xml` | celle du téléphone |
| Contenu en base (raisons, descriptions, évaluations, guides) | table `content_translations` | celle de l'app, envoyée à l'API (`?lang=`) |

## 1. Interface

- `t('namespace.cle', { variable })` depuis `src/i18n/index.js`, utilisable hors React.
- Pluriels : clés `_one` / `_other` et `t(key, { count })` (`Intl.PluralRules`).
- Dates et nombres : `formatDate`, `formatNumber` (locale de la langue active).
- Le français est inclus dans le bundle ; l'anglais et l'allemand sont chargés à la demande.
- Choix de la langue : `?lang=xx`, puis le choix mémorisé (`localStorage` `trusti-lang`),
  puis la langue du navigateur ou du téléphone. Changer de langue recharge l'app.
- Les catégories et les étapes du kit restent des clés françaises en base et dans le code ;
  elles sont traduites à l'affichage (`categoryLabel`, `kitStepLabel`, `auditThemeLabel`).

Ajouter un texte : créer la clé dans `fr/`, puis dans `en/` et `de/`. Contrôles :

```bash
npm test                          # tests/technical/i18n.test.js : clés, variables, pluriels
node scripts/i18n-report.js       # repère le français resté en dur dans src/
```

### Activer une langue

Une langue n'apparaît dans le sélecteur que si elle figure dans `ENABLED_LANGUAGES`
(`src/i18n/languages.js`). Le test refuse d'activer une langue incomplète. Sans
activation, `?lang=en` fonctionne quand même, ce qui permet de relire avant d'ouvrir.

## 2. Textes natifs Android

`res/values/strings_i18n.xml` (français), `values-en/`, `values-de/`. Android choisit
selon la langue du téléphone, pas selon celle de l'app : un téléphone en allemand reçoit
les notifications en allemand même si l'app est réglée en français. Toute nouvelle
chaîne doit exister dans les trois fichiers.

Fiche Play Store et notes de version : `play-store/fiche/README.md`,
`play-store/notes-de-version/{en-US,de-DE}.txt`.

Politique de confidentialité : `public/en/privacy-policy.html` et
`public/de/privacy-policy.html` ; le français fait foi.

## 3. Contenu en base

Les textes du catalogue restent en français dans leurs tables (`applications`,
`app_assessments`, `app_migration_guides`). Les traductions vont dans
`content_translations` (migration `server/database/migrations/2026-11-15-content-translations.sql`) :

| entity | entity_id | field |
|---|---|---|
| `application` | id de l'app | `reason`, `description`, `teamPickReason` |
| `assessment` | id de l'app | `summary`, `rationale.<critère>` |
| `migration_guide` | `<id app>:export` ou `<id app>:import` | `summary`, `steps`, `notes`, `directExport` |

- `value` : chaîne JSON pour un texte, liste de chaînes pour `steps` et `notes` (même
  nombre d'éléments que le français ; le niveau des notes reste celui du français).
- `source_hash` : md5 du texte français traduit, tel que l'API le renvoie (pour une liste,
  md5 de son JSON). Fonction `sourceHash()` de `server/contentTranslations.js`.
  Si le français change, l'empreinte ne correspond plus et l'API repasse en français
  jusqu'à la nouvelle traduction : on ne sert jamais une traduction périmée.

L'app ajoute `lang=en|de` à toutes les requêtes `/api/apps` (`appsUrl()` dans
`src/utils/apiConfig.js`). Le serveur lit les traductions utiles en une requête et les
superpose à la réponse. Si la table n'existe pas ou si la lecture échoue, la réponse
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

## Non traduit à ce jour

- Contenu en base : la structure est prête, aucune traduction n'est encore saisie.
- Messages d'erreur renvoyés par le serveur ou le système Android (affichés tels quels).
- `public/retours.html` (page des bêta-testeurs).
