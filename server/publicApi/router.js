/**
 * API partenaires en lecture seule : /api/v1 (montée par server/production.js et server/index.js).
 *
 * - Authentification : « Authorization: Bearer tsk_... », une clé par partenaire (partners.js).
 * - Limite de débit par partenaire (rate_per_minute en base) et par IP pour les clés refusées.
 * - Réponses { data, meta } avec licence et attribution (format.js), erreurs { error: { code, message } }.
 * - Pas d'en-têtes CORS : l'API s'appelle depuis un serveur, jamais depuis un navigateur
 *   (la clé serait visible de tous). Seule la spec OpenAPI est lisible sans clé.
 *
 * Les accès base sont injectés (`deps`) pour pouvoir tester le routeur sans base.
 */
import express from 'express';
import { createRateLimiter, createApiCache } from '../protection.js';
import { normalizeContentLang } from '../contentTranslations.js';
import { parseSince } from '../gradeChanges.js';
import { extractKey } from './partners.js';
import {
  BadRequest, envelope, errorBody, paginationMeta, parseListQuery, toPublicApp, toPublicAssessment,
} from './format.js';
import { openApiSpec } from './openapi.js';

const ID_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;

/**
 * @param {object} deps
 * @param {(key: string) => Promise<{id, name, ratePerMinute}|null>} deps.resolvePartner
 * @param {object} deps.db lectures : listApps, getAppsByIds, getCategories, getAllAssessments,
 *   getAssessment, getGradeHistory, getGradeChangesSince, getAlternativeIds, translate
 */
