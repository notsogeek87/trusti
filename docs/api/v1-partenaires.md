# API ouverte `/api/v1` (lecture seule)

**Pour qui / Pourquoi** : pour les développeurs qui veulent afficher ou réutiliser les notes
TrustiScore et leur détail (critères, justifications, sources) dans leur propre service, et
pour qui modifie `server/publicApi/`. Page publique destinée aux développeurs :
<https://trusti-score.eu/developpeurs> (dépôt `trusti-score`).

- Base : `https://api.trusti-score.eu/api/v1`
- Spécification OpenAPI 3.1 (sans clé) : `GET /api/v1/openapi.json`
- Code : `server/publicApi/` (`router.js` pour les routes, `format.js` pour le contrat de
  réponse, `partners.js` pour les clés, `openapi.js` pour la spec) et
  `server/database/postgres/public-api.js` pour les requêtes. Tests :
  `tests/server/publicApi.test.js`.
- Clé facultative (quota dédié) : [guide API partenaires](../guides/api-partenaires.md).
- Pourquoi une API séparée de `/api/apps` : voir
  [l'ADR du 2026-11-19](../architecture/2026-11-19-api-partenaires-v1.md).

## Accès : sans clé, clé facultative

L'API est **ouverte, sans clé ni inscription**. Elle est limitée par adresse IP et le CORS
est ouvert (`Access-Control-Allow-Origin: *`) : on peut l'appeler depuis un serveur comme
depuis un navigateur.

```bash
curl "https://api.trusti-score.eu/api/v1/apps?grade=A,B&per_page=20"
```

Un partenaire qui a besoin de plus de volume peut recevoir une **clé facultative** `tsk_...`,
à envoyer dans l'en-tête `Authorization`. Elle lui donne son propre quota. Une clé fournie
mais invalide est refusée (401), jamais ignorée en silence. Une clé ne doit jamais se
retrouver dans le code d'une page web.

```bash
curl -H "Authorization: Bearer tsk_xxxxxxxx" "https://api.trusti-score.eu/api/v1/apps"
```

## Format des réponses

Toutes les réponses ont la forme `{ data, meta }`. `meta` porte toujours la licence et
l'attribution à afficher :

```json
{
  "data": [ { "id": "signal", "name": "Signal", "grade": "A", "...": "..." } ],
  "meta": {
    "apiVersion": "1.0.0",
    "license": "CC-BY-4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/deed.fr",
    "attribution": "Source : TrustiScore (https://trusti-score.eu)",
    "lang": "fr",
    "pagination": { "page": 1, "perPage": 20, "total": 205, "totalPages": 11 }
  }
}
```

Les erreurs ont la forme `{ "error": { "code", "message" } }` :

| Statut | `code` | Cas |
|---|---|---|
| 400 | `bad_request` | Paramètre invalide (note inconnue, date mal formée, `per_page` > 100…) |
| 401 | `unauthorized` | Clé fournie mais inconnue, mal formée ou désactivée (jamais sans en-tête `Authorization`) |
| 404 | `not_found` / `not_assessed` | App ou route inconnue / app sans évaluation détaillée |
| 405 | `method_not_allowed` | Tout sauf `GET` ou `HEAD` |
| 429 | `rate_limited` | Limite de débit atteinte (voir `Retry-After`) |
| 500 | `internal_error` | Erreur serveur (le détail n'est jamais renvoyé) |

## Routes

| Route | Contenu |
|---|---|
| `GET /apps` | Liste triée par nom. `page`, `per_page` (≤ 100, 50 par défaut), `grade=A,B`, `category`, `q` (≥ 2 caractères, cherche dans le nom), `updated_since=AAAA-MM-JJ`, `lang` |
| `GET /apps/{id}` | Fiche d'une app |
| `GET /apps/{id}/assessment` | Détail de l'évaluation : score sur 100, fourchette, note calculée et note corrigée à la main (`overridden`), synthèse (`summary`), critères (points, niveau, confiance, justification, sources avec `toConfirm`), historique de la note |
| `GET /apps/{id}/alternatives` | Alternatives strictement mieux notées (même calcul que l'app) |
| `GET /grade-changes?since=` | Changements de note nets (90 jours par défaut, 365 au plus) |
| `GET /categories` | Catégories et nombre d'apps |
| `GET /export` | Toutes les apps avec leur évaluation détaillée (`assessmentDetail`, sans l'historique), environ 1 à 2 Mo. Régénéré toutes les 10 minutes au plus |
| `GET /openapi.json` | Spécification OpenAPI (hors limite de débit) |

`lang=en|de` traduit la raison de la note, la description et les justifications quand une
traduction à jour existe (table `content_translations`). Sinon le texte reste en français.

### Synthèse d'une évaluation (`summary`)

`summary` est **généré** par `server/publicApi/synthesis.js` à partir des données structurées,
directement dans la langue demandée : score et note, correction éditoriale éventuelle,
exposition aux lois étrangères (d'après le niveau du critère gouvernance, de 0 « Cloud Act » à
4 « gouvernance européenne ou communautaire »), points forts (autres critères à 3 ou 4 points),
points faibles (0 ou 1), fourchette si l'évaluation est provisoire, sources à vérifier. La
colonne `jurisdiction` des apps, presque vide, n'est pas utilisée. Exemple :

> Score de 70/100, note B. Gouvernance européenne ou communautaire : pas d'exposition identifiée
> aux lois extraterritoriales. Points forts : localisation des données ; conformité et
> certifications ; transparence. Points faibles : contrôle technique. Évaluation
> provisoire : selon les points à confirmer, le score pourrait aller de 65 (B) à 70 (B).
> Certaines sources restent à vérifier.

Le champ `summary` de la table `app_assessments` est une note de travail de la chaîne
d'évaluation (trustillm) : il ne sort jamais, ni ici ni dans `/api/apps`.

### Champs d'une app

`id`, `name`, `grade` (A à E), `category`, `developer`, `jurisdiction`, `isEuropean`,
`isOpenSource`, `license` (licence logicielle de l'app), `website`, `icon` (URL https ou
null), `gradeReason`, `description`, `links` (`playStore`, `appStore`, `fDroid`, `github`,
`other`), `assessment` (résumé `{ score, provisional, assessedAt }` ou null), `trustiUrl`
(fiche publique sur Trusti), `updatedAt`.

Les champs internes de l'interface (couleur, popularité, choix de l'équipe, permissions
Android…) ne sortent pas.

## Synchronisation conseillée

1. Première copie : `GET /export`.
2. Ensuite, une fois par jour : `GET /apps?updated_since=<date du dernier passage>`,
   en paginant. Cela renvoie les apps modifiées ou réévaluées.
3. Pour le détail d'une app modifiée : `GET /apps/{id}/assessment`.

```js
// Node 18+ : toutes les apps notées A modifiées depuis le 1er novembre
const res = await fetch(
  'https://api.trusti-score.eu/api/v1/apps?grade=A&updated_since=2026-11-01&per_page=100',
  // Avec une clé partenaire : { headers: { Authorization: `Bearer ${process.env.TRUSTI_API_KEY}` } }
);
if (res.status === 429) await sleep(Number(res.headers.get('retry-after')) * 1000);
const { data, meta } = await res.json();
```

## Limites et cache

- Sans clé : 60 requêtes par minute et par IP (`ANONYMOUS_RATE_PER_MINUTE`), et 20 exports
  par heure et par IP (`ANONYMOUS_EXPORTS_PER_HOUR`), dans `server/publicApi/router.js`.
- Avec clé : `rate_per_minute` du partenaire en base (60 par défaut), sans plafond d'export.
- Le quota en cours est annoncé dans `X-RateLimit-Limit`.
- Clés refusées : 30 essais par IP sur 10 minutes, puis 429.
- Cache mémoire côté serveur : 60 s par URL (10 min pour `/export`). Une clé désactivée en
  base est refusée au plus tard 60 s après.
- Réponses `Cache-Control: public, max-age=60` sans clé, `private, max-age=60` avec clé,
  toujours `Vary: Authorization`.

## Règles de stabilité (pour qui modifie le code)

- Un champ peut être **ajouté** en v1. Il ne doit jamais être retiré ni renommé : cela
  exige une `/api/v2`.
- Tout changement de format se fait dans `server/publicApi/format.js` **et**
  `server/publicApi/openapi.js`. Les tests vérifient que chaque route figure dans la spec
  et que les champs internes ne sortent pas.
- La licence des données se change en un seul endroit : `DATA_LICENSE` dans `format.js`.
