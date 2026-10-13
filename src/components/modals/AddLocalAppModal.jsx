import React, { useState } from 'react';
import { X } from 'lucide-react';
import { API_URL } from '../../utils/apiConfig';
import { cleanAppName, isValidPackageName, normalizeAppName } from '../../utils/localApps';

/**
 * Ajout à la main d'une app que Trusti ne connaît pas encore. Avant de créer
 * une fiche « pas encore évaluée », on vérifie que Trusti ne l'a pas déjà : si
 * oui, on propose d'ajouter la version évaluée à la place.
 */
const AddLocalAppModal = ({ initialName = '', onAddLocal, onAddCatalogApp, onClose }) => {
  const [name, setName] = useState(initialName);
  const [packageName, setPackageName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(null); // app du catalogue de même nom

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = cleanAppName(name);
    const pkg = packageName.trim();
    if (!cleanName) {
      setError('Indique le nom de l\'app.');
      return;
    }
    if (pkg && !isValidPackageName(pkg)) {
      setError('Nom de package invalide (ex. org.exemple.monapp). Laisse vide si tu ne le connais pas.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/apps?search=${encodeURIComponent(cleanName)}`);
      const data = await response.json();
      const wanted = normalizeAppName(cleanName);
      const match = data.success
        ? data.apps.find(app => normalizeAppName(app.name) === wanted)
        : null;
      if (match) {
        setExisting({ ...match, id: String(match.id) });
        setBusy(false);
        return;
      }
    } catch {
      // Hors ligne : on crée la fiche locale, la fusion se fera plus tard.
    }
    onAddLocal(cleanName, pkg || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">Ajouter une app</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trusti ne la connaît pas encore : elle sera listée « pas encore évaluée », sans note.
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {existing ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              <span className="font-bold">{existing.name}</span> est déjà évaluée par Trusti
              {existing.grade ? <> (note <span className="font-bold">{existing.grade}</span>)</> : null}.
            </p>
            <button
              type="button"
              onClick={() => { onAddCatalogApp(existing.id); onClose(); }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
            >
              Ajouter la version évaluée
            </button>
            <button
              type="button"
              onClick={() => setExisting(null)}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Retour
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500">Nom de l'app</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoFocus
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500">
                Nom de package <span className="font-normal">(facultatif)</span>
              </span>
              <input
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                maxLength={150}
                placeholder="org.exemple.monapp"
                autoCapitalize="none"
                autoCorrect="off"
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
              <span className="text-[10px] text-slate-400">
                Permet de la relier automatiquement à l'app Trusti quand elle sera évaluée.
              </span>
            </label>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl"
            >
              {busy ? 'Vérification…' : 'Ajouter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddLocalAppModal;
