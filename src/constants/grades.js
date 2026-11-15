import { t } from '../i18n/index.js';
/**
 * Configuration des notes et leurs couleurs
 */
export const GRADES = ['A', 'B', 'C', 'D', 'E'];

export const GRADE_COLORS = {
  A: 'bg-[#006837]',
  B: 'bg-[#8dc63f]',
  C: 'bg-[#fbb03b]',
  D: 'bg-[#f7931e]',
  E: 'bg-[#c1272d]'
};

// Libellé du grade global déduit du téléphone (moyenne des apps installées)
export const PHONE_GRADE_LABEL = Object.fromEntries(
  ['A', 'B', 'C', 'D', 'E'].map((g) => [g, undefined]),
);
for (const g of Object.keys(PHONE_GRADE_LABEL)) {
  Object.defineProperty(PHONE_GRADE_LABEL, g, { get: () => t(`grades.phone.${g}`), enumerable: true });
}

export const GRADE_INFO = [
  {
    grade: 'A',
    get title() { return t('grades.title.A'); },
    get description() { return t('grades.description.A'); },
    bgColor: 'bg-[#006837]',
    shadowColor: 'shadow-emerald-900/20'
  },
  {
    grade: 'B',
    get title() { return t('grades.title.B'); },
    get description() { return t('grades.description.B'); },
    bgColor: 'bg-[#8dc63f]',
    shadowColor: 'shadow-lime-900/20'
  },
  {
    grade: 'C',
    get title() { return t('grades.title.C'); },
    get description() { return t('grades.description.C'); },
    bgColor: 'bg-[#fbb03b]',
    shadowColor: 'shadow-amber-900/20',
    textColor: 'text-slate-900'
  },
  {
    grade: 'D',
    get title() { return t('grades.title.D'); },
    get description() { return t('grades.description.D'); },
    bgColor: 'bg-[#f7931e]',
    shadowColor: 'shadow-orange-900/20',
    textColor: 'text-slate-900'
  },
  {
    grade: 'E',
    get title() { return t('grades.title.E'); },
    get description() { return t('grades.description.E'); },
    bgColor: 'bg-[#c1272d]',
    shadowColor: 'shadow-rose-900/20'
  }
];
