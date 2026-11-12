/**
 * Questionnaire d'audit de terrain : questions applicables et résultat.
 * Fonctions pures, testées dans tests/technical/auditChecklist.test.js.
 */
import { AUDIT_QUESTIONS, AUDIT_ANSWERS, AUDIT_WEIGHTS } from '../constants/auditChecklist.js';

const VALID_ANSWERS = new Set(AUDIT_ANSWERS.map(a => a.id));

/** Questions qui concernent un profil (sans profil : questions communes à tous). */
export function questionsForProfile(profileId, questions = AUDIT_QUESTIONS) {
  return questions.filter(q => !q.profiles || (profileId && q.profiles.includes(profileId)));
}

/** Ne garde que les réponses valides à des questions connues. */
export function sanitizeAuditAnswers(answers, questions = AUDIT_QUESTIONS) {
  const known = new Set(questions.map(q => q.id));
  const clean = {};
  if (!answers || typeof answers !== 'object') return clean;
  for (const [id, value] of Object.entries(answers)) {
    if (known.has(id) && VALID_ANSWERS.has(value)) clean[id] = value;
  }
  return clean;
}

/**
 * Résultat du questionnaire pour un profil.
 * @returns {{total: number, answered: number, risks: object[], unknown: object[], okCount: number}}
 *   risks : questions dont la réponse est la mauvaise, les prioritaires d'abord
 *   unknown : questions répondues « Je ne sais pas »
 */
export function computeAuditResult(answers, profileId, questions = AUDIT_QUESTIONS) {
  const applicable = questionsForProfile(profileId, questions);
  const risks = [];
  const unknown = [];
  let answered = 0;
  let okCount = 0;
  for (const q of applicable) {
    const value = answers?.[q.id];
    if (!VALID_ANSWERS.has(value)) continue;
    answered += 1;
    if (value === 'nsp') unknown.push(q);
    else if (value === q.riskAnswer) risks.push(q);
    else okCount += 1;
  }
  const rank = q => AUDIT_WEIGHTS[q.weight]?.rank ?? 9;
  risks.sort((a, b) => rank(a) - rank(b));
  return { total: applicable.length, answered, risks, unknown, okCount };
}
