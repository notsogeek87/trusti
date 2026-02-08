import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Upload, Filter } from 'lucide-react';
import { GRADE_INFO } from '../../constants/grades';
import { CATEGORIES } from '../../constants/categories';

// Détection de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

/**
 * Modal d'administration unifiée pour gérer toutes les applications
 */
const AdminUnifiedAppsModal = ({ onClose, isEmbedded = false }) => {
  const [allTrustiApps, setAllTrustiApps] = useState([]);
  const [allStarApps, setAllStarApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('ABC'); // 'ABC' ou 'DE'

  const [editingApp, setEditingApp] = useState({
    name: '',
    logo: '',
    grade: 'A',
    category: 'Application',
    description: '',
    playStoreUrl: '',
    appleStoreUrl: '',
    fDroidUrl: '',
    websiteUrl: ''
  });

  const [isAdding, setIsAdding] = useState(false);

  // Charger les apps au montage
  useEffect(() => {
    loadAllApps();
  }, []);

  const loadAllApps = async () => {
    try {
      setIsLoading(true);
      
      // Charger les deux types d'apps en parallèle
      const [trustiResponse, starResponse] = await Promise.all([
        fetch(`${API_URL}/custom-trusti-apps`),
        fetch(`${API_URL}/star-apps`)
      ]);
      
      const trustiData = await trustiResponse.json();
      const starData = await starResponse.json();
      
      if (trustiData.success) {
        setAllTrustiApps(trustiData.apps);
      }
      
      if (starData.success) {
        setAllStarApps(starData.apps);
      }
    } catch (error) {
      console.error('Error loading apps:', error);
      alert('Erreur lors du chargement des applications');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les apps selon le grade sélectionné
  const filteredApps = [...allTrustiApps, ...allStarApps].filter(app => {
    if (gradeFilter === 'ABC') {
      return app.grade === 'A' || app.grade === 'B' || app.grade === 'C';
    } else {
      return app.grade === 'D' || app.grade === 'E';
    }
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Déterminer l'API à utiliser selon le type d'app
  const getApiEndpoint = (app) => {
    // Si l'app existe dans trustiApps, c'est une TrustiApp
    const isTrustiApp = allTrustiApps.some(ta => ta.id === app.id);
    return isTrustiApp ? 'custom-trusti-apps' : 'star-apps';
  };

  // Ajouter/Modifier une application
  const handleSaveApp = async () => {
    if (!editingApp.name || !editingApp.grade) {
      alert('Nom et TrustiScore sont obligatoires');
      return;
    }

    // Déterminer le type d'app selon le grade
    const isABC = editingApp.grade === 'A' || editingApp.grade === 'B' || editingApp.grade === 'C';
    const endpoint = isABC ? 'custom-trusti-apps' : 'star-apps';
    const appType = isABC ? 'trusti' : 'star';

    const newApp = {
      id: editingApp.id || String(Date.now() + (isABC ? 2000 : 5000)),
      name: editingApp.name,
      icon: editingApp.logo || (isABC ? '📱' : '⭐'),
      grade: editingApp.grade,
      trustiScore: editingApp.grade,
      category: editingApp.category || 'Application',
      color: getGradeColor(editingApp.grade),
      reason: editingApp.description || (isABC ? 'Application respectueuse de la vie privée' : 'Application sélectionnée par l\'équipe'),
      appType
    };

    // Ajouter les champs optionnels pour les TrustiApps (ABC)
    if (isABC) {
      newApp.playStoreUrl = editingApp.playStoreUrl || '';
      newApp.appleStoreUrl = editingApp.appleStoreUrl || '';
      newApp.githubUrl = editingApp.fDroidUrl || '';
      newApp.website = editingApp.websiteUrl || '';
    }

    try {
      setIsSaving(true);
      const method = editingApp.id ? 'PUT' : 'POST';
      
      // Si on modifie une app existante, utiliser son endpoint d'origine
      const finalEndpoint = editingApp.id ? getApiEndpoint(editingApp) : endpoint;
      
      const response = await fetch(`${API_URL}/${finalEndpoint}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });

      const data = await response.json();
      
      if (data.success) {
        await loadAllApps();
        setEditingApp({
          name: '',
          logo: '',
          grade: gradeFilter === 'ABC' ? 'A' : 'D',
          category: 'Application',
          description: '',
          playStoreUrl: '',
          appleStoreUrl: '',
          fDroidUrl: '',
          websiteUrl: ''
        });
        setIsAdding(false);
      } else {
        console.error('❌ Save failed:', data);
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving app:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer une application
  const handleDeleteApp = async (app) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      return;
    }

    try {
      setIsSaving(true);
      
      const endpoint = getApiEndpoint(app);
      const response = await fetch(`${API_URL}/${endpoint}?id=${app.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadAllApps();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  };

  // Éditer une application
  const handleEditApp = (app) => {
    setEditingApp({
      id: app.id,
      name: app.name,
      logo: app.icon,
      grade: app.grade,
      category: app.category,
      description: app.reason,
      playStoreUrl: app.playStoreUrl || '',
      appleStoreUrl: app.appleStoreUrl || '',
      fDroidUrl: app.fDroidUrl || '',
      websiteUrl: app.websiteUrl || ''
    });
    setIsAdding(true);
  };

  // Obtenir la couleur selon le grade
  const getGradeColor = (grade) => {
    const gradeInfo = GRADE_INFO.find(g => g.grade === grade);
    return gradeInfo ? gradeInfo.bgColor.replace('bg-', 'bg-') : 'bg-slate-500';
  };

  const isABC = gradeFilter === 'ABC';
  const showAdvancedFields = isABC && isAdding;

  const innerContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtre de TrustiScore */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                  <Filter size={16} />
                  Filtrer par TrustiScore
                </h3>
                <p className="text-xs text-slate-600">
                  {isABC ? '🌍 Alternatives (A, B, C) - Applications respectueuses de la vie privée' : '⚠️ Sélection (D, E) - Applications à risque'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGradeFilter('ABC')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    gradeFilter === 'ABC'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  A • B • C
                </button>
                <button
                  onClick={() => setGradeFilter('DE')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    gradeFilter === 'DE'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  D • E
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Colonne gauche : Formulaire */}
            <div className="space-y-3">
              {/* Bouton Ajouter */}
              {!isAdding && (
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setEditingApp({
                      ...editingApp,
                      grade: gradeFilter === 'ABC' ? 'A' : 'D'
                    });
                  }}
                  disabled={isSaving}
                  className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                    isABC
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                  }`}
                >
                  <Plus size={18} />
                  Ajouter une application
                </button>
              )}

              {/* Formulaire d'ajout/édition */}
              {isAdding && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden sticky top-0">
                  <div className={`px-4 py-2.5 border-b border-slate-200 ${
                    isABC
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50'
                      : 'bg-gradient-to-r from-orange-50 to-red-50'
                  }`}>
                    <h3 className="font-bold text-sm text-slate-800">
                      {editingApp.id ? 'Modifier l\'application' : 'Nouvelle application'}
                    </h3>
                  </div>
                
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-3">
                    {/* Nom */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nom de l'application *
                      </label>
                      <input
                        type="text"
                        value={editingApp.name}
                        onChange={(e) => setEditingApp({...editingApp, name: e.target.value})}
                        placeholder={isABC ? "Signal, Proton Mail..." : "Gmail, TikTok..."}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                  {/* Logo de secours (si Play Store échoue) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Logo de secours (si non trouvé automatiquement)
                    </label>
                    <input
                      type="text"
                      value={editingApp.logo}
                      onChange={(e) => setEditingApp({...editingApp, logo: e.target.value})}
                      placeholder="URL https://... ou emoji 📱"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Le logo sera récupéré automatiquement depuis le Play Store. Cette URL n'est utilisée qu'en cas d'échec.
                    </p>
                    {editingApp.logo && (
                      <div className="mt-2 text-2xl">
                        {editingApp.logo.startsWith('http') ? (
                          <img src={editingApp.logo} alt="Preview" className="w-10 h-10 object-contain rounded-lg" />
                        ) : (
                          <span>{editingApp.logo}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* TrustiScore */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      TrustiScore *
                    </label>
                    <div className="flex gap-2">
                      {GRADE_INFO
                        .filter(({ grade }) => {
                          if (gradeFilter === 'ABC') {
                            return grade === 'A' || grade === 'B' || grade === 'C';
                          } else {
                            return grade === 'D' || grade === 'E';
                          }
                        })
                        .map(({ grade, bgColor, textColor, shadowColor }) => (
                          <button
                            key={grade}
                            onClick={() => setEditingApp({...editingApp, grade})}
                            className={`${bgColor} ${textColor || 'text-white'} ${shadowColor} w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all ${
                              editingApp.grade === grade ? 'scale-110 shadow-xl' : 'scale-100 opacity-60 hover:opacity-100'
                            }`}
                          >
                            {grade}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Catégorie *
                    </label>
                    <select
                      value={editingApp.category}
                      onChange={(e) => setEditingApp({...editingApp, category: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none bg-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={editingApp.description}
                      onChange={(e) => setEditingApp({...editingApp, description: e.target.value})}
                      placeholder="Raison du TrustiScore..."
                      rows="3"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Champs supplémentaires pour les alternatives (ABC) */}
                  {showAdvancedFields && (
                    <>
                      {/* Lien Play Store */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Lien Play Store (optionnel)
                        </label>
                        <input
                          type="url"
                          value={editingApp.playStoreUrl}
                          onChange={(e) => setEditingApp({...editingApp, playStoreUrl: e.target.value})}
                          placeholder="https://play.google.com/store/apps/details?id=..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Lien Apple Store */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Lien Apple Store (optionnel)
                        </label>
                        <input
                          type="url"
                          value={editingApp.appleStoreUrl}
                          onChange={(e) => setEditingApp({...editingApp, appleStoreUrl: e.target.value})}
                          placeholder="https://apps.apple.com/app/..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Lien F-Droid */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Lien F-Droid (optionnel)
                        </label>
                        <input
                          type="url"
                          value={editingApp.fDroidUrl}
                          onChange={(e) => setEditingApp({...editingApp, fDroidUrl: e.target.value})}
                          placeholder="https://f-droid.org/packages/..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Lien Site Web */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Lien Site Web (optionnel)
                        </label>
                        <input
                          type="url"
                          value={editingApp.websiteUrl}
                          onChange={(e) => setEditingApp({...editingApp, websiteUrl: e.target.value})}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                    {/* Boutons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveApp}
                        disabled={isSaving}
                        className={`flex-1 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm ${
                          isABC
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                        }`}
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <Save size={16} />
                            Enregistrer
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingApp({
                            name: '', 
                            logo: '', 
                            grade: gradeFilter === 'ABC' ? 'A' : 'D', 
                            category: 'Application', 
                            description: '', 
                            playStoreUrl: '', 
                            appleStoreUrl: '', 
                            fDroidUrl: '', 
                            websiteUrl: ''
                          });
                          setIsAdding(false);
                        }}
                        disabled={isSaving}
                        className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Colonne droite : Liste des applications */}
            <div className="space-y-3">
              <div className="sticky top-0 bg-white pb-2 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
                  <span>{isABC ? 'Alternatives (A, B, C)' : 'Sélection (D, E)'}</span>
                  <span className="text-xs font-normal text-slate-500">({filteredApps.length})</span>
                </h3>
              </div>
              
              <div className="space-y-2 max-h-[calc(95vh-320px)] overflow-y-auto pr-2">
              {filteredApps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">{isABC ? '🌍' : '⚠️'}</div>
                  <p className="text-slate-400 font-medium text-sm">Aucune application</p>
                  <p className="text-xs text-slate-300 mt-1">Cliquez sur "Ajouter une application" pour commencer</p>
                </div>
              ) : (
                filteredApps.map(app => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all group">
                    {/* Logo */}
                    <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-xl overflow-hidden">
                      {app.icon.startsWith('http') ? (
                        <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                      ) : (
                        <span>{app.icon}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{app.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{app.category}</p>
                    </div>

                    {/* Grade */}
                    <div className={`${app.color} w-7 h-7 rounded-lg flex items-center justify-center font-black text-white shrink-0 text-sm`}>
                      {app.grade}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditApp(app)}
                        disabled={isSaving}
                        className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Modifier"
                      >
                        <Upload size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app)}
                        disabled={isSaving}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Si c'est embedded dans AdminAppsModal, retourner seulement le contenu interne
  if (isEmbedded) {
    return (
      <div className="p-6">
        {innerContent}
      </div>
    );
  }

  // Sinon, retourner le modal complet (pour compatibilité)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-6 text-white/80 hover:text-white transition-colors"
            disabled={isSaving}
          >
            <X size={20}/>
          </button>
          <h2 className="text-xl font-black mb-1">Administration des Applications</h2>
          <p className="text-xs text-white/80">Gérez toutes les applications • Interface optimisée pour PC</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {innerContent}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 shrink-0">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="text-xs text-slate-500">
              {filteredApps.length} application{filteredApps.length > 1 ? 's' : ''} • Dernière modification : {new Date().toLocaleDateString('fr-FR')}
            </div>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-1.5 text-sm"
            >
              <X size={16} />
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUnifiedAppsModal;
