import React from 'react';

/**
 * Composant Logo TrustiScore
 */
const TrustiLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    {/* Fond circulaire dégradé */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-90 shadow-lg"></div>
    
    {/* Bouclier central */}
    <div className="relative z-10 flex items-center justify-center h-full w-full">
      {/* Cadenas stylisé */}
      <div className="text-white drop-shadow-lg">
        <svg 
          viewBox="0 0 100 120" 
          className="w-6 h-6 drop-shadow-md" 
          fill="none" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M30 50 Q30 30 50 30 Q70 30 70 50" />
          <rect x="25" y="50" width="50" height="45" rx="4" />
          <circle cx="50" cy="75" r="3" fill="white" />
        </svg>
      </div>
      
      {/* Cœur stylisé au centre (symbole de confiance) */}
      <div className="absolute text-pink-200 text-xs opacity-80 drop-shadow">♥</div>
    </div>
    
    {/* Ornements géométriques pour l'open source */}
    <div className="absolute top-0 right-1 w-1.5 h-1.5 bg-lime-300 rounded-full opacity-80 shadow-sm"></div>
    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-80 shadow-sm"></div>
    <div className="absolute bottom-2 right-2 w-1 h-1 bg-amber-300 rounded-full opacity-70"></div>
  </div>
);

export default TrustiLogo;
