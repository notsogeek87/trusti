import React from 'react';
import { Smartphone } from 'lucide-react';
import { formatBytes } from '../../utils/formatBytes';
import { formatDate, t } from '../../i18n/index.js';

const formatDay = (timestampMs) => {
  if (!timestampMs) return t('technical.ui.unavailable');
  try {
    return formatDate(new Date(timestampMs), { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return t('technical.ui.unavailable');
  }
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
    <span className="text-slate-400">{label}</span>
    <span className="font-bold text-slate-700">{value ?? t('technical.ui.unavailable')}</span>
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
      <Smartphone size={16} className="text-slate-600" /> {t('technical.ui.info')}
    </h3>
    <div>
      <Row label={t('technical.ui.packageName')} value={appInfo.packageName} />
      <Row label={t('technical.ui.version')} value={appInfo.versionName} />
      <Row label={t('technical.ui.versionCode')} value={appInfo.versionCode} />
      <Row label={t('technical.ui.sdkMin')} value={appInfo.minSdkVersion} />
      <Row label={t('technical.ui.sdkTarget')} value={appInfo.targetSdkVersion} />
      <Row label={t('technical.ui.size')} value={formatBytes(appInfo.sizeBytes)} />
      <Row label={t('technical.ui.appType')} value={appInfo.isSystemApp === null ? undefined : appInfo.isSystemApp ? t('technical.ui.systemApp') : t('technical.ui.userApp')} />
      <Row label={t('technical.ui.installedOn')} value={formatDay(appInfo.firstInstallTime)} />
      <Row label={t('technical.ui.updatedOn')} value={formatDay(appInfo.lastUpdateTime)} />
      <Row label={t('technical.ui.installSource')} value={appInfo.installerPackageName} />
      {appInfo.splitApkPaths?.length > 0 && (
        <Row label={t('technical.ui.splitApk')} value={t('technical.ui.files', { count: appInfo.splitApkPaths.length + 1 })} />
      )}
    </div>
  </div>
);

export default AppInfoCard;
