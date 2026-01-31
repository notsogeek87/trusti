import React, { useState } from 'react';
import { X, Star, Globe } from 'lucide-react';
import AdminTrustiAppsModal from './AdminTrustiAppsModal';
import AdminStarAppsModal from './AdminStarAppsModal';

/**
 * Modal d'administration principale pour gérer TrustiApps et StarApps
 */
const AdminAppsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('star'); // 'star' ou 'trusti'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header avec onglets */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 relative shrink-0 rounded-t-3xl">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24}/>
          </button>
          <div className="flex items-center justify-between pr-12">
            <div>
              <h2 className="text-3xl font-black mb-2">Administration des Apps</h2>
              <p className="text-white/80 text-sm">Gérez les applications de l'onglet Sélection et Alternatives</p>
            </div>
            
            {/* Onglets à droite */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('star')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'star'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                <Star size={20} />
                StarApps (Sélection)
              </button>
              <button
                onClick={() => setActiveTab('trusti')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'trusti'
                    ? 'bg-white text-emerald-600 shadow-lg'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                <Globe size={20} />
                Alternatives
              </button>
            </div>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'star' ? (
            <AdminStarAppsModal onClose={onClose} isEmbedded={true} />
          ) : (
            <AdminTrustiAppsModal onClose={onClose} isEmbedded={true} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 shrink-0 rounded-b-3xl">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 ml-auto"
          >
            <X size={20} />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppsModal;
