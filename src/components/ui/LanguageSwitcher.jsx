import React from 'react';
import { Globe } from 'lucide-react';
import { ENABLED_LANGUAGES, LANGUAGE_NAMES } from '../../i18n/languages';
import { changeLanguage, getLanguage, t } from '../../i18n';

/**
 * Choix de la langue de l'interface. N'apparaît que si plusieurs langues sont activées
 * (une langue n'est activée que lorsque sa traduction est complète).
 */
const LanguageSwitcher = ({ className = '' }) => {
  if (ENABLED_LANGUAGES.length < 2) return null;
  const current = getLanguage();
  return (
    <label
      className={`relative flex items-center gap-1 p-1.5 md:px-2 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer ${className}`}
      title={t('common.languageChange')}
    >
      <Globe size={18} className="shrink-0" aria-hidden="true" />
      <span className="text-xs font-black uppercase">{current}</span>
      <select
        className="absolute inset-0 opacity-0 cursor-pointer"
        value={current}
        aria-label={t('common.language')}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {ENABLED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang} lang={lang}>{LANGUAGE_NAMES[lang]}</option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;
