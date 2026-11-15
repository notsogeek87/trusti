import { t } from '../i18n/index.js';
/**
 * Filtres du nettoyeur de stockage (SystemCleaner), inspirés de SD Maid SE.
 *
 * Ce fichier est la SEULE source de vérité des règles : la liste est envoyée
 * telle quelle au plugin natif (SystemCleanerPlugin.java), qui l'applique en
 * parcourant le stockage partagé. `matchesFilter` ci-dessous est l'implémentation
 * de référence de la même sémantique (utilisée par les tests) ; le plugin Java
 * doit rester aligné dessus.
 *
 * Sémantique d'une règle (toutes les conditions présentes doivent être vraies) :
 *  - under        : préfixe de dossier (relatif à la racine du stockage, minuscules,
 *                   terminé par "/"). Absent = règle globale, qui ignore alors tout
 *                   ce qui est sous "android/" (données d'apps : jamais touché).
 *  - exts         : extensions de fichier acceptées (sans point, minuscules).
 *  - nameRegex    : expression régulière testée sur le nom de fichier en minuscules.
 *  - minAgeDays   : ancienneté minimale (dernière modification).
 *  - emptyDirs    : la règle cible les dossiers vides (jamais les fichiers).
 *  - anyFile      : (avec under) tout fichier du dossier est visé.
 * Un filtre correspond si AU MOINS UNE de ses règles correspond.
 *
 * `defaultSelected: false` = suppression potentiellement discutable : le filtre
 * est affiché mais décoché par défaut.
 */

export const CLEANER_FILTERS = [
  {
    id: 'incomplete-downloads',
    get label() { return t('cleaner.filters.incomplete-downloads.label'); },
    get description() { return t('cleaner.filters.incomplete-downloads.description'); },
    defaultSelected: true,
    rules: [{ exts: ['crdownload', 'part', 'partial', 'download', 'opdownload'], minAgeDays: 1 }],
  },
  {
    id: 'temp-files',
    get label() { return t('cleaner.filters.temp-files.label'); },
    get description() { return t('cleaner.filters.temp-files.description'); },
    defaultSelected: true,
    rules: [{ exts: ['tmp', 'temp'], minAgeDays: 7 }],
  },
  {
    id: 'orphan-thumbnails',
    get label() { return t('cleaner.filters.orphan-thumbnails.label'); },
    get description() { return t('cleaner.filters.orphan-thumbnails.description'); },
    defaultSelected: true,
    rules: [
      { under: 'dcim/.thumbnails/', anyFile: true },
      { under: 'pictures/.thumbnails/', anyFile: true },
      { under: '.thumbnails/', anyFile: true },
    ],
  },
  {
    id: 'whatsapp-statuses',
    get label() { return t('cleaner.filters.whatsapp-statuses.label'); },
    get description() { return t('cleaner.filters.whatsapp-statuses.description'); },
    defaultSelected: true,
    rules: [
      { under: 'android/media/com.whatsapp/whatsapp/media/.statuses/', anyFile: true, minAgeDays: 30 },
      { under: 'whatsapp/media/.statuses/', anyFile: true, minAgeDays: 30 },
    ],
  },
  {
    id: 'old-apks',
    get label() { return t('cleaner.filters.old-apks.label'); },
    get description() { return t('cleaner.filters.old-apks.description'); },
    defaultSelected: false,
    rules: [{ under: 'download/', exts: ['apk', 'apks', 'xapk'], minAgeDays: 30 }],
  },
  {
    id: 'ota-leftovers',
    get label() { return t('cleaner.filters.ota-leftovers.label'); },
    get description() { return t('cleaner.filters.ota-leftovers.description'); },
    defaultSelected: false,
    rules: [{ under: 'download/', exts: ['zip'], nameRegex: '^(ota|update)[-_.a-z0-9]*\\.zip$', minAgeDays: 30 }],
  },
  {
    id: 'logs-and-reports',
    get label() { return t('cleaner.filters.logs-and-reports.label'); },
    get description() { return t('cleaner.filters.logs-and-reports.description'); },
    defaultSelected: false,
    rules: [
      { exts: ['log', 'trace'], minAgeDays: 30 },
      { under: 'bugreports/', anyFile: true, minAgeDays: 30 },
    ],
  },
  {
    id: 'empty-directories',
    get label() { return t('cleaner.filters.empty-directories.label'); },
    get description() { return t('cleaner.filters.empty-directories.description'); },
    defaultSelected: false,
    rules: [{ emptyDirs: true, minAgeDays: 30 }],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export const getFileName = (relPath) => relPath.slice(relPath.lastIndexOf('/') + 1);

export const getExtension = (name) => {
  const dot = name.lastIndexOf('.');
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1) : '';
};

/**
 * @param {object} filter  un élément de CLEANER_FILTERS
 * @param {string} relPath chemin relatif à la racine du stockage (casse libre)
 * @param {{ isDir?: boolean, isEmpty?: boolean, modifiedMs: number, nowMs?: number }} info
 */
export const matchesFilter = (filter, relPath, { isDir = false, isEmpty = false, modifiedMs, nowMs = Date.now() }) => {
  const path = relPath.toLowerCase().replace(/^\/+/, '');
  const name = getFileName(path);
  const ageDays = (nowMs - modifiedMs) / DAY_MS;

  return filter.rules.some((rule) => {
    if (rule.emptyDirs) {
      if (!isDir || !isEmpty) return false;
    } else if (isDir) {
      return false;
    }
    if (rule.under) {
      if (!path.startsWith(rule.under)) return false;
    } else if (path.startsWith('android/')) {
      return false;
    }
    if (rule.exts && !rule.exts.includes(getExtension(name))) return false;
    if (rule.nameRegex && !new RegExp(rule.nameRegex).test(name)) return false;
    if (rule.minAgeDays && ageDays < rule.minAgeDays) return false;
    if (!rule.emptyDirs && !rule.exts && !rule.nameRegex && !rule.anyFile) return false;
    return true;
  });
};
