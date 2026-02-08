import React from 'react';
import { X } from 'lucide-react';
import AdminUnifiedAppsModal from './AdminUnifiedAppsModal';

/**
 * Modal d'administration principale pour gérer toutes les applications
 */
const AdminAppsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 relative shrink-0 rounded-t-3xl">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24}/>
          </button>
          <div className="flex items-center justify-between pr-12">
            <div>
              <h2 className="text-3xl font-black mb-2">Administration des Applications</h2>
              <p className="text-white/80 text-sm">Gérez toutes les applications avec un filtre par TrustiScore</p>
            </div>
          </div>
        </div>

        {/* Contenu unifié */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AdminUnifiedAppsModal onClose={onClose} isEmbedded={true} />
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
