import React from 'react';
import { HelpCircle, PieChart } from 'lucide-react';
import { useIsMobile } from '../../contexts/ViewModeContext';

const Header = ({
  onOpenStorageManager,
  onShowLandingPage,
}) => {
  const isMobile = useIsMobile();

  return (
    <header className="h-14 bg-white/75 backdrop-blur-md border-b border-white/60 sticky top-0 z-30 shadow-sm">
      <div className="h-full max-w-full md:max-w-none px-4 md:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/assets/logo.png"
            alt="Trusti"
            className="w-11 h-11 object-contain"
          />
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
            Trusti
          </h1>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink min-w-0">
          <button
            onClick={onOpenStorageManager}
            className="p-1.5 md:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            aria-label="Gérer mon espace de stockage"
            title="Gérer mon espace de stockage"
          >
            <PieChart size={18} />
          </button>

          <button
            onClick={onShowLandingPage}
            className="p-1.5 md:p-2.5 rounded-full transition-all duration-300 shadow-sm bg-indigo-500 text-white hover:bg-indigo-600"
            aria-label="Aide et explications"
            title="À propos de Trusti"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
