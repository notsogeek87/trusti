/**
 * Synthèse publique d'une évaluation TrustiScore, générée à partir des données
 * structurées (score, fourchette, critères, correction de note), en fr / en / de.
 *
 * Elle remplace le champ `summary` de la table app_assessments, qui est une note de
 * travail interne de la chaîne d'évaluation (trustillm) et ne doit jamais sortir.
 * Fonctions pures : testées dans tests/server/publicApi.test.js.
 */

const CRITERIA_ORDER = ['gouvernance', 'localisation', 'controle', 'conformite', 'transparence'];

const LABELS = {
  fr: {
    controle: 'contrôle technique', conformite: 'conformité et certifications', gouvernance: 'gouvernance et juridiction',
    localisation: 'localisation des données', transparence: 'transparence',
  },
  en: {
    controle: 'technical control', conformite: 'compliance and certifications', gouvernance: 'governance and jurisdiction',
    localisation: 'data location', transparence: 'transparency',
  },
  de: {
    controle: 'technische Kontrolle', conformite: 'Konformität und Zertifizierungen', gouvernance: 'Governance und Rechtsraum',
    localisation: 'Datenstandort', transparence: 'Transparenz',
  },
};

// Exposition aux lois étrangères, d'après le niveau du critère « gouvernance » (0 à 4 points).
// Le niveau 4 couvre aussi les projets libres sans société propriétaire : d'où « ou communautaire ».
const JURISDICTION = {
  fr: [
    'Éditeur soumis au Cloud Act américain ou à des lois extraterritoriales équivalentes.',
    'Éditeur étranger, hors Union européenne, avec des garanties contractuelles minimales.',
    'Filiale européenne d\'un groupe étranger : exposition modérée aux lois extraterritoriales.',
    'Groupe européen à l\'actionnariat mixte : protection partielle contre les lois extraterritoriales.',
    'Gouvernance européenne ou communautaire : pas d\'exposition identifiée aux lois extraterritoriales.',
  ],
  en: [
    'Publisher subject to the US Cloud Act or equivalent extraterritorial laws.',
    'Foreign publisher, outside the European Union, with minimal contractual safeguards.',
    'European subsidiary of a foreign group: moderate exposure to extraterritorial laws.',
    'European group with mixed ownership: partial protection against extraterritorial laws.',
    'European or community governance: no identified exposure to extraterritorial laws.',
  ],
  de: [
    'Anbieter unterliegt dem US-amerikanischen Cloud Act oder vergleichbaren extraterritorialen Gesetzen.',
    'Ausländischer Anbieter außerhalb der Europäischen Union mit minimalen vertraglichen Garantien.',
    'Europäische Tochtergesellschaft eines ausländischen Konzerns: mäßige Gefährdung durch extraterritoriale Gesetze.',
    'Europäischer Konzern mit gemischten Eigentumsverhältnissen: teilweiser Schutz vor extraterritorialen Gesetzen.',
    'Europäische oder gemeinschaftliche Governance: keine erkennbare Gefährdung durch extraterritoriale Gesetze.',
  ],
};

const band = (s) => (s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : s >= 20 ? 'D' : 'E');

