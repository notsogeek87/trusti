/**
 * Contenu du parcours « Migration guidée » (voir MigrationGuideModal).
 * Textes : src/i18n/locales/<langue>/migration.js. Les motifs `match` restent en français :
 * ils s'appliquent aux noms de catégories (clés en base), pas à l'affichage.
 */
import { t } from '../i18n/index.js';

// Étapes du parcours, dans l'ordre. `id` sert de clé de progression stockée.
export const MIGRATION_STEPS = [
  { id: 'choose', get title() { return t('migration.steps.choose.title'); }, get short() { return t('migration.steps.choose.short'); } },
  { id: 'install', get title() { return t('migration.steps.install.title'); }, get short() { return t('migration.steps.install.short'); } },
  { id: 'transfer', get title() { return t('migration.steps.transfer.title'); }, get short() { return t('migration.steps.transfer.short'); } },
  { id: 'cleanup', get title() { return t('migration.steps.cleanup.title'); }, get short() { return t('migration.steps.cleanup.short'); } },
];

// Conseils d'export / d'import selon la catégorie de l'app remplacée. Le
// premier motif (sous-chaîne, insensible à la casse) qui correspond gagne.
export const DATA_TIPS = [
  {
    match: ['messagerie', 'communication', 'visioconf'],
    get export() { return t('migration.tips.0.export'); },
    get import() { return t('migration.tips.0.import'); },
  },
  {
    match: ['email', 'mail'],
    get export() { return t('migration.tips.1.export'); },
    get import() { return t('migration.tips.1.import'); },
  },
  {
    match: ['mot de passe', 'mots de passe'],
    get export() { return t('migration.tips.2.export'); },
    get import() { return t('migration.tips.2.import'); },
  },
  {
    match: ['stockage cloud', 'cloud'],
    get export() { return t('migration.tips.3.export'); },
    get import() { return t('migration.tips.3.import'); },
  },
  {
    match: ['prise de notes', 'notes'],
    get export() { return t('migration.tips.4.export'); },
    get import() { return t('migration.tips.4.import'); },
  },
  {
    match: ['photo'],
    get export() { return t('migration.tips.5.export'); },
    get import() { return t('migration.tips.5.import'); },
  },
  {
    match: ['streaming musical', 'musique'],
    get export() { return t('migration.tips.6.export'); },
    get import() { return t('migration.tips.6.import'); },
  },
  {
    match: ['navigateur', 'moteur'],
    get export() { return t('migration.tips.7.export'); },
    get import() { return t('migration.tips.7.import'); },
  },
  {
    match: ['réseaux sociaux', 'rencontres'],
    get export() { return t('migration.tips.8.export'); },
    get import() { return t('migration.tips.8.import'); },
  },
  {
    match: ['banque', 'finance', 'paiement'],
    get export() { return t('migration.tips.9.export'); },
    get import() { return t('migration.tips.9.import'); },
  },
];

// Conseils génériques quand aucune catégorie ne correspond.
export const DEFAULT_DATA_TIPS = {
  get export() { return t('migration.defaultTips.export'); },
  get import() { return t('migration.defaultTips.import'); },
};

// Conseils pour quitter proprement l'ancienne app.
export const getCleanupTips = () => t('migration.cleanup');
