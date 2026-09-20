import React from 'react';
import { ShieldAlert } from 'lucide-react';
import DetectionStatusBadge from './DetectionStatusBadge';
import { getSecuritySignals, SIGNAL_STYLE } from './technicalSignals';

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

const VALUE_LABEL = {
  debuggable: { good: 'Non', alert: 'Oui', neutral: 'Non déterminé' },
  cleartext: { good: 'Non', alert: 'Oui', neutral: 'Non déterminé' },
  backup: { good: 'Désactivée', watch: 'Activée', neutral: 'Non déterminé' },
};

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

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
        <ShieldAlert size={16} className="text-red-600" /> Sécurité
      </h3>

      <Row label="Version Android ciblée (target SDK)" explanation={targetSdk.explanation}>
        <SignalBadge level={targetSdk.level} text={security.targetSdkVersion ?? 'Non déterminé'} />
      </Row>
      <Row label="Version Android minimum requise">
        <span className="font-bold text-slate-700 text-xs">{security.minSdkVersion ?? 'Non déterminé'}</span>
      </Row>
      <Row label="Mode debug (debuggable)" explanation={debuggable.explanation}>
        <SignalBadge level={debuggable.level} text={VALUE_LABEL.debuggable[debuggable.level] ?? 'Non déterminé'} />
      </Row>
      <Row label="Sauvegarde Android (backup)" explanation={backup.explanation}>
        <SignalBadge level={backup.level} text={VALUE_LABEL.backup[backup.level] ?? 'Non déterminé'} />
      </Row>
      <Row label="Trafic HTTP non chiffré autorisé" explanation={cleartext.explanation}>
        <SignalBadge level={cleartext.level} text={VALUE_LABEL.cleartext[cleartext.level] ?? 'Non déterminé'} />
      </Row>
      <Row
        label="Network Security Config"
        explanation="Un réglage plus fin, par domaine, du chiffrement réseau. Sa présence n'est pas exposée par l'API Android publique : ce champ reste toujours « non déterminé »."
      >
        <DetectionStatusBadge status={security.networkSecurityConfigPresent} />
      </Row>
      <Row label="Certificats réseau personnalisés">
        <DetectionStatusBadge status={security.customPinnedCertificates} />
      </Row>
      <Row
        label="Composants exportés"
        explanation="Des éléments de l'application accessibles par d'autres applications sur le téléphone (ex. pour du partage). Un nombre élevé n'est pas anormal en soi ; tout dépend s'ils sont correctement protégés, ce que cette analyse ne peut pas vérifier."
      >
        <span className="font-bold text-slate-700 text-xs">{security.exportedComponentCount ?? 'Non déterminé'}</span>
      </Row>
      <Row
        label="Plusieurs signataires"
        explanation="Peut correspondre à une rotation normale de clé de signature par le développeur ; ce n'est pas en soi un signe de problème."
      >
        <DetectionStatusBadge status={security.hasMultipleSigners} detectedLabel="Oui" notDetectedLabel="Non" />
      </Row>
      <Row label="Schéma de signature APK">
        <DetectionStatusBadge status={security.signatureScheme} />
      </Row>

      {security.signingCertificatesSha256.length > 0 && (
        <div className="pt-2 mt-1">
          <p className="text-xs text-slate-400 mb-1.5">Certificat(s) de signature — SHA-256</p>
          {security.signingCertificatesSha256.map((sha) => (
            <p key={sha} className="text-[10px] font-mono text-slate-500 break-all bg-slate-50 rounded px-2 py-1 mb-1">
              {sha}
            </p>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
        Le cleartext HTTP reflète le paramètre déclaré dans le manifeste ; un Network Security Config
        peut affiner ce comportement par domaine, mais sa présence n'est pas exposée par l'API Android
        publique. Le schéma de signature APK (v1/v2/v3) n'est pas non plus exposé de façon fiable.
      </p>
    </div>
  );
};

export default SecurityCard;
