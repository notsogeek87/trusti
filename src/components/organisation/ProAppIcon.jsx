import React, { useState } from 'react';

/** Icône d'app avec repli sur l'initiale si l'image ne charge pas. */
const ProAppIcon = ({ app, size = 'w-8 h-8' }) => {
  const [failed, setFailed] = useState(false);
  const hasImage = !failed && typeof app.icon === 'string' && app.icon.startsWith('http');
  return (
    <div aria-hidden="true" className={`${size} shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden`}>
      {hasImage ? (
        <img src={app.icon} alt="" loading="lazy" className="w-full h-full object-contain p-0.5" onError={() => setFailed(true)} />
      ) : (
        <span className="text-xs font-black text-slate-500">{app.name?.charAt(0) || '?'}</span>
      )}
    </div>
  );
};

export default React.memo(ProAppIcon);
