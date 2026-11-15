import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { API_URL } from '../../utils/apiConfig';
import { t } from '../../i18n/index.js';

/**
 * « Il manque un outil » : suggestion d'un outil absent du catalogue
 * (POST /api/suggest-tool). Aucune donnée personnelle demandée.
 */
const SuggestToolDialog = ({ initialName = '', onClose }) => {
  const [form, setForm] = useState({ name: initialName, website: '', comment: '', company: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);
  const firstField = useRef(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError(t('org.misc.k012'));
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch(`${API_URL}/suggest-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || t('org.misc.k013'));
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message || t('org.misc.k013'));
    }
  };

  const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 id="suggest-title" className="text-lg font-black text-slate-800">{t('org.misc.k014')}</h2>
          <button type="button" onClick={onClose} aria-label={t('org.misc.k015')} className="p-1 text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        {status === 'sent' ? (
          <div className="text-sm text-slate-600">
            <p className="flex items-center gap-2 font-black text-emerald-700 mb-1"><CheckCircle size={18} /> {t('org.misc.k016')}</p>
            <p>{t('org.misc.k017')}</p>
            <button type="button" onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-black">{t('org.misc.k015')}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
            <p className="text-sm text-slate-600">{t('org.misc.k018')}</p>
            <label className="text-sm font-bold text-slate-700">
              {t('org.misc.k019')}
              <input ref={firstField} className={`${input} mt-1`} value={form.name} onChange={update('name')} maxLength={80} required />
            </label>
            <label className="text-sm font-bold text-slate-700">
              {t('org.misc.providerSite')} <span className="font-normal text-slate-400">{t('org.misc.k020')}</span>
              <input className={`${input} mt-1`} value={form.website} onChange={update('website')} maxLength={200} inputMode="url" placeholder={t('org.misc.k021')} />
            </label>
            <label className="text-sm font-bold text-slate-700">
              {t('org.misc.whatFor')} <span className="font-normal text-slate-400">{t('org.misc.k020')}</span>
              <textarea className={`${input} mt-1 resize-none`} rows={3} value={form.comment} onChange={update('comment')} maxLength={500} />
            </label>
            {/* Champ piège pour les robots, invisible et ignoré par les lecteurs d'écran */}
            <input type="text" name="company" value={form.company} onChange={update('company')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            {error && <p className="text-sm font-bold text-rose-600" role="alert">{error}</p>}
            <div className="flex justify-end gap-2 mt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700">{t('org.misc.k022')}</button>
              <button type="submit" disabled={status === 'sending'} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black disabled:opacity-60">
                {status === 'sending' ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuggestToolDialog;
