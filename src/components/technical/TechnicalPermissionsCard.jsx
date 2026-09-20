import React from 'react';
import { Shield } from 'lucide-react';
import { DetectionStatus, ProtectionLevel, PROTECTION_LEVEL_LABEL } from '../../technical';
import { getPermissionSignal, SIGNAL_STYLE } from './technicalSignals';

const GRANTED_LABEL = {
  [DetectionStatus.DETECTED]: 'Accordée',
  [DetectionStatus.NOT_DETECTED]: 'Non accordée',
  [DetectionStatus.UNKNOWN]: 'Statut non déterminé',
};

const GRANTED_CLASS = {
  [DetectionStatus.DETECTED]: 'bg-emerald-50 text-emerald-700',
  [DetectionStatus.NOT_DETECTED]: 'bg-slate-100 text-slate-500',
  [DetectionStatus.UNKNOWN]: 'bg-slate-50 text-slate-400',
};

const PermissionRow = ({ permission, highlighted }) => (
  <div
    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 border ${
      highlighted ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
    }`}
  >
    <div className="flex items-center gap-2 min-w-0">
      <span className="shrink-0">{permission.icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-700 truncate">{permission.readableName}</p>
        <p className="text-[10px] text-slate-400 truncate">{PROTECTION_LEVEL_LABEL[permission.protectionLevel]}</p>
      </div>
    </div>
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${GRANTED_CLASS[permission.granted]}`}>
      {GRANTED_LABEL[permission.granted]}
    </span>
  </div>
);

/**
 * Permissions détectées localement sur l'appareil (distinct du bloc
 * "Permissions demandées" existant, qui vient des données éditoriales
 * Trusti). Fait toujours la distinction déclarée / accordée : une permission
 * déclarée n'est jamais présentée comme la preuve d'un usage réel (spec §5).
 *
 * Pédagogie : les permissions "sensibles" (DANGEROUS) réellement accordées
 * sont mises en avant en premier — ce sont celles qui ont nécessité une
 * confirmation explicite de l'utilisateur, donc celles qui méritent le plus
 * l'attention pour un public non technique.
 */
const TechnicalPermissionsCard = ({ permissions }) => {
  const grantedCount = permissions.filter((p) => p.granted === DetectionStatus.DETECTED).length;
  const signal = getPermissionSignal(permissions);
  const style = SIGNAL_STYLE[signal.level];

  const sensitiveGranted = permissions.filter(
    (p) => p.protectionLevel === ProtectionLevel.DANGEROUS && p.granted === DetectionStatus.DETECTED
  );
  const rest = permissions.filter((p) => !sensitiveGranted.includes(p));

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-2">
          <Shield size={16} className="text-orange-600" /> Permissions
        </h3>
        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {permissions.length} déclarée{permissions.length > 1 ? 's' : ''} · {grantedCount} accordée{grantedCount > 1 ? 's' : ''}
        </span>
      </div>

      {permissions.length === 0 ? (
        <p className="text-xs text-slate-400">Aucune permission déclarée détectée.</p>
      ) : (
        <>
          <div className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed mb-3 ${style.badgeClass}`}>
            <span className="shrink-0">{style.icon}</span>
            <span>{signal.explanation}</span>
          </div>

          {sensitiveGranted.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-black uppercase tracking-wide text-amber-600 mb-1.5">
                Sensibles et accordées — à surveiller en priorité
              </p>
              <div className="space-y-1.5">
                {sensitiveGranted.map((permission) => (
                  <PermissionRow key={permission.androidName} permission={permission} highlighted />
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              {sensitiveGranted.length > 0 && (
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5">Autres permissions</p>
              )}
              <div className="space-y-1.5">
                {rest.map((permission) => (
                  <PermissionRow key={permission.androidName} permission={permission} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechnicalPermissionsCard;
