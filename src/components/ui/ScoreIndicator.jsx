import React from 'react';
import { GRADE_COLORS } from '../../constants/grades';

// Les grades C et D ont un fond clair : texte foncé pour rester lisible.
const GRADE_TEXT_COLORS = {
  A: 'text-white',
  B: 'text-slate-900',
  C: 'text-slate-900',
  D: 'text-slate-900',
  E: 'text-white',
};

/**
 * Indicateur de score (note A, B, C, D, E)
 * @param {string} grade - La note (A, B, C, D, ou E)
 * @param {string} size - Taille: "small" ou "large"
 */
const ScoreIndicator = ({ grade, size = "small" }) => {
  if (size === "large") {
    return (
      <div className="flex flex-col items-center">
        <div className={`${GRADE_COLORS[grade]} w-24 h-28 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl shadow-slate-200 border-4 border-white`}>
          <span className="text-5xl font-black">{grade}</span>
        </div>
      </div>
    );
  }

  // Badge lettre unique, compact et lisible
  return (
    <div
      className={`${GRADE_COLORS[grade]} ${GRADE_TEXT_COLORS[grade] || 'text-white'} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
    >
      <span className="text-sm font-black leading-none">{grade}</span>
    </div>
  );
};

export default ScoreIndicator;
