import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import {
  ChevronLeft, HardDrive, Smartphone, RefreshCcw, Trash2, AlertTriangle, ShieldAlert, X,
} from 'lucide-react';
import { formatBytes, clearAllTrustiStorage } from '../utils/storageStats';
import { isNativeAndroid } from '../utils/platform';
import { extractPackageId } from '../utils/androidPackage';
import InstalledApps from '../native/InstalledApps';
import { sortMyApps } from '../utils/myAppsSort';
import { GRADES } from '../constants/grades';
import MyAppsSortMenu from './MyAppsSortMenu';
import ScoreIndicator from './ui/ScoreIndicator';
import GradeStorageDonut from './ui/GradeStorageDonut';

const StatTile = ({ value, label }) => (
  <div className="bg-slate-50 rounded-2xl p-3 text-center">
    <p className="text-lg font-black text-slate-900">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
  </div>
);

// Vidage à confirmation en deux temps (armée -> confirmée) pour éviter un
// vidage accidentel au premier clic, sans passer par un second modal.
const ConfirmableAction = ({ icon: Icon, label, description, tone, onConfirm, disabled }) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  const toneClasses = tone === 'danger'
    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
    : 'border-orange-200 text-orange-600 hover:bg-orange-50';

  return (
    <div className="border border-slate-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tone === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          setArmed(false);
          onConfirm();
        }}
        className={`mt-3 w-full py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          armed
            ? tone === 'danger'
              ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
              : 'bg-orange-600 border-orange-600 text-white hover:bg-orange-700'
            : `bg-white ${toneClasses}`
        }`}
      >
        {armed ? 'Confirmer — action irréversible' : 'Vider'}
      </button>
    </div>
  );
};

/**
 * Page dédiée "Espace de stockage" (pas une popup) : distingue clairement
 * deux choses souvent confondues —
 * 1) les données propres à Trusti (apps suivies, migrations,
 *    préférences), minimes, stockées en localStorage sur cet appareil ;
 * 2) l'espace réellement occupé sur le disque par les apps elles-mêmes
 *    (APK + données + cache), lu via l'API Android StorageStatsManager —
 *    nécessite l'accès spécial "Usage", que l'utilisateur doit activer
 *    manuellement (voir InstalledAppsPlugin côté natif).
 */
