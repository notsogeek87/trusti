/**
 * Accès base unique : même syntaxe sql`...` quel que soit le Postgres.
 *  - Neon (hôte *.neon.tech)  -> @neondatabase/serverless (HTTP)
 *  - Autre Postgres (Hyperfluid, VPS...) -> pg (TCP)
 * Forçable avec DB_DRIVER=neon|pg. Chargement paresseux : DATABASE_URL est lue
 * au premier appel, donc après dotenv, et aucun driver n'est importé avant.
 */

/** Convertit un template sql`...${x}...` en requête paramétrée ($1, $2...). */
export function toQuery(strings, values) {
  let text = strings[0];
  for (let i = 1; i < strings.length; i++) text += `$${i}${strings[i]}`;
  return { text, values };
}

/** Choisit le driver à partir de DB_DRIVER ou de l'hôte de DATABASE_URL. */
export function pickDriver(url, forced) {
  if (forced === 'neon' || forced === 'pg') return forced;
  try {
    return new URL(url).hostname.endsWith('.neon.tech') ? 'neon' : 'pg';
  } catch {
    return 'neon';
  }
}

let runner;

async function buildRunner() {
  const url = process.env.DATABASE_URL;
  if (pickDriver(url, process.env.DB_DRIVER) === 'neon') {
    const { neon } = await import('@neondatabase/serverless');
    const client = neon(url);
    return (strings, values) => client(strings, ...values);
  }
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString: url, max: 5 });
  return async (strings, values) => {
    const { text, values: params } = toQuery(strings, values);
    const result = await pool.query(text, params);
    return result.rows;
  };
}

export default async function sql(strings, ...values) {
  runner ??= buildRunner();
  return (await runner)(strings, values);
}
