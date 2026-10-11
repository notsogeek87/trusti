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
  // Incrément atomique : des tentatives concurrentes ne peuvent pas contourner la limite
  // (l'ancienne lecture puis écriture laissait passer N devinettes en parallèle).
  const rows = await sql`
    INSERT INTO otp_attempts (email, failed_count, locked_until, updated_at)
    VALUES (${email}, 1, ${1 >= maxAttempts ? now + lockoutMs : 0}, ${now})
    ON CONFLICT (email) DO UPDATE SET
      failed_count = otp_attempts.failed_count + 1,
      locked_until = CASE WHEN otp_attempts.failed_count + 1 >= ${maxAttempts}
                          THEN ${now + lockoutMs} ELSE otp_attempts.locked_until END,
      updated_at = ${now}
    RETURNING failed_count, locked_until
  `;
  return { count: Number(rows[0].failed_count), lockedUntil: Number(rows[0].locked_until) };
}

export async function clearOtpFailures(sql, email) {
  await sql`DELETE FROM otp_attempts WHERE email = ${email}`;
}

/**
 * Limite d'envoi de codes OTP (anti-spam email), indépendante des échecs
 * de vérification. Basée sur le nombre de codes déjà émis dans la fenêtre : les anciens
 * codes doivent donc être invalidés (used = true) et non supprimés à chaque renvoi,
 * sinon le compte reste à 1 et la limite ne se déclenche jamais.
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
