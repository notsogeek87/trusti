import React, { useState, useEffect, useMemo } from 'react';
import { X, HardDrive, Smartphone, RefreshCcw, Trash2, AlertTriangle } from 'lucide-react';
import { getStorageStats, formatBytes, clearAllTrustiStorage } from '../../utils/storageStats';
import { isNativeAndroid } from '../../utils/platform';
import { extractPackageId } from '../../utils/androidPackage';
import InstalledApps from '../../native/InstalledApps';
import { sortMyApps } from '../../utils/myAppsSort';
import MyAppsSortMenu from '../MyAppsSortMenu';
import ScoreIndicator from '../ui/ScoreIndicator';

// Une action de vidage se déroule en deux temps (armée -> confirmée) pour
// éviter un vidage accidentel au premier clic, sans passer par un second
// modal de confirmation plus lourd.
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

const StorageManagerModal = ({
  isOpen,
  onClose,
  myAppsCount,
  migrationsCount,
  myAppsData = [],
  isLoadingMyAppsData = false,
  onClearMyApps,
  onClearMigrations,
}) => {
  const [stats, setStats] = useState({ totalKeys: 0, totalBytes: 0 });
  // null = scan pas encore lancé/terminé, [] = scan fait, rien trouvé.
  const [installedPackages, setInstalledPackages] = useState(null);
  // Tri propre à cette liste (indépendant du tri de l'onglet "Mes Apps"),
  // par défaut le TrustiScore — le critère le plus utile pour repérer d'un
  // coup d'œil les apps à risque qui pèsent sur l'appareil.
  const [sortPref, setSortPref] = useState({ sortBy: 'trustiScore', direction: 'desc' });

  useEffect(() => {
    if (isOpen) setStats(getStorageStats());
  }, [isOpen]);

  // Recherche, parmi "Mes Apps", lesquelles sont réellement installées sur cet
  // appareil (uniquement possible dans l'app Android native — voir
  // InstalledAppsPlugin). Relancé à chaque ouverture pour refléter une
  // désinstallation faite entre-temps.
  useEffect(() => {
    if (!isOpen || !isNativeAndroid) {
      setInstalledPackages(null);
      return undefined;
    }
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
  }, [isOpen]);

  const installedAppsList = useMemo(() => {
    if (!isNativeAndroid || !installedPackages) return [];
    const withPackage = myAppsData
      .map(app => ({ app, packageName: extractPackageId(app.playStoreUrl) }))
      .filter(({ packageName }) => packageName && installedPackages.includes(packageName));
    const packageByAppId = new Map(withPackage.map(({ app, packageName }) => [app.id, packageName]));
    return sortMyApps(withPackage.map(({ app }) => app), sortPref)
      .map(app => ({ ...app, packageName: packageByAppId.get(app.id) }));
  }, [myAppsData, installedPackages, sortPref]);

  const handleUninstall = (app) => {
    if (!app.packageName) return;
    InstalledApps.uninstallPackage({ packageName: app.packageName }).catch((error) => {
      console.error('Désinstallation impossible:', error);
      window.alert("Impossible d'ouvrir la désinstallation. Réessayez depuis les paramètres du téléphone.");
    });
  };

  // Réinitialisation totale : contrairement au vidage ciblé (état React, géré
  // par useAppManagement), on efface directement toutes les clés puis on
  // recharge la page, seul moyen fiable de repartir à zéro sur des données
  // qui ne sont lues qu'au montage (onboarding, mode enfant, session admin...).
  const handleResetAll = () => {
    clearAllTrustiStorage();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-3">
            <HardDrive size={22} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Espace de stockage</h2>
          <p className="text-sm text-slate-500 mt-1">
            Vos données (apps suivies, migrations, préférences) sont stockées
            uniquement sur cet appareil, pas sur nos serveurs.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{myAppsCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Apps suivies</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{migrationsCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Migrations</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{formatBytes(stats.totalBytes)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Utilisé</p>
          </div>
        </div>

        {isNativeAndroid && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">
                Applications installées{installedPackages ? ` (${installedAppsList.length})` : ''}
              </h3>
              {installedAppsList.length > 0 && (
                <MyAppsSortMenu
                  sortBy={sortPref.sortBy}
                  direction={sortPref.direction}
                  onChange={setSortPref}
                />
              )}
            </div>

            {installedPackages === null || isLoadingMyAppsData ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
                Recherche des apps installées…
              </div>
            ) : installedAppsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Aucune app de votre sélection détectée sur cet appareil.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                {installedAppsList.map(app => (
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
                      <p className="text-[10px] text-slate-400 truncate">{app.category}</p>
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
            )}
          </div>
        )}

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

        <div className="mt-5 flex items-start gap-2 text-[11px] text-slate-400">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <p>Ces actions sont locales à cet appareil et irréversibles une fois confirmées.</p>
        </div>
      </div>
    </div>
  );
};

export default StorageManagerModal;
