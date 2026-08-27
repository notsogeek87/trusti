/**
 * Rate-limiting OTP persistant en base (table otp_attempts).
 *
 * Remplace les Map en mémoire utilisées auparavant : sur Vercel, chaque
 * invocation peut s'exécuter sur une instance différente, donc un compteur
 * en mémoire ne bloque pas fiablement les tentatives distribuées.
 * Nécessite la migration server/database/add-otp-attempts-table.js.
 */

export async function getOtpLock(sql, email) {
  const rows = await sql`
    SELECT failed_count, locked_until FROM otp_attempts WHERE email = ${email} LIMIT 1
  `;
  if (rows.length === 0) return { count: 0, lockedUntil: 0 };
  return { count: Number(rows[0].failed_count), lockedUntil: Number(rows[0].locked_until) };
}

export async function registerOtpFailure(sql, email, { maxAttempts = 5, lockoutMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const current = await getOtpLock(sql, email);
  const count = current.count + 1;
  const lockedUntil = count >= maxAttempts ? now + lockoutMs : 0;

  await sql`
    INSERT INTO otp_attempts (email, failed_count, locked_until, updated_at)
    VALUES (${email}, ${count}, ${lockedUntil}, ${now})
    ON CONFLICT (email) DO UPDATE
      SET failed_count = ${count}, locked_until = ${lockedUntil}, updated_at = ${now}
  `;

  return { count, lockedUntil };
}

export async function clearOtpFailures(sql, email) {
  await sql`DELETE FROM otp_attempts WHERE email = ${email}`;
}

/**
 * Limite d'envoi de codes OTP (anti-spam email), indépendante des échecs
 * de vérification. Basée sur le nombre de codes déjà émis dans la fenêtre.
 */
export async function checkSendRateLimit(sql, email, { maxPerWindow = 3, windowMs = 5 * 60 * 1000 } = {}) {
  const recentResult = await sql`
    SELECT COUNT(*) AS count FROM magic_link_tokens
    WHERE email = ${email}
      AND LENGTH(token) = 6
      AND expires_at > ${Date.now() - windowMs}
  `;
  return parseInt(recentResult[0].count, 10) < maxPerWindow;
}
