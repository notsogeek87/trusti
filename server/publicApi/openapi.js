/**
 * Spécification OpenAPI 3.1 de l'API partenaires, servie sur /api/v1/openapi.json.
 * À tenir à jour avec format.js et router.js (tests/server/publicApi.test.js vérifie
 * que chaque route du routeur y figure).
 */
import { API_VERSION, DATA_LICENSE, MAX_PER_PAGE, DEFAULT_PER_PAGE } from './format.js';

const nullableString = { type: ['string', 'null'] };
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const langParam = { $ref: '#/components/parameters/lang' };
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Identifiant TrustiScore de l\'app.' };

const ok = (dataSchema, description = 'OK') => ({
  description,
  content: {
    'application/json': {
      schema: { type: 'object', required: ['data', 'meta'], properties: { data: dataSchema, meta: ref('Meta') } },
    },
  },
});
const errors = (...codes) => Object.fromEntries(codes.map(c => [c, { $ref: `#/components/responses/E${c}` }]));

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'API ouverte TrustiScore',
    version: API_VERSION,
    description: [
      'API ouverte, en lecture seule, des notes TrustiScore (souveraineté numérique, A à E) et de leur détail.',
      '',
      'Accès libre, sans clé ni inscription : 60 requêtes par minute par adresse IP, et 20 exports complets par heure.',
      'CORS ouvert : appelable depuis un serveur comme depuis un navigateur.',
      'Besoin de plus ? Une clé partenaire facultative (`Authorization: Bearer tsk_...`) donne un quota dédié : la demander à Trusti.',
      'Ne jamais mettre une clé partenaire dans le code d\'une page web.',
      '',
      `Données sous licence ${DATA_LICENSE.license} (${DATA_LICENSE.licenseUrl}). Attribution obligatoire : « ${DATA_LICENSE.attribution} ».`,
      '',
      'Stabilité : aucun champ n\'est retiré ni renommé en v1 ; des champs peuvent être ajoutés.',
    ].join('\n'),
    license: { name: DATA_LICENSE.license, url: DATA_LICENSE.licenseUrl },
  },
  servers: [{ url: 'https://api.trusti-score.eu/api/v1' }],
  security: [{}, { partnerKey: [] }],
  paths: {
    '/apps': {
      get: {
        summary: 'Liste des applications notées',
        description: 'Triée par nom. Filtres combinables.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'per_page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: MAX_PER_PAGE, default: DEFAULT_PER_PAGE } },
          { name: 'grade', in: 'query', schema: { type: 'string', example: 'A,B' }, description: 'Une ou plusieurs notes séparées par des virgules.' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Catégorie exacte (voir /categories) ; inclut ses sous-catégories « Catégorie / ... ».' },
          { name: 'q', in: 'query', schema: { type: 'string', minLength: 2 }, description: 'Recherche dans le nom.' },
          { name: 'updated_since', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Apps modifiées ou réévaluées depuis cette date (synchronisation incrémentale).' },
          langParam,
        ],
        responses: { 200: ok({ type: 'array', items: ref('App') }), ...errors(400, 401, 429) },
      },
    },
    '/apps/{id}': {
      get: {
        summary: 'Fiche d\'une application',
        parameters: [idParam, langParam],
        responses: { 200: ok(ref('App')), ...errors(401, 404, 429) },
      },
    },
    '/apps/{id}/assessment': {
      get: {
        summary: 'Détail de l\'évaluation TrustiScore',
        description: 'Score, critères (points, niveau, confiance, justification), sources et historique de la note. 404 `not_assessed` si l\'app n\'a pas d\'évaluation détaillée.',
        parameters: [idParam, langParam],
        responses: { 200: ok(ref('Assessment')), ...errors(401, 404, 429) },
      },
    },
    '/apps/{id}/alternatives': {
      get: {
        summary: 'Alternatives mieux notées',
        description: 'Apps strictement mieux notées de la même catégorie, plus les alternatives choisies par l\'équipe. Triées par note puis par nom.',
        parameters: [idParam, langParam],
        responses: { 200: ok({ type: 'array', items: ref('App') }), ...errors(401, 404, 429) },
      },
    },
    '/grade-changes': {
      get: {
        summary: 'Changements de note',
        description: 'Un changement net par app depuis `since` (90 jours par défaut, 365 au plus), du plus récent au plus ancien.',
        parameters: [{ name: 'since', in: 'query', schema: { type: 'string', format: 'date' } }],
        responses: {
          200: ok({
            type: 'array',
            items: {
              type: 'object',
              properties: {
                appId: { type: 'string' }, name: { type: 'string' },
                previousGrade: ref('Grade'), grade: ref('Grade'), date: { type: 'string', format: 'date' },
              },
            },
          }),
          ...errors(400, 401, 429),
        },
      },
    },
    '/categories': {
      get: {
        summary: 'Catégories',
        responses: {
          200: ok({ type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'integer' } } } }),
          ...errors(401, 429),
        },
      },
    },
    '/export': {
      get: {
        summary: 'Export complet',
        description: 'Toutes les apps avec leur évaluation détaillée (`assessmentDetail`, sans l\'historique). Régénéré toutes les 10 minutes au plus. Préférer cette route à une pagination complète pour une copie locale. Sans clé : 20 par heure et par IP.',
        parameters: [langParam],
        responses: {
          200: ok({ type: 'array', items: { allOf: [ref('App'), { type: 'object', properties: { assessmentDetail: { oneOf: [ref('Assessment'), { type: 'null' }] } } }] } }),
          ...errors(401, 429),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      partnerKey: { type: 'http', scheme: 'bearer', description: 'Facultatif. Clé partenaire `tsk_...` fournie par Trusti, pour un quota dédié.' },
    },
    parameters: {
      lang: {
        name: 'lang', in: 'query', schema: { type: 'string', enum: ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl', 'pt'], default: 'fr' },
        description: 'Langue des textes (raison, description, résumé, justifications). Traduction anglaise si celle de la langue demandée manque, puis texte français.',
      },
    },
    responses: {
      E400: { description: 'Paramètre invalide', content: { 'application/json': { schema: ref('Error') } } },
      E401: { description: 'Clé fournie mais invalide ou désactivée (sans en-tête Authorization, pas de 401)', content: { 'application/json': { schema: ref('Error') } } },
      E404: { description: 'Introuvable (`not_found`) ou non évalué (`not_assessed`)', content: { 'application/json': { schema: ref('Error') } } },
      E429: { description: 'Limite de débit atteinte (voir l\'en-tête Retry-After)', content: { 'application/json': { schema: ref('Error') } } },
    },
    schemas: {
      Grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E'] },
      Meta: {
        type: 'object',
        required: ['apiVersion', 'license', 'licenseUrl', 'attribution'],
        properties: {
          apiVersion: { type: 'string' },
          license: { type: 'string' },
          licenseUrl: { type: 'string' },
          attribution: { type: 'string' },
          lang: { type: 'string' },
          pagination: {
            type: 'object',
            properties: { page: { type: 'integer' }, perPage: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } },
          },
        },
      },
      App: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          grade: { oneOf: [ref('Grade'), { type: 'null' }] },
          category: nullableString,
          developer: nullableString,
          jurisdiction: nullableString,
          isEuropean: { type: 'boolean' },
          isOpenSource: { type: 'boolean' },
          license: nullableString,
          website: nullableString,
          icon: { ...nullableString, description: 'URL https de l\'icône.' },
          gradeReason: { ...nullableString, description: 'Explication courte de la note.' },
          description: nullableString,
          links: {
            type: 'object',
            properties: { playStore: nullableString, appStore: nullableString, fDroid: nullableString, github: nullableString, other: nullableString },
          },
          assessment: {
            description: 'Résumé de l\'évaluation détaillée (null si l\'app n\'en a pas). Détail : /apps/{id}/assessment.',
            oneOf: [
              { type: 'object', properties: { score: { type: ['integer', 'null'] }, provisional: { type: 'boolean' }, assessedAt: { type: 'string', format: 'date' } } },
              { type: 'null' },
            ],
          },
          trustiUrl: { type: 'string', description: 'Fiche publique de l\'app sur Trusti (lien à afficher avec l\'attribution).' },
          updatedAt: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      Assessment: {
        type: 'object',
        properties: {
          appId: { type: 'string' },
          grade: ref('Grade'),
          score: { type: ['integer', 'null'], description: 'Score sur 100.' },
          scoreRange: { description: 'Fourchette de score quand des critères sont provisoires.' },
          computedGrade: { oneOf: [ref('Grade'), { type: 'null' }], description: 'Note issue du calcul, avant éventuelle correction manuelle.' },
          overridden: { type: 'boolean', description: 'Vrai si la note publiée a été corrigée à la main.' },
          provisional: { type: 'boolean' },
          hasUnverifiedSources: { type: 'boolean' },
          assessedAt: { type: ['string', 'null'], format: 'date' },
          summary: { type: 'string', description: 'Synthèse générée à partir du score, des critères et de la fourchette, dans la langue demandée (lang).' },
          criteria: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string', example: 'controle' },
                name: { type: 'string' },
                weight: { type: ['number', 'null'] },
                points: { type: ['number', 'null'] },
                level: nullableString,
                levelDescription: nullableString,
                confidence: nullableString,
                rationale: nullableString,
                provisional: { type: 'boolean' },
                sources: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { kind: { type: 'string' }, url: nullableString, quote: nullableString, toConfirm: { type: 'boolean', description: 'Source non vérifiée.' } },
                  },
                },
              },
            },
          },
          gradeHistory: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  firstAssessedAt: { type: ['string', 'null'], format: 'date' },
                  changes: { type: 'array', items: { type: 'object', properties: { date: { type: 'string', format: 'date' }, from: ref('Grade'), to: ref('Grade') } } },
                },
              },
              { type: 'null' },
            ],
          },
        },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } } } },
      },
    },
  },
};
