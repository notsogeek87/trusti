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

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S : Sauvegarder
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editedApps.length > 0 && !isSaving) {
          handleSave();
        }
      }
      // Échap : Fermer
      if (e.key === 'Escape') {
        onClose();
      }
      // Flèche gauche : Page précédente (si pas de focus dans un input)
      if (e.key === 'ArrowLeft' && !isSearching && currentPage > 1 && !isLoading) {
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          handlePreviousPage();
        }
      }
      // Flèche droite : Page suivante (si pas de focus dans un input)
      if (e.key === 'ArrowRight' && !isSearching && currentPage < totalPages && !isLoading) {
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          handleNextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedApps.length, isSaving, currentPage, totalPages, isSearching, isLoading]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-[96vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Console d'administration</h2>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {isSearching 
                ? `${apps.length} résultat${apps.length > 1 ? 's' : ''}`
                : `${totalApps} app${totalApps > 1 ? 's' : ''} total`
              }
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            title="Fermer (Échap)"
          >
            ✕
          </button>
        </div>

        {/* Barre de recherche et pagination */}
        <div className="px-4 py-2 border-b bg-slate-50 flex items-center justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une app..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Contrôles de pagination */}
          {!isSearching && (
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoading}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Page précédente (←)"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium min-w-[90px] text-center tabular-nums">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Page suivante (→)"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-500 text-sm">Chargement...</div>
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
                <tr>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[180px]">Nom</th>
                  <th className="border border-slate-200 px-2 py-2 text-center font-semibold w-[50px]">Grade</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[130px]">Catégorie</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[250px]">Description/Raison</th>
                  <th className="border border-slate-200 px-2 py-2 text-center font-semibold w-[60px]" title="Show in Awards">Awards</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[200px]">Play Store URL</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[200px]">App Store URL</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[200px]">F-Droid URL</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[200px]">Github URL</th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold w-[200px]">Site Web</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.name} 
                        onChange={e => handleChange(idx, 'name', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <select
                        value={app.grade}
                        onChange={e => handleChange(idx, 'grade', e.target.value)}
                        className="w-full px-1 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs text-center font-semibold"
                      >
                        <option value="A" className="text-green-600">A</option>
                        <option value="B" className="text-lime-600">B</option>
                        <option value="C" className="text-yellow-600">C</option>
                        <option value="D" className="text-orange-600">D</option>
                        <option value="E" className="text-red-600">E</option>
                      </select>
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.category} 
                        onChange={e => handleChange(idx, 'category', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <textarea
                        value={app.reason || ''} 
                        onChange={e => handleChange(idx, 'reason', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs resize-none"
                        rows="2"
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={
                          typeof app.show_in_awards !== 'undefined' && app.show_in_awards !== null
                            ? Boolean(app.show_in_awards)
                            : (typeof app.showInAwards !== 'undefined' && app.showInAwards !== null
                                ? Boolean(app.showInAwards)
                                : false)
                        }
                        onChange={e => handleChange(idx, 'show_in_awards', e.target.checked ? 1 : 0)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.playStoreUrl || ''} 
                        onChange={e => handleChange(idx, 'playStoreUrl', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs font-mono"
                        placeholder="https://play.google.com/..."
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.appleStoreUrl || ''} 
                        onChange={e => handleChange(idx, 'appleStoreUrl', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs font-mono"
                        placeholder="https://apps.apple.com/..."
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.fDroidUrl || ''} 
                        onChange={e => handleChange(idx, 'fDroidUrl', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs font-mono"
                        placeholder="https://f-droid.org/..."
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.githubUrl || ''} 
                        onChange={e => handleChange(idx, 'githubUrl', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs font-mono"
                        placeholder="https://github.com/..."
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <input 
                        value={app.website || ''} 
                        onChange={e => handleChange(idx, 'website', e.target.value)} 
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs font-mono"
                        placeholder="https://..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-3 border-t bg-slate-50">
          <div className="text-xs text-slate-600 flex items-center gap-4">
            {editedApps.length > 0 ? (
              <span className="text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-full">
                ⚠️ {editedApps.length} modification{editedApps.length > 1 ? 's' : ''} non enregistrée{editedApps.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-slate-500">Aucune modification en attente</span>
            )}
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Raccourcis : <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+S</kbd> Sauver · <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Échap</kbd> Fermer</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={isSaving || editedApps.length === 0} 
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              title="Enregistrer (Ctrl+S)"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Enregistrement...
                </span>
              ) : (
                '💾 Enregistrer'
              )}
            </button>
            <button 
              onClick={onClose} 
              className="bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors"
              title="Fermer (Échap)"
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
