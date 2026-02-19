import React from 'react';
import TrustiLogo from './TrustiLogo';

/**
 * Composant de chargement unifié avec logo Trusti
 */
const LoadingSpinner = ({ 
  message = "Chargement...", 
  size = "medium",
  showLogo = true 
}) => {
  // Tailles disponibles
  const sizes = {
    small: {
      container: "py-6",
      logo: "w-8 h-8",
      spinner: "h-8 w-8 border-3",
      text: "text-xs"
    },
    medium: {
      container: "py-12",
      logo: "w-12 h-12",
      spinner: "h-12 w-12 border-4",
      text: "text-sm"
    },
    large: {
      container: "py-16",
      logo: "w-16 h-16",
      spinner: "h-16 w-16 border-4",
      text: "text-base"
    }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <div className={`flex flex-col items-center justify-center ${sizeConfig.container}`}>
      {showLogo ? (
        <div className="mb-4 animate-pulse">
          <TrustiLogo className={sizeConfig.logo} />
        </div>
      ) : (
        <div className={`animate-spin rounded-full ${sizeConfig.spinner} border-indigo-500 border-t-transparent mb-4`}></div>
      )}
      <p className={`text-slate-600 font-semibold ${sizeConfig.text}`}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
