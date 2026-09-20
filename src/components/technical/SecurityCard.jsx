import React from 'react';
import { ShieldAlert } from 'lucide-react';
import DetectionStatusBadge from './DetectionStatusBadge';

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0">
    <span className="text-slate-400 shrink-0">{label}</span>
    {children}
  </div>
);

/**
 * 🛡️ Sécurité — caractéristiques factuelles uniquement, jamais un verdict
 * du type "application sécurisée" (spec §3). Certains champs restent
 * volontairement "Non déterminé" quand l'API publique Android ne les expose
 * pas de façon fiable (schéma de signature APK, certificats épinglés).
 */
const SecurityCard = ({ security }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
    <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
      <ShieldAlert size={16} className="text-red-600" /> Sécurité
    </h3>

    <Row label="Target SDK">
      <span className="font-bold text-slate-700 text-xs">{security.targetSdkVersion ?? 'Non déterminé'}</span>
    </Row>
    <Row label="Min SDK">
      <span className="font-bold text-slate-700 text-xs">{security.minSdkVersion ?? 'Non déterminé'}</span>
    </Row>
    <Row label="Debuggable">
      <DetectionStatusBadge status={security.debuggable} detectedLabel="Oui" notDetectedLabel="Non" />
    </Row>
    <Row label="Sauvegarde Android (backup)">
      <DetectionStatusBadge status={security.allowBackup} detectedLabel="Activée" notDetectedLabel="Désactivée" />
    </Row>
    <Row label="Cleartext HTTP autorisé">
      <DetectionStatusBadge status={security.usesCleartextTraffic} detectedLabel="Oui" notDetectedLabel="Non détecté" />
    </Row>
    <Row label="Network Security Config">
      <DetectionStatusBadge status={security.networkSecurityConfigPresent} detectedLabel="Présent" notDetectedLabel="Non détecté" />
    </Row>
    <Row label="Certificats réseau personnalisés">
      <DetectionStatusBadge status={security.customPinnedCertificates} />
    </Row>
    <Row label="Composants exportés">
      <span className="font-bold text-slate-700 text-xs">{security.exportedComponentCount ?? 'Non déterminé'}</span>
    </Row>
    <Row label="Plusieurs signataires">
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
      peut affiner ce comportement par domaine, ce qui n'est pas analysé ici. Le schéma de signature
      APK (v1/v2/v3) n'est pas exposé de façon fiable par l'API Android publique.
    </p>
  </div>
);

export default SecurityCard;
