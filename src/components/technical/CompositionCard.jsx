import React from 'react';
import { Boxes } from 'lucide-react';
import { KNOWN_ARCHITECTURES, architectureLabel } from '../../technical';
import { formatBytes } from '../../utils/formatBytes';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
    <span className="text-slate-400">{label}</span>
    <span className="font-bold text-slate-700">{value ?? 'Non déterminé'}</span>
  </div>
);

/**
 * 📦 Composition — taille, DEX, bibliothèques natives, architectures, split
 * APK, nombre de composants. Purement descriptif (spec §2).
 */
const CompositionCard = ({ composition }) => {
  if (!composition.dataAvailable) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
        <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-2 flex items-center gap-2">
          <Boxes size={16} className="text-slate-600" /> Composition
        </h3>
        <p className="text-xs text-slate-400">Non déterminé — ces informations n'ont pas pu être lues sur cet appareil.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
        <Boxes size={16} className="text-slate-600" /> Composition
      </h3>

      <Row label="Taille totale" value={formatBytes(composition.totalSizeBytes)} />
      <Row label="Taille APK" value={formatBytes(composition.apkSizeBytes)} />
      <Row label="Fichiers DEX" value={composition.dexCount} />
      <Row label="Bibliothèques natives (.so)" value={composition.nativeLibraryCount} />
      <Row
        label="APK"
        value={composition.isSplitApk ? `Split (${composition.splitCount} fragments)` : 'Unique'}
      />

      {composition.architectures.length > 0 && (
        <div className="pt-2 mt-1">
          <p className="text-xs text-slate-400 mb-1.5">Architectures</p>
          <div className="flex flex-wrap gap-1.5">
            {KNOWN_ARCHITECTURES.filter((arch) => composition.architectures.includes(arch)).map((arch) => (
              <span key={arch} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                ✓ {architectureLabel(arch)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 mt-1 grid grid-cols-2 gap-x-4">
        <Row label="Activités" value={composition.activityCount} />
        <Row label="Services" value={composition.serviceCount} />
        <Row label="Receivers" value={composition.receiverCount} />
        <Row label="Providers" value={composition.providerCount} />
      </div>
      <Row label="Composants exportés" value={composition.exportedComponentCount} />
    </div>
  );
};

export default CompositionCard;
