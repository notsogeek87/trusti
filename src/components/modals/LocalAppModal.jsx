import React, { useState } from 'react';
import { X, Star, Trash2 } from 'lucide-react';
import { getNote, setNote } from '../../utils/notesStorage';

/**
 * Fiche d'une app « pas encore évaluée » (ajoutée à la main) : pas de note
 * A–E ni d'analyse, mais on peut la marquer « quotidien », lui joindre un
 * commentaire personnel et la retirer.
 */
const LocalAppModal = ({ app, isDaily, onToggleDaily, onRemove, onClose }) => {
  const [note, setNoteText] = useState(() => getNote(app.id));
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleClose = () => {
    setNote(app.id, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900 truncate">{app.name}</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Pas encore évaluée par Trusti</p>
            {app.packageName && (
              <p className="text-[11px] text-slate-400 mt-0.5 break-all">{app.packageName}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => onToggleDaily(e, app.id)}
              aria-pressed={isDaily}
              aria-label={isDaily ? 'Retirer des apps du quotidien' : 'Marquer comme utilisée au quotidien'}
              className={`p-2 rounded-full transition-colors ${isDaily ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'}`}
            >
              <Star size={20} className={isDaily ? 'fill-current' : ''} />
            </button>
            <button onClick={handleClose} aria-label="Fermer" className="p-2 text-slate-400 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Elle n'entre pas dans ton TrustiScore. Si Trusti l'ajoute un jour, elle sera
          remplacée automatiquement par l'app évaluée, avec ta note et ton étoile.
        </p>

        <label className="block mb-4">
          <span className="text-[11px] font-bold text-slate-500">Commentaire personnel</span>
          <textarea
            value={note}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            if (!confirmRemove) { setConfirmRemove(true); return; }
            onRemove(app.id);
            onClose();
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border transition-all ${
            confirmRemove ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Trash2 size={14} />
          {confirmRemove ? 'Confirmer la suppression' : 'Retirer cette app'}
        </button>
      </div>
    </div>
  );
};

export default LocalAppModal;
