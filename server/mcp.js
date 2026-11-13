// Point d'accès MCP (Model Context Protocol) pour administrer la base Trusti depuis Claude.
// Transport « Streamable HTTP » sans état : chaque POST /mcp contient un message JSON-RPC
// et reçoit une réponse JSON. Aucune dépendance : seulement Express et pg, déjà présents.
//
// Sécurité :
// - inactif tant que MCP_TOKEN n'est pas défini (au moins 32 caractères) ;
// - en-tête « Authorization: Bearer <MCP_TOKEN> » exigé, comparaison en temps constant ;
// - une seule instruction SQL par appel, délai maximal 15 s, 500 lignes renvoyées au plus.

import crypto from 'node:crypto';

export const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const MAX_ROWS = 500;

const TOOLS = [
  {
    name: 'run_sql',
    description:
      "Exécute UNE instruction SQL PostgreSQL sur la base Trusti (lecture ou écriture). " +
      "Utiliser $1, $2... avec 'params' pour les valeurs. Renvoie les lignes (500 max) et le nombre de lignes touchées.",
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'Instruction SQL unique' },
        params: { type: 'array', description: 'Valeurs des paramètres $1, $2...', items: {} },
      },
      required: ['sql'],
    },
  },
  {
    name: 'list_tables',
    description: 'Liste les tables du schéma public avec leur nombre de lignes estimé.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'describe_table',
    description: "Colonnes d'une table (nom, type, nullable, valeur par défaut).",
    inputSchema: {
      type: 'object',
      properties: { table: { type: 'string' } },
      required: ['table'],
    },
  },
];

/** Vérifie l'en-tête Authorization (Bearer) en temps constant. */
export function isAuthorized(header, token) {
  if (!token || token.length < 32) return false;
  const match = /^Bearer\s+(.+)$/i.exec(String(header || ''));
  if (!match) return false;
  const a = crypto.createHash('sha256').update(match[1].trim()).digest();
  const b = crypto.createHash('sha256').update(token).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Refuse plusieurs instructions dans un même appel (point-virgule hors fin de texte). */
export function isSingleStatement(sql) {
  const trimmed = String(sql || '').trim().replace(/;\s*$/, '');
  // Retire chaînes et commentaires avant de chercher un « ; » restant.
  const stripped = trimmed
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/"(?:""|[^"])*"/g, '""')
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  return trimmed.length > 0 && !stripped.includes(';');
}

const textResult = (value, isError = false) => ({
  content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
  ...(isError ? { isError: true } : {}),
});

/**
 * Traite un message JSON-RPC. `query(sql, params)` exécute le SQL et renvoie
 * { rows, rowCount, command }. Renvoie null pour une notification (pas de réponse).
 */
export async function handleRpc(message, query) {
  const { id, method, params = {} } = message || {};
  const reply = (result) => ({ jsonrpc: '2.0', id, result });
  const fail = (code, msg) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message: msg } });

  if (!message || message.jsonrpc !== '2.0' || typeof method !== 'string') {
    return fail(-32600, 'Requête JSON-RPC invalide');
  }
  if (id === undefined) return null; // notification (ex. notifications/initialized)

  switch (method) {
    case 'initialize': {
      const asked = params.protocolVersion;
      return reply({
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'trusti-db', version: '1.0.0' },
        instructions:
          "Base PostgreSQL de Trusti (hébergée chez Hyperfluid). Tables principales : applications, " +
          'app_relations, app_assessments, app_assessment_history, app_migration_guides. ' +
          "Toujours lire avant d'écrire, et faire valider les écritures par l'utilisateur.",
      });
    }
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools: TOOLS });
    case 'tools/call': {
      const name = params.name;
      const args = params.arguments || {};
      try {
        if (name === 'list_tables') {
          const r = await query(
            `SELECT c.relname AS table, c.reltuples::bigint AS lignes_estimees
               FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY 1`
          );
          return reply(textResult(r.rows));
        }
        if (name === 'describe_table') {
          const r = await query(
            `SELECT column_name, data_type, is_nullable, column_default
               FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
            [String(args.table || '')]
          );
          return reply(textResult(r.rows.length ? r.rows : `Table inconnue : ${args.table}`, !r.rows.length));
        }
        if (name === 'run_sql') {
          if (!isSingleStatement(args.sql)) {
            return reply(textResult('Une seule instruction SQL par appel.', true));
          }
          const r = await query(String(args.sql), Array.isArray(args.params) ? args.params : []);
          const rows = r.rows || [];
          return reply(
            textResult({
              commande: r.command,
              lignes_touchees: r.rowCount,
              lignes: rows.slice(0, MAX_ROWS),
              tronque: rows.length > MAX_ROWS,
            })
          );
        }
        return fail(-32602, `Outil inconnu : ${name}`);
      } catch (error) {
        return reply(textResult(`Erreur SQL : ${error.message}`, true));
      }
    }
    default:
      return fail(-32601, `Méthode non prise en charge : ${method}`);
  }
}

/**
 * Monte POST /mcp sur l'application Express si MCP_TOKEN est défini.
 * `getPool()` renvoie un pg.Pool (créé à la demande).
 */
export function mountMcp(app, { token = process.env.MCP_TOKEN, getPool }) {
  if (!token || token.length < 32) return false;

  const query = async (sql, params = []) => {
    const client = await getPool().connect();
    try {
      await client.query("SET statement_timeout = '15s'");
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  };

  app.all('/mcp', async (req, res) => {
    if (!isAuthorized(req.headers.authorization, token)) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    if (req.method !== 'POST') {
      // Pas de flux serveur→client (mode sans état).
      return res.status(405).set('Allow', 'POST').end();
    }
    const body = req.body;
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((m) => handleRpc(m, query)))).filter(Boolean);
      return out.length ? res.json(out) : res.status(202).end();
    }
    const out = await handleRpc(body, query);
    return out ? res.json(out) : res.status(202).end();
  });
  return true;
}
