/**
 * fetch() natif ne supporte pas l'option `timeout` (silencieusement ignorée) :
 * sans AbortController, une requête vers un hôte qui ne répond jamais peut
 * bloquer l'appelant indéfiniment. Ce helper impose une vraie limite de temps.
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
