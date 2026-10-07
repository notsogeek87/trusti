import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Eraser, ShieldAlert, RefreshCcw, CheckCircle2 } from 'lucide-react';
import SystemCleaner from '../native/SystemCleaner';
import { CLEANER_FILTERS } from '../cleaner/filters';
import { formatBytes } from '../utils/storageStats';

/**
 * Nettoyeur de stockage (page Espace de stockage, Android natif uniquement).
 * Flux : accès « tous les fichiers » -> analyse (rien n'est supprimé) -> choix des
 * catégories -> suppression confirmée en deux temps. Le plugin natif ne supprime que ce
 * que l'analyse vient de lister, par identifiant de catégorie.
 */
const SystemCleanerSection = () => {
  const [access, setAccess] = useState(null); // null = inconnu, { supported, granted }
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState(null); // { byId, truncated }
  const [selected, setSelected] = useState(() => new Set(CLEANER_FILTERS.filter((f) => f.defaultSelected).map((f) => f.id)));
  const [armed, setArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const refreshAccess = useCallback(() => {
    SystemCleaner.getAccessState()
      .then(setAccess)
      .catch(() => setAccess({ supported: false, granted: false }));
  }, []);

  useEffect(() => {
    refreshAccess();
    let handle;
    let cancelled = false;
    CapacitorApp.addListener('resume', refreshAccess).then((h) => {
      if (cancelled) h.remove();
      else handle = h;
    });
    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [refreshAccess]);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  const runScan = async () => {
    setScanning(true);
    setFeedback(null);
    setArmed(false);
    try {
      const { results, truncated } = await SystemCleaner.scan({ filters: CLEANER_FILTERS });
      setScan({ byId: Object.fromEntries(results.map((r) => [r.id, r])), truncated });
    } catch (error) {
      setScan(null);
      setFeedback({ type: 'error', message: error?.message || "L'analyse a échoué." });
    } finally {
      setScanning(false);
    }
  };

  const toggle = (id) => {
    setArmed(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTotals = useMemo(() => {
    if (!scan) return { count: 0, bytes: 0, ids: [] };
    const ids = CLEANER_FILTERS.filter((f) => selected.has(f.id) && scan.byId[f.id]?.count > 0).map((f) => f.id);
    return {
      ids,
      count: ids.reduce((n, id) => n + scan.byId[id].count, 0),
      bytes: ids.reduce((n, id) => n + scan.byId[id].bytes, 0),
    };
  }, [scan, selected]);

  const handleDelete = async () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    setDeleting(true);
    try {
      const { deleted, failed, freedBytes } = await SystemCleaner.deleteFilters({ ids: selectedTotals.ids });
      setFeedback({
        type: failed > 0 && deleted === 0 ? 'error' : 'success',
        message: `${formatBytes(freedBytes)} libérés (${deleted} élément${deleted > 1 ? 's' : ''})${failed > 0 ? `, ${failed} ignoré${failed > 1 ? 's' : ''} (modifiés ou protégés)` : ''}.`,
      });
      setScan(null); // les chiffres ne sont plus valables : nouvelle analyse nécessaire
    } catch (error) {
      setFeedback({ type: 'error', message: error?.message || 'La suppression a échoué.' });
    } finally {
      setDeleting(false);
    }
  };

  // Build Play Store ou Android < 11 : la fonction n'existe pas, on ne montre rien.
  if (access && !access.supported) return null;

  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-4">
      <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
        Nettoyer le stockage
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Repère les fichiers inutiles (téléchargements interrompus, temporaires, miniatures…).
        L'analyse se fait uniquement sur votre téléphone et ne supprime rien : vous choisissez
        ensuite les catégories à nettoyer.
      </p>

      {access === null && (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
          <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
          Vérification…
        </div>
      )}

      {access && !access.granted && (
        <button
          type="button"
          onClick={() => SystemCleaner.openAccessSettings().catch(() => {})}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ShieldAlert size={15} />
          Autoriser l'accès aux fichiers
        </button>
      )}

      {access?.granted && (
        <button
          type="button"
          onClick={runScan}
          disabled={scanning || deleting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          <RefreshCcw size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Analyse en cours…' : scan ? 'Analyser à nouveau' : 'Analyser'}
        </button>
      )}

      {scan && (
        <div className="mt-3 space-y-2">
          {CLEANER_FILTERS.map((filter) => {
            const result = scan.byId[filter.id];
            const empty = !result || result.count === 0;
            return (
              <label
                key={filter.id}
                className={`flex items-start gap-3 p-3 border border-slate-200 rounded-xl ${empty ? 'opacity-50' : 'cursor-pointer hover:bg-slate-50'}`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  disabled={empty}
                  checked={!empty && selected.has(filter.id)}
                  onChange={() => toggle(filter.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{filter.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{filter.description}</p>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    {empty ? 'Rien à nettoyer' : `${result.count} élément${result.count > 1 ? 's' : ''} · ${formatBytes(result.bytes)}`}
                  </p>
                  {!empty && result.preview?.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {result.preview.slice(0, 3).join(', ')}{result.count > 3 ? '…' : ''}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
          {scan.truncated && (
            <p className="text-xs text-amber-600">
              Le stockage est très volumineux : l'analyse a été limitée. Relancez-la après un premier nettoyage.
            </p>
          )}
          <button
            type="button"
            disabled={selectedTotals.count === 0 || deleting}
            onClick={handleDelete}
            className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
              armed ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700' : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Eraser size={14} />
            {deleting
              ? 'Suppression…'
              : armed
                ? 'Confirmer — suppression définitive'
                : `Nettoyer ${selectedTotals.count} élément${selectedTotals.count > 1 ? 's' : ''} (${formatBytes(selectedTotals.bytes)})`}
          </button>
        </div>
      )}

      {feedback && (
        <p className={`mt-3 text-xs flex items-center gap-1.5 ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {feedback.type === 'success' && <CheckCircle2 size={13} />}
          {feedback.message}
        </p>
      )}
    </section>
  );
};

export default SystemCleanerSection;
