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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header avec onglets */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative shrink-0 rounded-t-3xl">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
          >
            <X size={24}/>
          </button>
          <h2 className="text-2xl font-black mb-4">Administration des Apps</h2>
          
          {/* Onglets */}
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
              TrustiApps
            </button>
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
        <div className="border-t border-slate-200 p-6 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
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
