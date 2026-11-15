import React from 'react';
import { X, ShieldCheck, BookOpen } from 'lucide-react';
import { GRADE_INFO } from '../constants/grades';
import { t } from '../i18n/index.js';

/**
 * Panneau explicatif du TrustiScore
 */
const ExplainerPanel = ({ onClose }) => {
  const gradeInfo = GRADE_INFO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 text-white rounded-[2.5rem] relative shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-800 max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh] scrollbar-custom-dark p-7">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-1 z-10"
          >
            <X size={20}/>
          </button>
          
          <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-indigo-400">
            <ShieldCheck size={20} />
            <h4 className="font-black text-xs uppercase tracking-widest">{t('myApps.explainer.eyebrow')}</h4>
          </div>
          <h3 className="text-xl font-black mb-3 text-white leading-tight">
            {t('myApps.explainer.title')}
          </h3>
            <p className="text-[13px] leading-relaxed text-slate-400 font-medium">
              {t('myApps.explainer.intro1')} <span className="text-white font-bold text-[12px]">{t('myApps.explainer.privacy')}</span>{' '}
              {t('myApps.explainer.intro2')} <span className="text-white font-bold text-[12px]">{t('myApps.explainer.sovereignty')}</span>{' '}
              {t('myApps.explainer.intro3')}
            </p>
        </div>

        <h4 className="font-black text-[11px] uppercase tracking-widest mb-5 text-slate-500 flex items-center gap-2">
          <div className="h-px bg-slate-800 flex-grow"></div>
          {t('myApps.explainer.scale')}
          <div className="h-px bg-slate-800 flex-grow"></div>
        </h4>

        <div className="space-y-5">
          {gradeInfo.map(({ grade, title, description, bgColor, shadowColor, textColor }) => (
            <div key={grade} className="flex gap-4 items-start">
              <div className={`${bgColor} w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm shadow-lg ${shadowColor} ${textColor || ''}`}>
                {grade}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wide">{title}</span>
                <p className="text-[11px] leading-tight text-slate-400 mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href={t('common.siteUrl')}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:scale-105 group"
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen size={18} className="group-hover:rotate-6 transition-transform" />
            <span className="text-sm">{t('myApps.explainer.docs')}</span>
          </div>
        </a>

        <div className="mt-8 pt-5 border-t border-slate-800 text-[11px] italic text-slate-500 text-center">
          {t('myApps.explainer.basis')}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainerPanel;
