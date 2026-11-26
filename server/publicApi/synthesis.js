/**
 * Synthèse publique d'une évaluation TrustiScore, générée à partir des données
 * structurées (score, fourchette, critères, correction de note), en fr / en / de / es / it / nl / pl / pt.
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
  es: {
    controle: 'control técnico', conformite: 'cumplimiento y certificaciones', gouvernance: 'gobernanza y jurisdicción',
    localisation: 'ubicación de los datos', transparence: 'transparencia',
  },
  it: {
    controle: 'controllo tecnico', conformite: 'conformità e certificazioni', gouvernance: 'governance e giurisdizione',
    localisation: 'localizzazione dei dati', transparence: 'trasparenza',
  },
  nl: {
    controle: 'technische controle', conformite: 'naleving en certificeringen', gouvernance: 'governance en jurisdictie',
    localisation: 'locatie van de gegevens', transparence: 'transparantie',
  },
  pl: {
    controle: 'kontrola techniczna', conformite: 'zgodność i certyfikaty', gouvernance: 'zarządzanie i jurysdykcja',
    localisation: 'lokalizacja danych', transparence: 'przejrzystość',
  },
  pt: {
    controle: 'controlo técnico', conformite: 'conformidade e certificações', gouvernance: 'governação e jurisdição',
    localisation: 'localização dos dados', transparence: 'transparência',
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
  es: [
    'Editor sujeto a la Cloud Act estadounidense o a leyes extraterritoriales equivalentes.',
    'Editor extranjero, de fuera de la Unión Europea, con garantías contractuales mínimas.',
    'Filial europea de un grupo extranjero: exposición moderada a las leyes extraterritoriales.',
    'Grupo europeo con accionariado mixto: protección parcial frente a las leyes extraterritoriales.',
    'Gobernanza europea o comunitaria: ninguna exposición identificada a leyes extraterritoriales.',
  ],
  it: [
    'Editore soggetto al Cloud Act statunitense o a leggi extraterritoriali equivalenti.',
    "Editore straniero, al di fuori dell'Unione europea, con garanzie contrattuali minime.",
    'Filiale europea di un gruppo straniero: esposizione moderata alle leggi extraterritoriali.',
    'Gruppo europeo con azionariato misto: protezione parziale dalle leggi extraterritoriali.',
    'Governance europea o comunitaria: nessuna esposizione individuata a leggi extraterritoriali.',
  ],
  nl: [
    'Uitgever valt onder de Amerikaanse Cloud Act of vergelijkbare extraterritoriale wetten.',
    'Buitenlandse uitgever, buiten de Europese Unie, met minimale contractuele garanties.',
    'Europees dochterbedrijf van een buitenlandse groep: matige blootstelling aan extraterritoriale wetten.',
    'Europese groep met gemengd aandeelhouderschap: gedeeltelijke bescherming tegen extraterritoriale wetten.',
    'Europese of communitygovernance: geen vastgestelde blootstelling aan extraterritoriale wetten.',
  ],
  pl: [
    'Wydawca podlega amerykańskiemu Cloud Act lub równoważnym przepisom eksterytorialnym.',
    'Zagraniczny wydawca spoza Unii Europejskiej, z minimalnymi gwarancjami umownymi.',
    'Europejska spółka zależna zagranicznej grupy: umiarkowana ekspozycja na przepisy eksterytorialne.',
    'Europejska grupa o mieszanym akcjonariacie: częściowa ochrona przed przepisami eksterytorialnymi.',
    'Zarządzanie europejskie lub społecznościowe: brak stwierdzonej ekspozycji na przepisy eksterytorialne.',
  ],
  pt: [
    'Editor sujeito ao Cloud Act norte-americano ou a leis extraterritoriais equivalentes.',
    'Editor estrangeiro, fora da União Europeia, com garantias contratuais mínimas.',
    'Filial europeia de um grupo estrangeiro: exposição moderada às leis extraterritoriais.',
    'Grupo europeu com estrutura acionista mista: proteção parcial contra as leis extraterritoriais.',
    'Governação europeia ou comunitária: nenhuma exposição identificada a leis extraterritoriais.',
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
  es: {
    sep: '; ',
    score: (s, g) => `Puntuación de ${s}/100, nota ${g}.`,
    noScore: (g) => `Nota ${g}, sin puntuación detallada: la información disponible no permite valorar cada criterio.`,
    overridden: (c, g) => `Nota rebajada de ${c} a ${g} por decisión editorial.`,
    strengths: (l) => `Puntos fuertes: ${l}.`,
    weaknesses: (l) => `Puntos débiles: ${l}.`,
    range: (a, b) => `Evaluación provisional: según los puntos por confirmar, la puntuación podría ir de ${a} (${band(a)}) a ${b} (${band(b)}).`,
    provisional: 'Evaluación provisional: algunos puntos están por confirmar.',
    unverified: 'Algunas fuentes están por verificar.',
  },
  it: {
    sep: '; ',
    score: (s, g) => `Punteggio di ${s}/100, voto ${g}.`,
    noScore: (g) => `Voto ${g}, senza punteggio dettagliato: le informazioni disponibili non permettono di valutare ogni criterio.`,
    overridden: (c, g) => `Voto abbassato da ${c} a ${g} per decisione editoriale.`,
    strengths: (l) => `Punti di forza: ${l}.`,
    weaknesses: (l) => `Punti deboli: ${l}.`,
    range: (a, b) => `Valutazione provvisoria: a seconda dei punti da confermare, il punteggio potrebbe andare da ${a} (${band(a)}) a ${b} (${band(b)}).`,
    provisional: 'Valutazione provvisoria: alcuni punti restano da confermare.',
    unverified: 'Alcune fonti restano da verificare.',
  },
  nl: {
    sep: '; ',
    score: (s, g) => `Score van ${s}/100, beoordeling ${g}.`,
    noScore: (g) => `Beoordeling ${g}, zonder gedetailleerde score: de beschikbare informatie volstaat niet om elk criterium te beoordelen.`,
    overridden: (c, g) => `Beoordeling door redactionele beslissing verlaagd van ${c} naar ${g}.`,
    strengths: (l) => `Sterke punten: ${l}.`,
    weaknesses: (l) => `Zwakke punten: ${l}.`,
    range: (a, b) => `Voorlopige beoordeling: afhankelijk van de nog te bevestigen punten kan de score liggen tussen ${a} (${band(a)}) en ${b} (${band(b)}).`,
    provisional: 'Voorlopige beoordeling: sommige punten moeten nog bevestigd worden.',
    unverified: 'Sommige bronnen moeten nog geverifieerd worden.',
  },
  pl: {
    sep: '; ',
    score: (s, g) => `Wynik ${s}/100, ocena ${g}.`,
    noScore: (g) => `Ocena ${g}, bez szczegółowego wyniku: dostępne informacje nie pozwalają ocenić każdego kryterium.`,
    overridden: (c, g) => `Ocena obniżona z ${c} do ${g} decyzją redakcji.`,
    strengths: (l) => `Mocne strony: ${l}.`,
    weaknesses: (l) => `Słabe strony: ${l}.`,
    range: (a, b) => `Ocena tymczasowa: zależnie od punktów do potwierdzenia wynik mógłby wynieść od ${a} (${band(a)}) do ${b} (${band(b)}).`,
    provisional: 'Ocena tymczasowa: niektóre punkty wymagają jeszcze potwierdzenia.',
    unverified: 'Niektóre źródła wymagają jeszcze weryfikacji.',
  },
  pt: {
    sep: '; ',
    score: (s, g) => `Pontuação de ${s}/100, nota ${g}.`,
    noScore: (g) => `Nota ${g}, sem pontuação detalhada: as informações disponíveis não permitem avaliar cada critério.`,
    overridden: (c, g) => `Nota baixada de ${c} para ${g} por decisão editorial.`,
    strengths: (l) => `Pontos fortes: ${l}.`,
    weaknesses: (l) => `Pontos fracos: ${l}.`,
    range: (a, b) => `Avaliação provisória: consoante os pontos a confirmar, a pontuação poderia ir de ${a} (${band(a)}) a ${b} (${band(b)}).`,
    provisional: 'Avaliação provisória: alguns pontos ainda estão por confirmar.',
    unverified: 'Algumas fontes ainda estão por verificar.',
  },
};

/**
 * @param {object} assessment format de server/assessment.js (score, scoreRange, grade, computedGrade,
 *   overridden, provisional, hasUnverifiedSources, criteria[{ key, points }])
 * @param {'fr'|'en'|'de'|'es'|'it'|'nl'|'pl'|'pt'} lang
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