const TEXT = {
  fr: {
    sep: ' ; ',
    score: (s, g) => `Score de ${s}/100, note ${g}.`,
    noScore: (g) => `Note ${g}, sans score détaillé : les informations disponibles ne permettent pas de noter chaque critère.`,
    overridden: (c, g) => `Note abaissée de ${c} à ${g} par décision éditoriale.`,
    strengths: (l) => `Points forts : ${l}.`,
    weaknesses: (l) => `Points faibles : ${l}.`,
    range: (a, b) => `Évaluation provisoire : selon les points à confirmer, le score pourrait aller de ${a} (${band(a)}) à ${b} (${band(b)}).`,
    provisional: 'Évaluation provisoire : certains points restent à confirmer.',
    unverified: 'Certaines sources restent à vérifier.',
  },
  en: {
    sep: '; ',
    score: (s, g) => `Score of ${s}/100, grade ${g}.`,
    noScore: (g) => `Grade ${g}, without a detailed score: the available information does not allow each criterion to be rated.`,
    overridden: (c, g) => `Grade lowered from ${c} to ${g} by editorial decision.`,
    strengths: (l) => `Strengths: ${l}.`,
    weaknesses: (l) => `Weaknesses: ${l}.`,
    range: (a, b) => `Provisional assessment: depending on the points still to be confirmed, the score could range from ${a} (${band(a)}) to ${b} (${band(b)}).`,
    provisional: 'Provisional assessment: some points are still to be confirmed.',
    unverified: 'Some sources are still to be verified.',
  },
  de: {
    sep: '; ',
    score: (s, g) => `Punktzahl ${s}/100, Note ${g}.`,
    noScore: (g) => `Note ${g}, ohne detaillierte Punktzahl: Die verfügbaren Informationen reichen nicht aus, um jedes Kriterium zu bewerten.`,
    overridden: (c, g) => `Note durch redaktionelle Entscheidung von ${c} auf ${g} herabgesetzt.`,
    strengths: (l) => `Stärken: ${l}.`,
    weaknesses: (l) => `Schwächen: ${l}.`,
    range: (a, b) => `Vorläufige Bewertung: Je nach noch zu bestätigenden Punkten könnte die Punktzahl zwischen ${a} (${band(a)}) und ${b} (${band(b)}) liegen.`,
    provisional: 'Vorläufige Bewertung: Einige Punkte müssen noch bestätigt werden.',
    unverified: 'Einige Quellen müssen noch überprüft werden.',
  },
};

/**
 * @param {object} assessment format de server/assessment.js (score, scoreRange, grade, computedGrade,
 *   overridden, provisional, hasUnverifiedSources, criteria[{ key, points }])
 * @param {'fr'|'en'|'de'} lang
 * @returns {string|null}
 */
export function buildSynthesis(assessment, lang = 'fr') {
  if (!assessment) return null;
  const t = TEXT[lang] || TEXT.fr;
  const labels = LABELS[lang] || LABELS.fr;
  const parts = [];
  const hasScore = Number.isFinite(assessment.score);

  parts.push(hasScore ? t.score(assessment.score, assessment.grade) : t.noScore(assessment.grade));

  if (assessment.overridden && assessment.computedGrade && assessment.computedGrade !== assessment.grade) {
    parts.push(t.overridden(assessment.computedGrade, assessment.grade));
  }

  const gov = (assessment.criteria || []).find(c => c.key === 'gouvernance');
  const jurisdiction = (JURISDICTION[lang] || JURISDICTION.fr)[gov?.points];
  if (jurisdiction) parts.push(jurisdiction);

  // La gouvernance a sa propre phrase : elle n'est pas répétée dans les points forts / faibles.
  const criteria = [...(assessment.criteria || [])]
    .filter(c => Number.isFinite(c.points) && labels[c.key] && c.key !== 'gouvernance')
    .sort((a, b) => CRITERIA_ORDER.indexOf(a.key) - CRITERIA_ORDER.indexOf(b.key));
  const strong = criteria.filter(c => c.points >= 3).map(c => labels[c.key]);
  const weak = criteria.filter(c => c.points <= 1).map(c => labels[c.key]);
  if (strong.length) parts.push(t.strengths(strong.join(t.sep)));
  if (weak.length) parts.push(t.weaknesses(weak.join(t.sep)));

  const range = assessment.scoreRange;
  if (range && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min !== range.max) {
    parts.push(t.range(range.min, range.max));
  } else if (assessment.provisional) {
    parts.push(t.provisional);
  }
  if (assessment.hasUnverifiedSources) parts.push(t.unverified);

  return parts.join(' ');
}
