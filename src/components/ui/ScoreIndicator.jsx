import React from 'react';
import { GRADES, GRADE_COLORS } from '../../constants/grades';

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

  return (
    <div className="flex items-center bg-slate-100 rounded-full p-0.5 h-8 w-24 relative overflow-hidden">
      {GRADES.map((g) => (
        <div
          key={g}
          className="relative flex-1 h-full flex items-center justify-center"
        >
          {grade === g && (
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                GRADE_COLORS[g]
              } w-5 h-5 rounded-full shadow-md`}
            />
          )}
          <span
            className={`relative z-10 text-[10px] font-black transition-colors duration-200 ${
              grade === g ? 'text-white' : 'text-slate-400'
            }`}
          >
            {g}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ScoreIndicator;
