import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import {
  ChevronLeft, PieChart, Smartphone, RefreshCcw, Trash2, AlertTriangle, ShieldAlert, X,
  Download, Upload, CheckCircle2,
} from 'lucide-react';
import { formatBytes, clearAllTrustiStorage } from '../utils/storageStats';
import { isNativeAndroid } from '../utils/platform';
import { extractPackageId } from '../utils/androidPackage';
import InstalledApps from '../native/InstalledApps';
import { requestUninstall } from '../utils/uninstallWatcher';
import AppUpdate from '../native/AppUpdate';
import { sortMyApps } from '../utils/myAppsSort';
import { GRADES } from '../constants/grades';
import { getNotesCount } from '../utils/notesStorage';
import { buildExportData, buildExportFilename, importExportData } from '../utils/dataExportImport';
import { exportJSONFile } from '../utils/exportFile';
import MyAppsSortMenu from './MyAppsSortMenu';
import ScoreIndicator from './ui/ScoreIndicator';
import GradeStorageDonut from './ui/GradeStorageDonut';
import SystemCleanerSection from './SystemCleanerSection';
import AlternativeNudgesSection from './AlternativeNudgesSection';
import AppIconImage from './ui/AppIconImage';
import { categoryLabel } from '../constants/categories';
import { t } from '../i18n/index.js';

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
        {armed ? t('storage.page.confirmIrreversible') : t('storage.page.empty')}
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
  onSelectApp,
  nudgesEnabled = true,
  onToggleNudges,
  gradeAlertsEnabled = true,
  onToggleGradeAlerts,
  notificationSettings = {},
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

  // Export / import des données locales (notes par app pour l'instant).
  const importInputRef = useRef(null);
  const [importFeedback, setImportFeedback] = useState(null); // { type: 'success'|'error', message }
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState(null); // { type: 'success'|'info'|'error', message }

  const handleExportData = async () => {
    try {
      await exportJSONFile(buildExportData(), buildExportFilename());
      setImportFeedback(null);
    } catch (error) {
      // Enregistrement annulé par l'utilisateur : pas une erreur à afficher.
      if (error?.message?.toLowerCase().includes('annul')) return;
      setImportFeedback({ type: 'error', message: t('storage.page.exportFailed') });
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de réimporter le même fichier ensuite
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { notesImported } = importExportData(parsed);
      setImportFeedback({
        type: 'success',
        message: t('storage.page.notesImported', { count: notesImported }),
      });
    } catch (error) {
      setImportFeedback({ type: 'error', message: error.message || t('storage.page.importFailed') });
    }
  };

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
    requestUninstall(app.packageName).catch((error) => {
      console.error('Désinstallation impossible:', error);
      window.alert(t('storage.page.uninstallFailed'));
    });
  };

  // Recherche forcée d'une mise à jour. Si une version existe, la fenêtre native (Compose) s'affiche
  // par-dessus l'app et explique les étapes ; ici on n'affiche que le résultat.
  const handleCheckUpdate = async () => {
    setUpdateChecking(true);
    setUpdateFeedback(null);
    try {
      const res = await AppUpdate.checkForUpdate();
      if (res.status === 'available') {
        setUpdateFeedback({ type: 'info', message: res.version ? t('storage.page.updateVersion', { version: res.version }) : t('storage.page.updateAvailable') });
      } else if (res.status === 'upToDate') {
        setUpdateFeedback({ type: 'success', message: t('storage.page.upToDate', { version: res.currentVersion }) });
      } else if (res.status === 'busy') {
        setUpdateFeedback({ type: 'info', message: t('storage.page.updateRunning') });
      } else if (res.status === 'disabled') {
        setUpdateFeedback({ type: 'info', message: t('storage.page.updatesOff') });
      } else {
        setUpdateFeedback({ type: 'error', message: res.message || t('storage.page.searchFailed') });
      }
    } catch {
      setUpdateFeedback({ type: 'error', message: t('storage.page.searchFailed') });
    } finally {
      setUpdateChecking(false);
    }
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
    <div className="min-h-screen bg-transparent font-sans text-slate-900 pb-16 md:pb-0">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 transition-colors active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <PieChart size={18} className="text-indigo-600" />
          </div>
          <h1 className="text-base font-black text-slate-900">{t('storage.page.title')}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Mises à jour de l'app (APK GitHub) — uniquement dans l'app Android native. */}
        {isNativeAndroid && (
          <section className="bg-white rounded-2xl border border-slate-100 p-4">
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
              {t('storage.page.updates')}
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              {t('storage.page.updatesBody')}
            </p>
            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={updateChecking}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <RefreshCcw size={14} className={updateChecking ? 'animate-spin' : ''} />
              {updateChecking ? t('storage.page.checking') : t('storage.page.checkUpdate')}
            </button>
            {updateFeedback && (
              <p className={`mt-2 text-xs flex items-center gap-1.5 ${updateFeedback.type === 'error' ? 'text-rose-600' : updateFeedback.type === 'success' ? 'text-emerald-600' : 'text-slate-600'}`}>
                {updateFeedback.type === 'success' && <CheckCircle2 size={13} />}
                {updateFeedback.message}
              </p>
            )}
          </section>
        )}

        {/* Suggestions d'alternatives par notification — app Android native uniquement. */}
        {isNativeAndroid && onToggleNudges && (
          <AlternativeNudgesSection
            enabled={nudgesEnabled}
            onToggle={onToggleNudges}
            gradeAlertsEnabled={gradeAlertsEnabled}
            onToggleGradeAlerts={onToggleGradeAlerts}
            {...notificationSettings}
          />
        )}

        {/* Export / import des données locales — en tête de page pour rester visible immédiatement. */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
            {t('storage.page.exportImport')}
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            {t('storage.page.exportImportBody', { count: getNotesCount() })}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <Download size={14} /> {t('storage.page.export')}
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <Upload size={14} /> {t('storage.page.import')}
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFileChange}
              className="hidden"
            />
          </div>
          {importFeedback && (
            <p className={`mt-2 text-xs flex items-center gap-1.5 ${importFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {importFeedback.type === 'success' && <CheckCircle2 size={13} />}
              {importFeedback.message}
            </p>
          )}
        </section>

        {/* Vue d'ensemble : suivi Trusti + espace total réellement occupé
            par les apps elles-mêmes (détail par note dans la section suivante). */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
            {t('storage.page.onDevice')}
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            {t('storage.page.onDeviceBody')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StatTile value={myAppsCount} label={t('storage.page.tracked')} />
            <StatTile value={migrationsCount} label={t('storage.page.migrations')} />
            <StatTile
              value={usageAccessGranted && appSizes ? formatBytes(totalDeviceBytes) : '—'}
              label={t('storage.page.totalSpace')}
            />
          </div>
        </section>

        {/* Nettoyeur de fichiers inutiles — app Android native (APK GitHub) uniquement. */}
        {isNativeAndroid && <SystemCleanerSection />}

        {/* Espace réel occupé par les apps installées, par note TrustiScore */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
            {t('storage.page.usedByApps')}
          </h2>

          {!isNativeAndroid && (
            <p className="text-xs text-slate-500">
              {t('storage.page.androidOnly')}
            </p>
          )}

          {isNativeAndroid && (installedPackages === null || usageAccessGranted === null) && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
              {t('storage.page.analysing')}
            </div>
          )}

          {isNativeAndroid && installedPackages !== null && usageAccessGranted === false && (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                {t('storage.page.usageAccess')}
              </p>
              <button
                type="button"
                onClick={() => InstalledApps.openUsageAccessSettings().catch(() => {})}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert size={15} />
                {t('storage.page.allowInSettings')}
              </button>
              <button
                type="button"
                onClick={checkAccessAndLoadSizes}
                className="w-full mt-2 py-2 text-indigo-500 text-xs font-bold"
              >
                {t('storage.page.allowedRefresh')}
              </button>
            </div>
          )}

          {isNativeAndroid && usageAccessGranted === true && (
            <div>
              {isLoadingSizes || appSizes === null || isLoadingMyAppsData ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
                  {t('storage.page.computing')}
                </div>
              ) : gradeStorageEntries.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  {t('storage.page.noSize')}
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
                      {t('storage.page.installedApps', { count: displayedInstalledApps.length })}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {gradeFilter && (
                        <button
                          type="button"
                          onClick={() => setGradeFilter(null)}
                          className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold"
                        >
                          {t('storage.page.gradeChip', { grade: gradeFilter })}
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
                    <p className="text-xs text-slate-400 py-2">{t('storage.page.noneWithGrade')}</p>
                  )}

                  <div className="space-y-2">
                    {displayedInstalledApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => onSelectApp?.(app)}
                        className={`flex items-center gap-2.5 bg-slate-50 rounded-xl p-2.5 ${onSelectApp ? 'cursor-pointer active:bg-slate-100' : ''}`}
                      >
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                          {app.icon && app.icon.startsWith('http') ? (
                            <AppIconImage src={app.icon} name={app.name} loading="eager" />
                          ) : (
                            <span className="text-lg">{app.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{app.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {categoryLabel(app.category)}
                            {typeof app.sizeBytes === 'number' && ` · ${formatBytes(app.sizeBytes)}`}
                          </p>
                        </div>
                        <ScoreIndicator grade={app.grade} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUninstall(app);
                          }}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all flex-shrink-0"
                          title={t('storage.page.uninstallApp', { name: app.name })}
                          aria-label={t('storage.page.uninstallApp', { name: app.name })}
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
            {t('storage.page.reset')}
          </h2>
          <div className="space-y-3">
            <ConfirmableAction
              icon={Smartphone}
              tone="warning"
              label={t('storage.page.clearMyApps')}
              description={t('storage.page.clearMyAppsBody')}
              disabled={myAppsCount === 0}
              onConfirm={onClearMyApps}
            />
            <ConfirmableAction
              icon={RefreshCcw}
              tone="warning"
              label={t('storage.page.clearHistory')}
              description={t('storage.page.clearHistoryBody')}
              disabled={migrationsCount === 0}
              onConfirm={onClearMigrations}
            />
            <ConfirmableAction
              icon={Trash2}
              tone="danger"
              label={t('storage.page.resetAll')}
              description={t('storage.page.resetAllBody')}
              onConfirm={handleResetAll}
            />
          </div>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <p>{t('storage.page.localWarning')}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StoragePage;
