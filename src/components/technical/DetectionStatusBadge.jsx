import React from 'react';
import { DetectionStatus } from '../../technical';

const CONFIG = {
  [DetectionStatus.DETECTED]: { icon: '✅', label: 'Oui', className: 'bg-emerald-50 text-emerald-700' },
  [DetectionStatus.NOT_DETECTED]: { icon: '❌', label: 'Non détecté', className: 'bg-slate-100 text-slate-500' },
  [DetectionStatus.UNKNOWN]: { icon: '⚪', label: 'Non déterminé', className: 'bg-slate-50 text-slate-400' },
};

/**
 * Badge générique pour un DetectionStatus (DETECTED / NOT_DETECTED / UNKNOWN).
 * `detectedLabel` / `notDetectedLabel` permettent de personnaliser le texte
 * pour DETECTED/NOT_DETECTED (ex. "Activé"/"Désactivé") sans dupliquer le
 * composant — UNKNOWN reste toujours "Non déterminé", jamais reformulé en
 * "Non" pour ne pas laisser croire à une absence constatée.
 */
const DetectionStatusBadge = ({ status, detectedLabel, notDetectedLabel }) => {
  const config = CONFIG[status] || CONFIG[DetectionStatus.UNKNOWN];
  let label = config.label;
  if (status === DetectionStatus.DETECTED && detectedLabel) label = detectedLabel;
  if (status === DetectionStatus.NOT_DETECTED && notDetectedLabel) label = notDetectedLabel;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${config.className}`}>
      <span>{config.icon}</span>
      <span>{label}</span>
    </span>
  );
};

export default DetectionStatusBadge;
