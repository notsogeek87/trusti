import React from 'react';
import { ShieldAlert } from 'lucide-react';
import DetectionStatusBadge from './DetectionStatusBadge';
import { getSecuritySignals, SIGNAL_STYLE } from './technicalSignals';
import { t } from '../../i18n/index.js';

const Row = ({ label, children, explanation }) => (
  <div className="py-1.5 border-b border-slate-50 last:border-0">
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-400 shrink-0">{label}</span>
      {children}
    </div>
    {explanation && <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{explanation}</p>}
  </div>
);

/**
 * Badge coloré pour un signal pédagogique (bon / à surveiller / alerte /
 * neutre) — contrairement à DetectionStatusBadge, la couleur ici reflète le
 * SENS du fait (ex. "debuggable: oui" = rouge), pas seulement "détecté ou
 * non". Reste un signal sur UN fait précis, jamais un verdict global.
 */
const SignalBadge = ({ level, text }) => {
  const style = SIGNAL_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${style.badgeClass}`}>
      <span>{style.icon}</span>
      <span>{text}</span>
    </span>
  );
};

const valueLabels = () => ({
  debuggable: { good: t('technical.ui.no'), alert: t('technical.ui.yes'), neutral: t('technical.ui.undetermined') },
  cleartext: { good: t('technical.ui.no'), alert: t('technical.ui.yes'), neutral: t('technical.ui.undetermined') },
  backup: { good: t('technical.ui.disabled'), watch: t('technical.ui.enabled'), neutral: t('technical.ui.undetermined') },
});

/**
 * 🛡️ Sécurité — caractéristiques factuelles, présentées avec un repère
 * couleur + une explication en langage clair pour chaque point où le sens
 * "favorable / à surveiller" est établi (bonnes pratiques Android). Jamais
 * un verdict du type "application sécurisée" (spec §3) : chaque signal ne
 * porte que sur le fait affiché à côté. Certains champs restent
 * volontairement "Non déterminé" quand l'API publique Android ne les expose
 * pas de façon fiable (schéma de signature APK, certificats épinglés) — ils
 * gardent alors un badge neutre plutôt qu'un signal coloré.
 */
const SecurityCard = ({ security }) => {
  const [debuggable, cleartext, backup, targetSdk] = getSecuritySignals(security);
  const VALUE_LABEL = valueLabels();
  const undetermined = t('technical.ui.undetermined');

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
        <ShieldAlert size={16} className="text-red-600" /> {t('technical.ui.security')}
      </h3>

      <Row label={t('technical.ui.targetSdk')} explanation={targetSdk.explanation}>
        <SignalBadge level={targetSdk.level} text={security.targetSdkVersion ?? undetermined} />
      </Row>
      <Row label={t('technical.ui.minSdk')}>
        <span className="font-bold text-slate-700 text-xs">{security.minSdkVersion ?? undetermined}</span>
      </Row>
      <Row label={t('technical.signals.debugLabel')} explanation={debuggable.explanation}>
        <SignalBadge level={debuggable.level} text={VALUE_LABEL.debuggable[debuggable.level] ?? undetermined} />
      </Row>
      <Row label={t('technical.signals.backupLabel')} explanation={backup.explanation}>
        <SignalBadge level={backup.level} text={VALUE_LABEL.backup[backup.level] ?? undetermined} />
      </Row>
      <Row label={t('technical.signals.cleartextLabel')} explanation={cleartext.explanation}>
        <SignalBadge level={cleartext.level} text={VALUE_LABEL.cleartext[cleartext.level] ?? undetermined} />
      </Row>
      <Row
        label="Network Security Config"
        explanation={t('technical.ui.nscExplain')}
      >
        <DetectionStatusBadge status={security.networkSecurityConfigPresent} />
      </Row>
      <Row label={t('technical.ui.customCerts')}>
        <DetectionStatusBadge status={security.customPinnedCertificates} />
      </Row>
      <Row
        label={t('technical.ui.exported')}
        explanation={t('technical.ui.exportedExplain')}
      >
        <span className="font-bold text-slate-700 text-xs">{security.exportedComponentCount ?? undetermined}</span>
      </Row>
      <Row
        label={t('technical.ui.multiSigners')}
        explanation={t('technical.ui.multiSignersExplain')}
      >
        <DetectionStatusBadge status={security.hasMultipleSigners} detectedLabel={t('technical.ui.yes')} notDetectedLabel={t('technical.ui.no')} />
      </Row>
      <Row label={t('technical.ui.scheme')}>
        <DetectionStatusBadge status={security.signatureScheme} />
      </Row>

      {security.signingCertificatesSha256.length > 0 && (
        <div className="pt-2 mt-1">
          <p className="text-xs text-slate-400 mb-1.5">{t('technical.ui.certs')}</p>
          {security.signingCertificatesSha256.map((sha) => (
            <p key={sha} className="text-[10px] font-mono text-slate-500 break-all bg-slate-50 rounded px-2 py-1 mb-1">
              {sha}
            </p>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
        {t('technical.ui.securityNote')}
      </p>
    </div>
  );
};

export default SecurityCard;