const StoragePage = ({
  onClose,
  myAppsCount,
  migrationsCount,
  myAppsData = [],
  isLoadingMyAppsData = false,
  onClearMyApps,
  onClearMigrations,
}) => {
  // null = scan pas encore terminé, [] = scan fait, rien trouvé.
  const [installedPackages, setInstalledPackages] = useState(null);
  const [usageAccessGranted, setUsageAccessGranted] = useState(null);
  const [appSizes, setAppSizes] = useState(null);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [sortPref, setSortPref] = useState({ sortBy: 'size', direction: 'desc' });
  // Note sélectionnée en tapant le camembert ou sa légende — filtre la liste
  // des apps installées ci-dessous plutôt que de dupliquer l'info ailleurs.
  const [gradeFilter, setGradeFilter] = useState(null);

  // Apps du catalogue "Mes Apps" réellement installées sur l'appareil.
  useEffect(() => {
    if (!isNativeAndroid) return;
    let cancelled = false;
    InstalledApps.getInstalledPackages()
      .then(({ packages }) => {
        if (!cancelled) setInstalledPackages(packages || []);
      })
      .catch(() => {
        if (!cancelled) setInstalledPackages([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Vérifie l'accès "Usage" et, si accordé, charge la taille disque réelle de
  // chaque app. Rappelée au retour des réglages système (voir listener
  // 'resume' ci-dessous), puisqu'aucun callback fiable ne signale l'activation.
  const checkAccessAndLoadSizes = useCallback(() => {
    if (!isNativeAndroid) return;
    InstalledApps.hasUsageAccess()
      .then(({ granted }) => {
        setUsageAccessGranted(granted);
        if (!granted) return;
        setIsLoadingSizes(true);
        InstalledApps.getAppSizes()
          .then(({ sizes }) => setAppSizes(sizes || {}))
          .catch(() => setAppSizes({}))
          .finally(() => setIsLoadingSizes(false));
      })
      .catch(() => setUsageAccessGranted(false));
  }, []);

  useEffect(() => {
    checkAccessAndLoadSizes();
  }, [checkAccessAndLoadSizes]);

  useEffect(() => {
    if (!isNativeAndroid) return undefined;
    let handle;
    let cancelled = false;
    CapacitorApp.addListener('resume', checkAccessAndLoadSizes).then((h) => {
      if (cancelled) h.remove();
      else handle = h;
    });
    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [checkAccessAndLoadSizes]);

  const installedAppsList = useMemo(() => {
    if (!isNativeAndroid || !installedPackages) return [];
    const withPackage = myAppsData
      .map((app) => ({ app, packageName: extractPackageId(app.playStoreUrl) }))
      .filter(({ packageName }) => packageName && installedPackages.includes(packageName));
    const enriched = withPackage.map(({ app, packageName }) => ({
      ...app,
      packageName,
      sizeBytes: appSizes ? (appSizes[packageName] ?? null) : null,
    }));
    return sortMyApps(enriched, sortPref);
  }, [myAppsData, installedPackages, appSizes, sortPref]);

  const gradeStorageEntries = useMemo(() => {
    const totals = {};
    installedAppsList.forEach((app) => {
      if (typeof app.sizeBytes !== 'number') return;
      if (!totals[app.grade]) totals[app.grade] = { bytes: 0, count: 0 };
      totals[app.grade].bytes += app.sizeBytes;
      totals[app.grade].count += 1;
    });
    return GRADES
      .filter((g) => totals[g] && totals[g].bytes > 0)
      .map((g) => ({ grade: g, bytes: totals[g].bytes, count: totals[g].count }));
  }, [installedAppsList]);

  const totalDeviceBytes = useMemo(
    () => gradeStorageEntries.reduce((sum, e) => sum + e.bytes, 0),
    [gradeStorageEntries]
  );

  const displayedInstalledApps = useMemo(
    () => (gradeFilter ? installedAppsList.filter((app) => app.grade === gradeFilter) : installedAppsList),
    [installedAppsList, gradeFilter]
  );

  const handleUninstall = (app) => {
    if (!app.packageName) return;
    InstalledApps.uninstallPackage({ packageName: app.packageName }).catch((error) => {
      console.error('Désinstallation impossible:', error);
      window.alert("Impossible d'ouvrir la désinstallation. Réessayez depuis les paramètres du téléphone.");
    });
  };

  // Contrairement au vidage ciblé (état React, géré par useAppManagement), on
  // efface directement toutes les clés puis on recharge la page, seul moyen
  // fiable de repartir à zéro sur des données lues une fois au montage
  // (onboarding, mode enfant, session admin...).
  const handleResetAll = () => {
    clearAllTrustiStorage();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 md:pb-0">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 transition-colors active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <HardDrive size={18} className="text-indigo-600" />
          </div>
          <h1 className="text-base font-black text-slate-900">Espace de stockage</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Vue d'ensemble : suivi Trusti + espace total réellement occupé
            par les apps elles-mêmes (détail par note dans la section suivante). */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
            Données Trusti sur cet appareil
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Vos apps suivies et migrations sont enregistrées uniquement ici, pas
            sur nos serveurs. L'espace total correspond au poids réel de vos
            applications installées (APK + données + cache).
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StatTile value={myAppsCount} label="Apps suivies" />
            <StatTile value={migrationsCount} label="Migrations" />
            <StatTile
              value={usageAccessGranted && appSizes ? formatBytes(totalDeviceBytes) : '—'}
              label="Espace total (apps)"
            />
          </div>
        </section>

        {/* Espace réel occupé par les apps installées, par note TrustiScore */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
            Espace utilisé par vos apps
          </h2>

          {!isNativeAndroid && (
            <p className="text-xs text-slate-500">
              Disponible uniquement dans l'app Android Trusti installée sur
              votre téléphone.
            </p>
          )}

          {isNativeAndroid && (installedPackages === null || usageAccessGranted === null) && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
              Analyse en cours…
            </div>
          )}

          {isNativeAndroid && installedPackages !== null && usageAccessGranted === false && (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Android protège cette information : pour afficher la taille
                réelle de chaque app (et le camembert par note TrustiScore),
                autorisez l'accès à l'utilisation pour Trusti.
              </p>
              <button
                type="button"
                onClick={() => InstalledApps.openUsageAccessSettings().catch(() => {})}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert size={15} />
                Autoriser dans les réglages
              </button>
              <button
                type="button"
                onClick={checkAccessAndLoadSizes}
                className="w-full mt-2 py-2 text-indigo-500 text-xs font-bold"
              >
                J'ai autorisé, actualiser
              </button>
            </div>
          )}

          {isNativeAndroid && usageAccessGranted === true && (
            <div>
              {isLoadingSizes || appSizes === null || isLoadingMyAppsData ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
                  Calcul de la taille de vos apps…
                </div>
              ) : gradeStorageEntries.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  Aucune taille disponible pour vos apps installées.
                </p>
              ) : (
                <div className="mb-5">
                  <GradeStorageDonut
                    entries={gradeStorageEntries}
                    totalBytes={totalDeviceBytes}
                    selectedGrade={gradeFilter}
                    onSelectGrade={setGradeFilter}
                  />
                </div>
              )}

              {installedAppsList.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-2 mt-1 gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-slate-400 truncate">
                      Applications installées ({displayedInstalledApps.length})
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {gradeFilter && (
                        <button
                          type="button"
                          onClick={() => setGradeFilter(null)}
                          className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold"
                        >
                          Note {gradeFilter}
                          <X size={12} />
                        </button>
                      )}
                      <MyAppsSortMenu
                        sortBy={sortPref.sortBy}
                        direction={sortPref.direction}
                        onChange={setSortPref}
                      />
                    </div>
                  </div>

                  {displayedInstalledApps.length === 0 && (
                    <p className="text-xs text-slate-400 py-2">Aucune app avec cette note installée.</p>
                  )}

                  <div className="space-y-2">
                    {displayedInstalledApps.map((app) => (
                      <div key={app.id} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-2.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                          {app.icon && app.icon.startsWith('http') ? (
                            <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">{app.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{app.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {app.category}
                            {typeof app.sizeBytes === 'number' && ` · ${formatBytes(app.sizeBytes)}`}
                          </p>
                        </div>
                        <ScoreIndicator grade={app.grade} />
                        <button
                          type="button"
                          onClick={() => handleUninstall(app)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all flex-shrink-0"
                          title={`Désinstaller ${app.name}`}
                          aria-label={`Désinstaller ${app.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Réinitialisation des données Trusti */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
            Réinitialisation
          </h2>
          <div className="space-y-3">
            <ConfirmableAction
              icon={Smartphone}
              tone="warning"
              label="Vider Mes Apps"
              description="Retire toutes les apps de votre sélection, sans toucher à votre historique de migrations."
              disabled={myAppsCount === 0}
              onConfirm={onClearMyApps}
            />
            <ConfirmableAction
              icon={RefreshCcw}
              tone="warning"
              label="Vider l'historique de migrations"
              description="Réinitialise le statut « migré » de vos apps. Elles restent dans Mes Apps."
              disabled={migrationsCount === 0}
              onConfirm={onClearMigrations}
            />
            <ConfirmableAction
              icon={Trash2}
              tone="danger"
              label="Tout réinitialiser"
              description="Efface toutes les données stockées sur cet appareil (apps, migrations, préférences) et recharge l'app."
              onConfirm={handleResetAll}
            />
          </div>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <p>Ces actions sont locales à cet appareil et irréversibles une fois confirmées.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StoragePage;
