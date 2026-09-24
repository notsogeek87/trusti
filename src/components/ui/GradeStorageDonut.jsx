import React from 'react';
import { GRADE_COLORS } from '../../constants/grades';
import { formatBytes } from '../../utils/storageStats';

// Couleurs hex des grades (GRADE_COLORS ne donne que des classes Tailwind
// `bg-[#...]`, inutilisables comme valeur `stroke` SVG) — mêmes valeurs,
// seule la syntaxe change, pour ne jamais dupliquer la palette de marque.
const GRADE_HEX = Object.fromEntries(
  Object.entries(GRADE_COLORS).map(([grade, cls]) => [grade, cls.slice(4, -1)])
);

const RADIUS = 70;
const STROKE = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 4; // écart (en unités de circonférence) entre segments adjacents
const CENTER = 100;

// Angle (degrés, 0° = 3h, sens horaire) du point à mi-parcours d'un segment
// qui commence à `offset` et fait `length` de long sur la circonférence,
// une fois le cadran tourné de -90° pour démarrer à midi (voir <g transform>
// ci-dessous, répliqué ici en pur calcul pour placer les libellés bien
// droits, sans les faire pivoter avec les arcs).
const angleForOffset = (offset) => -90 + (offset / CIRCUMFERENCE) * 360;
const pointOnRing = (angleDeg, radius = RADIUS) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
};

/**
 * Camembert (donut) : espace disque occupé par les apps installées, réparti
 * par note TrustiScore (A à E). `entries` = [{ grade, bytes, count }], déjà
 * filtré aux grades effectivement présents (bytes > 0) — l'ordre A→E fixe de
 * la marque est préservé, jamais réordonné par taille.
 *
 * Composant contrôlé : `selectedGrade`/`onSelectGrade` viennent du parent
 * (StoragePage), qui s'en sert aussi pour filtrer la liste des apps
 * installées — taper une zone du camembert ou sa légende doit filtrer cette
 * liste, pas seulement mettre en avant la légende localement.
 */
const GradeStorageDonut = ({ entries, totalBytes, selectedGrade = null, onSelectGrade }) => {
  let cumulative = 0;
  const segments = entries.map(({ grade, bytes, count }) => {
    const fraction = totalBytes > 0 ? bytes / totalBytes : 0;
    const rawLength = fraction * CIRCUMFERENCE;
    const length = Math.max(rawLength - GAP, 0);
    const offset = cumulative;
    cumulative += rawLength;
    return { grade, bytes, count, fraction, length, offset, midAngle: angleForOffset(offset + rawLength / 2) };
  });

  const toggleGrade = (grade) => {
    onSelectGrade?.(selectedGrade === grade ? null : grade);
  };

  const active = segments.find((s) => s.grade === selectedGrade);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-32 h-32 flex-shrink-0" role="img" aria-label="Répartition de l'espace de stockage par note TrustiScore">
        {/* Piste de fond : visible si aucune app avec taille connue */}
        {totalBytes === 0 && (
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
        )}

        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {segments.map((seg) => (
            <circle
              key={seg.grade}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={GRADE_HEX[seg.grade]}
              strokeWidth={selectedGrade === seg.grade ? STROKE + 6 : STROKE}
              strokeDasharray={`${seg.length} ${CIRCUMFERENCE - seg.length}`}
              strokeDashoffset={-(seg.offset + GAP / 2)}
              strokeLinecap="butt"
              onClick={() => toggleGrade(seg.grade)}
              style={{ cursor: 'pointer', transition: 'stroke-width 0.15s ease-out' }}
            />
          ))}
        </g>

        {/* Libellés directs (lettre du grade) sur les segments assez grands
            pour l'accueillir — l'identité ne repose jamais que sur la couleur
            (voir légende ci-dessous pour les segments trop fins). */}
        {segments
          .filter((seg) => seg.fraction >= 0.08)
          .map((seg) => {
            const { x, y } = pointOnRing(seg.midAngle);
            return (
              <text
                key={seg.grade}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white text-[15px] font-black pointer-events-none select-none"
              >
                {seg.grade}
              </text>
            );
          })}
      </svg>

      <div className="flex-1 min-w-0 space-y-1">
        {segments.map((seg) => (
          <button
            key={seg.grade}
            type="button"
            onClick={() => toggleGrade(seg.grade)}
            className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-left transition-colors ${
              selectedGrade === seg.grade ? 'bg-slate-100' : 'hover:bg-slate-50'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: GRADE_HEX[seg.grade] }}
              aria-hidden="true"
            />
            <span className="text-xs font-bold text-slate-700 w-3.5 flex-shrink-0">{seg.grade}</span>
            <span className="text-[10px] text-slate-400 truncate flex-1 min-w-0">
              {seg.count} app{seg.count > 1 ? 's' : ''}
            </span>
            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap flex-shrink-0">
              {formatBytes(seg.bytes)}
            </span>
            <span className="text-[10px] text-slate-400 w-8 text-right flex-shrink-0">
              {Math.round(seg.fraction * 100)}%
            </span>
          </button>
        ))}
      </div>
      </div>

      {active && (
        <p className="mt-2 text-[11px] text-slate-500 text-center">
          Note <span className="font-black">{active.grade}</span> : {active.count} app{active.count > 1 ? 's' : ''},{' '}
          {formatBytes(active.bytes)} ({Math.round(active.fraction * 100)}% de l'espace occupé par vos apps)
        </p>
      )}
    </div>
  );
};

export default GradeStorageDonut;
