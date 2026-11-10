import React from 'react';
import AppIconImage from '../ui/AppIconImage';

/** Icône d'app avec repli sur l'initiale si l'image ne charge pas. */
const ProAppIcon = ({ app, size = 'w-8 h-8' }) => {
  const hasImage = typeof app.icon === 'string' && app.icon.startsWith('http');
  return (
    <div aria-hidden="true" className={`${size} shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden`}>
      {hasImage ? (
        <AppIconImage src={app.icon} name={app.name} alt="" className="w-full h-full object-contain p-0.5" />
      ) : (
        <span className="text-xs font-black text-slate-500">{app.name?.charAt(0) || '?'}</span>
      )}
    </div>
  );
};

export default React.memo(ProAppIcon);
