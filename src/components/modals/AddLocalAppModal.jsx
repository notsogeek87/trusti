import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Link2 } from 'lucide-react';
import { API_URL } from '../../utils/apiConfig';
import { isNativeAndroid } from '../../utils/platform';
import { getAndroidPackage } from '../../utils/androidPackage';
import { cleanAppName, isValidPackageName, normalizeAppName } from '../../utils/localApps';
import { parseAppLink, linkKindLabel, findCatalogAppForLink } from '../../utils/appLinks';
import { fetchStoreName } from '../../utils/fetchStoreName';

// Catalogue complet, téléchargé une seule fois et comparé localement au lien
// collé : le lien (donc l'app que l'utilisateur possède) ne quitte pas l'appareil.
let catalogPromise = null;
const loadCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = fetch(`${API_URL}/apps?limit=2000`)
      .then(r => r.json())
      .then(data => (data.success ? data.apps : []))
      .catch(() => { catalogPromise = null; return []; });
  }
  return catalogPromise;
};

/**
 * Ajout d'une app que Trusti ne connaît pas encore. Deux voies :
 *  - coller un lien Play Store / F-Droid / GitHub (ou le recevoir via
 *    « Partager » Android) : le package est lu dans le lien, et on cherche
 *    d'abord l'app dans le catalogue, en local ;
 *  - saisir le nom (et le package, facultatif) à la main.
 * Si Trusti connaît déjà l'app, on propose la version évaluée.
 */
const AddLocalAppModal = ({ initialName = '', initialLink = '', onAddLocal, onAddCatalogApp, onClose }) => {
  const [link, setLink] = useState(initialLink);
  const [name, setName] = useState(initialName);
  const [packageName, setPackageName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(null); // app du catalogue déjà évaluée
  const [fetchingName, setFetchingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const dismissedUrl = useRef(null); // lien dont l'utilisateur a refusé la version évaluée

  const info = useMemo(() => parseAppLink(link), [link]);
  const linkUnknown = link.trim() !== '' && !info;

  // Un lien reconnu renseigne le package (Play Store, F-Droid) ou propose le nom du dépôt (GitHub)
  useEffect(() => {
    if (!info) return;
    if (info.packageName) setPackageName(info.packageName);
    if (info.kind === 'github') setName(prev => prev || info.repo);
  }, [info]);

  // Recherche locale dans le catalogue
  useEffect(() => {
    if (!info) return undefined;
    let cancelled = false;
    loadCatalog().then(apps => {
      if (cancelled || dismissedUrl.current === info.url) return;
      const match = findCatalogAppForLink(info, apps, getAndroidPackage);
      if (match) setExisting({ ...match, id: String(match.id) });
    });
    return () => { cancelled = true; };
  }, [info]);

  const canFetchName = isNativeAndroid && info && (info.kind === 'play' || info.kind === 'fdroid');

  const handleFetchName = async () => {
    setNameMessage('');
    setFetchingName(true);
    try {
      const found = await fetchStoreName(info);
      if (found) setName(found);
      else setNameMessage('Nom introuvable : saisis-le à la main.');
    } catch {
      setNameMessage('Lecture impossible (hors ligne ?) : saisis le nom à la main.');
    } finally {
      setFetchingName(false);
    }
  };

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
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">Ajouter une app</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trusti ne la connaît peut-être pas encore : elle sera listée « pas encore évaluée », sans note.
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
              onClick={() => { dismissedUrl.current = info?.url ?? null; setExisting(null); }}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Retour
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500">
                Lien de l'app <span className="font-normal">(Play Store, F-Droid ou GitHub, facultatif)</span>
              </span>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                maxLength={2000}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="https://f-droid.org/packages/…"
                aria-label="Lien de l'app"
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
              {info && (
                <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Link2 size={12} /> Lien {linkKindLabel(info.kind)} reconnu
                  {info.packageName ? ` : ${info.packageName}` : ` : ${info.owner}/${info.repo}`}
                </span>
              )}
              {linkUnknown && (
                <span className="mt-1 block text-[11px] text-rose-600">
                  Lien non reconnu : colle un lien Play Store, F-Droid ou GitHub.
                </span>
              )}
              {info?.kind === 'github' && (
                <span className="mt-1 block text-[10px] text-slate-400">
                  Un lien GitHub ne donne pas le nom de package : l'app ne sera pas détectée au scan.
                </span>
              )}
            </label>

            <label className="block">
              <span className="text-[11px] font-bold text-slate-500">Nom de l'app</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoFocus={!initialLink}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </label>

            {canFetchName && (
              <div>
                <button
                  type="button"
                  onClick={handleFetchName}
                  disabled={fetchingName}
                  className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl"
                >
                  {fetchingName ? 'Lecture…' : `Lire le nom depuis ${linkKindLabel(info.kind)}`}
                </button>
                <span className="mt-1 block text-[10px] text-slate-400">
                  Ton téléphone contactera {info.kind === 'play' ? 'play.google.com' : 'f-droid.org'} pour lire le nom.
                  Rien ne passe par Trusti.
                </span>
                {nameMessage && <span className="mt-1 block text-[11px] text-amber-600">{nameMessage}</span>}
              </div>
            )}

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
