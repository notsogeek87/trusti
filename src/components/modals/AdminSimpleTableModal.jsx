import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

const AdminSimpleTableModal = ({ onClose }) => {
  const [apps, setApps] = useState([]);
  const [editedApps, setEditedApps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(0);
  const itemsPerPage = 50;
  
  // Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Charger les apps
  const loadApps = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      let url;
      if (search.trim()) {
        // Mode recherche : pas de pagination
        url = `${API_URL}/apps?search=${encodeURIComponent(search)}`;
        setIsSearching(true);
      } else {
        // Mode normal : avec pagination
        url = `${API_URL}/apps?limit=${itemsPerPage}&page=${page}`;
        setIsSearching(false);
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setApps(data.apps);
        setTotalApps(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des apps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps(1);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadApps(1, searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleChange = (index, field, value) => {
    const updated = [...apps];
    updated[index][field] = value;
    setApps(updated);
    setEditedApps(prev => {
      const already = prev.find(a => a.id === updated[index].id);
      if (already) {
        return prev.map(a => a.id === updated[index].id ? updated[index] : a);
      } else {
        return [...prev, updated[index]];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    for (const app of editedApps) {
      // Forcer la valeur sur les deux formats pour compatibilité
      const showValue = typeof app.show_in_awards !== 'undefined' ? Number(app.show_in_awards) : (typeof app.showInAwards !== 'undefined' ? Number(app.showInAwards) : 0);
      const appToSend = {
        ...app,
        show_in_awards: showValue,
        showInAwards: showValue
      };
      await fetch(`${API_URL}/apps?id=${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appToSend)
      });
    }
    setIsSaving(false);
    setEditedApps([]);
    alert('Modifications enregistrées !');
    // Recharger la page actuelle
    loadApps(currentPage, searchTerm);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadApps(currentPage - 1, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadApps(currentPage + 1, searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadApps(1, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Console d'administration</h2>
            <span className="text-sm text-slate-500">
              {isSearching 
                ? `${apps.length} résultat${apps.length > 1 ? 's' : ''}`
                : `${totalApps} app${totalApps > 1 ? 's' : ''} total`
              }
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-lg">✕</button>
        </div>

        {/* Barre de recherche et pagination */}
        <div className="px-6 py-3 border-b bg-slate-50 flex items-center justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une app..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Contrôles de pagination */}
          {!isSearching && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoading}
                className="p-2 rounded-lg border hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Page précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="p-2 rounded-lg border hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Page suivante"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-500">Chargement...</div>
            </div>
          ) : (
            <table className="min-w-full border text-sm">
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  <th className="border px-2 py-1">Nom</th>
                  <th className="border px-2 py-1">Grade</th>
                  <th className="border px-2 py-1">Catégorie</th>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1">Awards ?</th>
                  <th className="border px-2 py-1">Play Store</th>
                  <th className="border px-2 py-1">F-Droid</th>
                  <th className="border px-2 py-1">Site web</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, idx) => (
                  <tr key={app.id}>
                    <td className="border px-2 py-1">
                      <input value={app.name} onChange={e => handleChange(idx, 'name', e.target.value)} className="w-full" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={app.grade} onChange={e => handleChange(idx, 'grade', e.target.value)} className="w-full" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={app.category} onChange={e => handleChange(idx, 'category', e.target.value)} className="w-full" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={app.reason || ''} onChange={e => handleChange(idx, 'reason', e.target.value)} className="w-full" />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        value={
                          typeof app.show_in_awards !== 'undefined' && app.show_in_awards !== null
                            ? app.show_in_awards
                            : (typeof app.showInAwards !== 'undefined' && app.showInAwards !== null
                                ? (app.showInAwards === true ? 1 : app.showInAwards === false ? 0 : app.showInAwards)
                                : 0)
                        }
                        onChange={e => handleChange(idx, 'show_in_awards', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-12 text-center"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={app.playStoreUrl || ''} onChange={e => handleChange(idx, 'playStoreUrl', e.target.value)} className="w-full" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={app.fDroidUrl || ''} onChange={e => handleChange(idx, 'fDroidUrl', e.target.value)} className="w-full" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={app.websiteUrl || ''} onChange={e => handleChange(idx, 'websiteUrl', e.target.value)} className="w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t">
          <div className="text-sm text-slate-500">
            {editedApps.length > 0 && (
              <span className="text-orange-600 font-medium">
                {editedApps.length} modification{editedApps.length > 1 ? 's' : ''} non enregistrée{editedApps.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={isSaving || editedApps.length === 0} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button 
              onClick={onClose} 
              className="bg-slate-200 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSimpleTableModal;
