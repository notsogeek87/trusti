import React from 'react';
import { Smartphone } from 'lucide-react';
import { formatBytes } from '../../utils/formatBytes';

const formatDate = (timestampMs) => {
  if (!timestampMs) return 'Non disponible';
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(timestampMs));
  } catch {
    return 'Non disponible';
  }
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
    <span className="text-slate-400">{label}</span>
    <span className="font-bold text-slate-700">{value ?? 'Non disponible'}</span>
  </div>
);

/**
 * Informations générales de l'app, récupérées localement quand l'API Android
 * le permet. Un champ non déterminable reste "Non disponible" — jamais une
 * valeur inventée (spec §4 et §18).
 */
const AppInfoCard = ({ appInfo }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
    <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
      <Smartphone size={16} className="text-slate-600" /> Informations
    </h3>
    <div>
      <Row label="Nom du package" value={appInfo.packageName} />
      <Row label="Version" value={appInfo.versionName} />
      <Row label="Code version" value={appInfo.versionCode} />
      <Row label="SDK minimum" value={appInfo.minSdkVersion} />
      <Row label="SDK cible" value={appInfo.targetSdkVersion} />
      <Row label="Taille" value={formatBytes(appInfo.sizeBytes)} />
      <Row label="Type d'application" value={appInfo.isSystemApp === null ? undefined : appInfo.isSystemApp ? 'Application système' : 'Application utilisateur'} />
      <Row label="Installée le" value={formatDate(appInfo.firstInstallTime)} />
      <Row label="Mise à jour le" value={formatDate(appInfo.lastUpdateTime)} />
      <Row label="Source d'installation" value={appInfo.installerPackageName} />
      {appInfo.splitApkPaths?.length > 0 && (
        <Row label="APK fractionné (split)" value={`${appInfo.splitApkPaths.length + 1} fichiers`} />
      )}
    </div>
  </div>
);

export default AppInfoCard;