export function createPublicApiRouter({ resolvePartner, db, cacheTtlMs = 60_000, exportTtlMs = 10 * 60_000 }) {
  const router = express.Router();
  const failedAuthLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 30 });
  const partnerLimiters = new Map(); // débit/minute -> limiteur
  const cache = createApiCache({ ttlMs: cacheTtlMs });
  const exportCache = createApiCache({ ttlMs: exportTtlMs, maxEntries: 5 });

  const limiterFor = (rate) => {
    if (!partnerLimiters.has(rate)) partnerLimiters.set(rate, createRateLimiter({ windowMs: 60_000, max: rate }));
    return partnerLimiters.get(rate);
  };

  // Lecture seule.
  router.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') return next();
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json(errorBody('method_not_allowed', 'API en lecture seule : GET uniquement.'));
  });

  router.get('/openapi.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(openApiSpec);
  });

  // Authentification par clé partenaire, puis limite de débit du partenaire.
  router.use(async (req, res, next) => {
    try {
      const ip = req.ip || 'inconnue';
      const key = extractKey(req.headers.authorization);
      const partner = key ? await resolvePartner(key) : null;
      if (!partner) {
        const { allowed, retryAfterSec } = failedAuthLimiter.check(ip);
        if (!allowed) {
          res.setHeader('Retry-After', String(retryAfterSec));
          return res.status(429).json(errorBody('rate_limited', 'Trop de tentatives refusées, réessayez plus tard.'));
        }
        res.setHeader('WWW-Authenticate', 'Bearer realm="trusti-api"');
        return res.status(401).json(errorBody('unauthorized', 'Clé absente ou invalide : en-tête « Authorization: Bearer <clé> » attendu.'));
      }
      const { allowed, retryAfterSec } = limiterFor(partner.ratePerMinute).check(partner.id);
      res.setHeader('X-RateLimit-Limit', String(partner.ratePerMinute));
      if (!allowed) {
        res.setHeader('Retry-After', String(retryAfterSec));
        return res.status(429).json(errorBody('rate_limited', `Limite de ${partner.ratePerMinute} requêtes par minute atteinte.`));
      }
      req.partner = partner;
      res.setHeader('Cache-Control', 'private, max-age=60');
      res.setHeader('Vary', 'Authorization');
      return next();
    } catch (error) {
      return next(error);
    }
  });

  const lang = (req) => normalizeContentLang(req.query.lang);
  const langMeta = (req) => ({ lang: lang(req) || 'fr' });

  // Traduit puis met en forme des lignes brutes d'apps.
  async function publicApps(req, rows) {
    const translated = await db.translate(lang(req), { apps: rows });
    return translated.apps.map(toPublicApp);
  }

  async function findApp(req, res) {
    const { id } = req.params;
    if (!ID_PATTERN.test(id)) {
      res.status(404).json(errorBody('not_found', 'Application inconnue.'));
      return null;
    }
    const [row] = await db.getAppsByIds([id]);
    if (!row) {
      res.status(404).json(errorBody('not_found', 'Application inconnue.'));
      return null;
    }
    return row;
  }

  router.get('/', (req, res) => {
    res.json(envelope({
      name: 'API TrustiScore',
      documentation: '/api/v1/openapi.json',
      endpoints: ['/api/v1/apps', '/api/v1/apps/{id}', '/api/v1/apps/{id}/assessment', '/api/v1/apps/{id}/alternatives',
        '/api/v1/grade-changes', '/api/v1/categories', '/api/v1/export'],
      partner: req.partner.name,
    }));
  });

  const cached = (c) => (req, res, next) => (req.method === 'GET' ? c.middleware(req, res, next) : next());

  router.get('/apps', cached(cache), async (req, res, next) => {
    try {
      const filters = parseListQuery(req.query);
      const { rows, total } = await db.listApps(filters);
      res.json(envelope(await publicApps(req, rows), { ...paginationMeta(filters, total), ...langMeta(req) }));
    } catch (error) {
      next(error);
    }
  });

  router.get('/apps/:id', cached(cache), async (req, res, next) => {
    try {
      const row = await findApp(req, res);
      if (!row) return;
      const [app] = await publicApps(req, [row]);
      res.json(envelope(app, langMeta(req)));
    } catch (error) {
      next(error);
    }
  });

  router.get('/apps/:id/assessment', cached(cache), async (req, res, next) => {
    try {
      const row = await findApp(req, res);
      if (!row) return;
      const [assessment, history] = await Promise.all([db.getAssessment(row.id), db.getGradeHistory(row.id)]);
      if (!assessment) {
        return res.status(404).json(errorBody('not_assessed', 'Cette application n\'a pas encore d\'évaluation détaillée.'));
      }
      const { assessments } = await db.translate(lang(req), { assessments: [assessment] });
      res.json(envelope(toPublicAssessment(assessments[0], history), langMeta(req)));
    } catch (error) {
      next(error);
    }
  });

  router.get('/apps/:id/alternatives', cached(cache), async (req, res, next) => {
    try {
      const row = await findApp(req, res);
      if (!row) return;
      const ids = await db.getAlternativeIds(row.id);
      const rows = await db.getAppsByIds(ids);
      const apps = (await publicApps(req, rows))
        .sort((a, b) => String(a.grade).localeCompare(String(b.grade)) || a.name.localeCompare(b.name));
      res.json(envelope(apps, langMeta(req)));
    } catch (error) {
      next(error);
    }
  });

  router.get('/grade-changes', cached(cache), async (req, res, next) => {
    try {
      const since = parseSince(req.query.since);
      if (!since) throw new BadRequest('since doit être une date AAAA-MM-JJ');
      const changes = await db.getGradeChangesSince(since);
      res.json(envelope(changes, { since }));
    } catch (error) {
      next(error);
    }
  });

  router.get('/categories', cached(cache), async (req, res, next) => {
    try {
      res.json(envelope(await db.getCategories()));
    } catch (error) {
      next(error);
    }
  });

  router.get('/export', cached(exportCache), async (req, res, next) => {
    try {
      const filters = { grades: null, category: null, q: null, updatedSince: null, limit: 100_000, offset: 0 };
      const [{ rows }, assessmentMap] = await Promise.all([db.listApps(filters), db.getAllAssessments()]);
      const assessments = rows.map(r => assessmentMap.get(String(r.id))).filter(Boolean);
      const translated = await db.translate(lang(req), { apps: rows, assessments });
      const byId = new Map(translated.assessments.map(a => [String(a.appId), a]));
      const data = translated.apps.map(r => ({
        ...toPublicApp(r),
        assessmentDetail: toPublicAssessment(byId.get(String(r.id)) || null),
      }));
      res.json(envelope(data, { generatedAt: new Date().toISOString(), count: data.length, ...langMeta(req) }));
    } catch (error) {
      next(error);
    }
  });

  router.use((req, res) => {
    res.status(404).json(errorBody('not_found', 'Route inconnue. Voir /api/v1/openapi.json.'));
  });

  // eslint-disable-next-line no-unused-vars
  router.use((error, req, res, next) => {
    if (error instanceof BadRequest) return res.status(400).json(errorBody('bad_request', error.message));
    console.error('[api v1]', error);
    return res.status(500).json(errorBody('internal_error', 'Erreur interne, réessayez plus tard.'));
  });

  return router;
}
