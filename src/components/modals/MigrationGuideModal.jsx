import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Check, ExternalLink, Trash2, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import { MIGRATION_STEPS, CLEANUP_TIPS } from '../../constants/migrationGuide';
import { getDataTips, getMigrationCandidates, computeProgress } from '../../utils/migrationGuide';
import { getMigrationGuideState, saveMigrationGuideState } from '../../utils/migrationGuideStorage';
import { extractPackageId } from '../../utils/androidPackage';
import { isNativeAndroid } from '../../utils/platform';
import InstalledApps from '../../native/InstalledApps';

const TipList = ({ title, tips }) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
    <p className="text-[11px] font-black uppercase tracking-tight text-slate-500 mb-1.5">{title}</p>
    <ul className="space-y-1.5">
      {tips.map(tip => (
        <li key={tip} className="text-xs text-slate-600 leading-relaxed flex gap-2">
          <span className="text-indigo-400 shrink-0">•</span>{tip}
        </li>
      ))}
    </ul>
  </div>
);

const StepCheck = ({ checked, onChange, children }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-xs font-bold transition-all ${
      checked ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200'
    }`}
  >
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
      {checked && <Check size={12} strokeWidth={3} />}
    </span>
    {children}
  </button>
);

/**
 * Parcours « Migration guidée » : remplacer une app notée C/D/E par une
 * alternative mieux notée, étape par étape (choix, installation, transfert
 * des données, nettoyage). La progression est locale (voir
 * migrationGuideStorage.js) ; à la fin, `onComplete(app, alt)` marque l'app
 * comme migrée dans « Mes Apps ».
 */
const MigrationGuideModal = ({ app, alternatives = [], onComplete, onClose }) => {
  const candidates = useMemo(() => getMigrationCandidates(app, alternatives), [app, alternatives]);
  const [state, setState] = useState(() => getMigrationGuideState(app.id));
  const [stepIndex, setStepIndex] = useState(() => computeProgress(getMigrationGuideState(app.id).done).nextIndex);
  const [installed, setInstalled] = useState([]);
  const [finished, setFinished] = useState(false);

  // L'alternative choisie : celle mémorisée si elle existe encore, sinon la recommandée.
  const alt = candidates.find(c => String(c.id) === state.altId) || candidates[0];
  const step = MIGRATION_STEPS[stepIndex];
  const done = state.done;
  const tips = getDataTips(app.category);
  const oldPackage = extractPackageId(app.playStoreUrl);
  const altPackage = extractPackageId(alt?.playStoreUrl);
  const oldInstalled = oldPackage && installed.includes(oldPackage);
  const altInstalled = altPackage && installed.includes(altPackage);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      saveMigrationGuideState(app.id, next);
      return next;
    });
  }, [app.id]);

  const setDone = (id, value) => update({ done: { ...done, [id]: value || undefined } });

  // Apps du catalogue installées (Android natif) : relu au retour dans Trusti
  // pour constater l'installation / la désinstallation.
  const refreshInstalled = useCallback(() => {
    if (!isNativeAndroid) return;
    InstalledApps.getInstalledPackages()
      .then(({ packages }) => setInstalled(packages || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    refreshInstalled();
    document.addEventListener('visibilitychange', refreshInstalled);
    return () => document.removeEventListener('visibilitychange', refreshInstalled);
  }, [refreshInstalled]);

  // Étapes constatées automatiquement sur l'appareil.
  useEffect(() => {
    if (altInstalled && !done.install) update({ done: { ...done, install: true } });
  }, [altInstalled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUninstall = () => {
    InstalledApps.uninstallPackage({ packageName: oldPackage }).catch(() => {
      window.alert("Impossible d'ouvrir la désinstallation. Réessayez depuis les paramètres du téléphone.");
    });
  };

  const handleFinish = () => {
    onComplete?.(app, alt);
    setFinished(true);
  };

  if (!alt) return null;
  const { completed, total } = computeProgress(done);
  const isLast = stepIndex === MIGRATION_STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900 truncate">Migrer depuis {app.name}</h2>
            {!finished && <p className="text-[11px] font-bold text-slate-400">{completed}/{total} étapes faites</p>}
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-2 text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        {finished ? (
          <div className="p-6 text-center space-y-3">
            <PartyPopper size={40} className="mx-auto text-emerald-500" />
            <p className="font-black text-slate-900">Migration terminée !</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {app.name} est désormais remplacée par {alt.name} dans « Mes Apps ».
            </p>
            <button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm">
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <ol className="flex gap-1.5" aria-label="Progression">
              {MIGRATION_STEPS.map((s, i) => (
                <li key={s.id} className="flex-1">
                  <button
                    onClick={() => setStepIndex(i)}
                    className={`w-full h-1.5 rounded-full ${done[s.id] ? 'bg-emerald-500' : i === stepIndex ? 'bg-indigo-500' : 'bg-slate-200'}`}
                    aria-label={`Étape ${i + 1} : ${s.title}`}
                    aria-current={i === stepIndex ? 'step' : undefined}
                  />
                </li>
              ))}
            </ol>
            <h3 className="font-black text-sm text-slate-800">{stepIndex + 1}. {step.title}</h3>

            {step.id === 'choose' && (
              <div className="space-y-2">
                {candidates.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => update({ altId: String(c.id), done: { ...done, choose: true } })}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                      c.id === alt.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex-grow min-w-0">
                      <p className="font-black text-sm text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{i === 0 ? 'Recommandée · ' : ''}{c.category}</p>
                    </div>
                    <ScoreIndicator grade={c.grade} />
                  </button>
                ))}
              </div>
            )}

            {step.id === 'install' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Installez <span className="font-bold text-slate-800">{alt.name}</span> avant de toucher à {app.name}.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[['Play Store', alt.playStoreUrl], ['F-Droid', alt.fDroidUrl], ['Site officiel', alt.website]]
                    .filter(([, url]) => url)
                    .map(([label, url]) => (
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs py-2.5 rounded-xl border-2 border-emerald-200">
                        <ExternalLink size={13} /> {label}
                      </a>
                    ))}
                </div>
                {altInstalled
                  ? <p className="text-xs font-bold text-emerald-600">✓ Détectée sur votre téléphone</p>
                  : <StepCheck checked={!!done.install} onChange={v => setDone('install', v)}>J'ai installé {alt.name}</StepCheck>}
              </div>
            )}

            {step.id === 'transfer' && (
              <div className="space-y-3">
                <TipList title={`Depuis ${app.name}`} tips={tips.export} />
                <TipList title={`Vers ${alt.name}`} tips={tips.import} />
                <StepCheck checked={!!done.transfer} onChange={v => setDone('transfer', v)}>Mes données sont transférées</StepCheck>
              </div>
            )}

            {step.id === 'cleanup' && (
              <div className="space-y-3">
                <TipList title="Avant de partir" tips={CLEANUP_TIPS} />
                {oldInstalled && (
                  <button onClick={handleUninstall}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl">
                    <Trash2 size={14} /> Désinstaller {app.name}
                  </button>
                )}
                <StepCheck checked={!!done.cleanup} onChange={v => setDone('cleanup', v)}>
                  {oldInstalled || !isNativeAndroid ? `J'ai quitté ${app.name}` : `${app.name} est désinstallée`}
                </StepCheck>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {stepIndex > 0 && (
                <button onClick={() => setStepIndex(stepIndex - 1)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center">
                  <ChevronLeft size={16} />
                </button>
              )}
              {isLast ? (
                <button onClick={handleFinish} disabled={!done.cleanup}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3 rounded-xl font-bold text-sm">
                  Terminer la migration
                </button>
              ) : (
                <button onClick={() => { if (step.id === 'choose') setDone('choose', true); setStepIndex(stepIndex + 1); }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                  Étape suivante <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationGuideModal;
