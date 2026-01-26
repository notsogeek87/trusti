import React from 'react';

/**
 * Bouton de partage pour une section
 */
const ShareButton = ({ 
  title, 
  description, 
  count, 
  onShare, 
  bgColor = "bg-indigo-50",
  borderColor = "border-indigo-200",
  textColor = "text-indigo-900",
  subtextColor = "text-indigo-700",
  buttonColor = "bg-indigo-600 hover:bg-indigo-700",
  disabled = false
}) => {
  return (
    <div className={`mb-6 ${bgColor} border ${borderColor} rounded-2xl p-4 flex items-center justify-between`}>
      <div>
        <h3 className={`font-black text-sm ${textColor}`}>{title}</h3>
        <p className={`text-xs ${subtextColor} mt-1`}>{description}</p>
      </div>
      <button 
        onClick={onShare}
        disabled={disabled}
        className={`${buttonColor} disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors`}
      >
        Partager
      </button>
    </div>
  );
};

export default ShareButton;
