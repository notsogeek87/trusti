import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Upload } from 'lucide-react';
import { GRADE_INFO } from '../../constants/grades';

// Détection de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

/**
 * Modal d'administration pour gérer les TrustiApps
 */
const AdminTrustiAppsModal = ({ onClose, onSave, isEmbedded = false }) => {
  const [apps, setApps] = useState([]);
  const [playStoreApps, setPlayStoreApps] = useState([]);
  const [starApps, setStarApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editingApp, setEditingApp] = useState({
    name: '',
    logo: '',
    grade: 'A',
    category: 'Application',
    description: '',
    replacesAppIds: [], // Changé en array pour sélection multiple
    playStoreUrl: '',
    appleStoreUrl: '',
    fDroidUrl: '',
    websiteUrl: ''
  });

  const [isAdding, setIsAdding] = useState(false);

  // Charger les apps depuis l'API au montage
  useEffect(() => {
    loadApps();
    loadPlayStoreApps();
    loadStarApps();
  }, []);

  const loadPlayStoreApps = async () => {
    try {
      const response = await fetch(`${API_URL}/top-apps`);
      const data = await response.json();
      console.log('Play Store apps loaded:', data);
      if (data.success && data.apps) {
        // Normaliser les IDs en strings
        const normalizedApps = data.apps.map(app => ({
          ...app,
          id: String(app.id)
        }));
        setPlayStoreApps(normalizedApps);
        console.log('Play Store apps set:', normalizedApps.length);
      }
    } catch (error) {
      console.error('Error loading Play Store apps:', error);
    }
  };

  const loadStarApps = async () => {
    try {
      const response = await fetch(`${API_URL}/star-apps`);
      const data = await response.json();
      console.log('Star apps loaded:', data);
      if (data.success && data.apps) {
        // Normaliser les IDs en strings
        const normalizedApps = data.apps.map(app => ({
          ...app,
          id: String(app.id)
        }));
        setStarApps(normalizedApps);
        console.log('Star apps set:', normalizedApps.length);
      }
    } catch (error) {
      console.error('Error loading Star apps:', error);
    }
  };

  const loadApps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/custom-trusti-apps`);
      const data = await response.json();
      if (data.success) {
        setApps(data.apps);
      }
    } catch (error) {
      console.error('Error loading custom apps:', error);
      alert('Erreur lors du chargement des applications');
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter/Modifier une application
  const handleSaveApp = async () => {
    if (!editingApp.name || !editingApp.grade) {
      alert('Nom et TrustiScore sont obligatoires');
      return;
    }

    const newApp = {
      id: editingApp.id || String(Date.now() + 2000), // ID unique
      name: editingApp.name,
      icon: editingApp.logo || '📱',
      grade: editingApp.grade,
      trustiScore: editingApp.grade,
      category: editingApp.category || 'Application',
      color: getGradeColor(editingApp.grade),
      reason: editingApp.description || 'Application respectueuse de la vie privée',
      replacesAppIds: editingApp.replacesAppIds || [], // Array d'IDs
      playStoreUrl: editingApp.playStoreUrl || '',
      appleStoreUrl: editingApp.appleStoreUrl || '',
      githubUrl: editingApp.fDroidUrl || '',
      website: editingApp.websiteUrl || '',
      appType: 'trusti'
    };

    try {
      setIsSaving(true);
      const method = editingApp.id ? 'PUT' : 'POST';
      const response = await fetch(`${API_URL}/custom-trusti-apps`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });

      const data = await response.json();
      
      if (data.success) {
        // Recharger les apps depuis l'API pour s'assurer qu'on a les bonnes données
        await loadApps();
        // Réinitialiser le formulaire
        setEditingApp({
          name: '',
          logo: '',
          grade: 'A',
          category: 'Application',
          description: '',
          replacesAppIds: []
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
  const handleDeleteApp = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      return;
    }

    try {
      setIsSaving(true);
      const updatedApps = apps.filter(a => a.id !== id);
      
      const response = await fetch(`${API_URL}/custom-trusti-apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apps: updatedApps })
      });

      const data = await response.json();
      
      if (data.success) {
        // Recharger les apps depuis l'API
        await loadApps();
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
    // Normaliser les IDs en strings pour la cohérence
    let replacesAppIds = app.replacesAppIds || (app.replacesAppId ? [app.replacesAppId] : []);
    replacesAppIds = replacesAppIds.map(id => String(id));
    
    setEditingApp({
      id: app.id,
      name: app.name,
      logo: app.icon,
      grade: app.grade,
      category: app.category,
      description: app.reason,
      replacesAppIds,
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

  const innerContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Explication */}
          <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
            <p className="text-sm text-emerald-800 font-medium">
              🌍 Les <strong>Alternatives</strong> sont des alternatives respectueuses de la vie privée. 
              Elles peuvent remplacer des applications du Play Store et apparaissent dans l'onglet "Alternatives".
            </p>
          </div>

          {/* Bouton Ajouter */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              disabled={isSaving}
              className="w-full mb-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Ajouter une TrustiApp
            </button>
          )}

          {/* Formulaire d'ajout/édition */}
          {isAdding && (
            <div className="mb-6 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b-2 border-slate-200 z-10">
                <h3 className="font-bold text-lg text-slate-800">
                  {editingApp.id ? 'Modifier l\'application' : 'Nouvelle application'}
                </h3>
              </div>
              
              <div className="p-6 max-h-[50vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Nom de l'application *
                    </label>
                    <input
                      type="text"
                      value={editingApp.name}
                      onChange={(e) => setEditingApp({...editingApp, name: e.target.value})}
                      placeholder="Signal, Proton Mail..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                {/* Logo (URL ou emoji) */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Logo (URL ou emoji)
                  </label>
                  <input
                    type="text"
                    value={editingApp.logo}
                    onChange={(e) => setEditingApp({...editingApp, logo: e.target.value})}
                    placeholder="🔒 ou https://..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                  {editingApp.logo && (
                    <div className="mt-2 text-3xl">
                      {editingApp.logo.startsWith('http') ? (
                        <img src={editingApp.logo} alt="Preview" className="w-12 h-12 object-contain rounded-lg" />
                      ) : (
                        <span>{editingApp.logo}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* TrustiScore */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    TrustiScore *
                  </label>
                  <div className="flex gap-2">
                    {GRADE_INFO.map(({ grade, bgColor, textColor, shadowColor }) => (
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={editingApp.category}
                    onChange={(e) => setEditingApp({...editingApp, category: e.target.value})}
                    placeholder="Communication, Sécurité..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Applications à remplacer (Play Store ou StarApp) - Multi-sélection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Remplace les applications (optionnel)
                    <span className="text-xs text-slate-500 ml-2">
                      ({playStoreApps.length + starApps.length} apps disponibles)
                    </span>
                  </label>
                  
                  {/* Liste des apps sélectionnées */}
                  {editingApp.replacesAppIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editingApp.replacesAppIds.map(appId => {
                        const app = [...playStoreApps, ...starApps].find(a => a.id === appId);
                        return app ? (
                          <div key={appId} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                            <span>{app.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingApp({
                                  ...editingApp,
                                  replacesAppIds: editingApp.replacesAppIds.filter(id => id !== appId)
                                });
                              }}
                              className="hover:text-indigo-900"
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  <select
                    value=""
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Selected value:', value, 'Type:', typeof value);
                      console.log('Current replacesAppIds:', editingApp.replacesAppIds);
                      console.log('All playStoreApps IDs:', playStoreApps.map(a => ({id: a.id, type: typeof a.id})));
                      console.log('All starApps IDs:', starApps.map(a => ({id: a.id, type: typeof a.id})));
                      if (value && !editingApp.replacesAppIds.includes(value)) {
                        console.log('Adding app to selection');
                        setEditingApp({
                          ...editingApp,
                          replacesAppIds: [...editingApp.replacesAppIds, value]
                        });
                      } else {
                        console.log('App already selected or no value');
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Ajouter une app à remplacer...</option>
                    
                    {/* Apps du Play Store */}
                    {playStoreApps.length > 0 && (
                      <optgroup label="📊 Classement Play Store">
                        {playStoreApps.map(app => (
                          <option 
                            key={app.id} 
                            value={app.id}
                            disabled={editingApp.replacesAppIds.includes(app.id)}
                          >
                            {app.name} (Note: {app.grade})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    
                    {/* StarApps */}
                    {starApps.length > 0 && (
                      <optgroup label="⭐ StarApps (Sélection)">
                        {starApps.map(app => (
                          <option 
                            key={app.id} 
                            value={app.id}
                            disabled={editingApp.replacesAppIds.includes(app.id)}
                          >
                            {app.name} (Note: {app.grade})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Cette TrustiApp sera proposée en migration pour les apps sélectionnées
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingApp.description}
                    onChange={(e) => setEditingApp({...editingApp, description: e.target.value})}
                    placeholder="Raison du TrustiScore..."
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Lien Play Store */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lien Play Store (optionnel)
                  </label>
                  <input
                    type="url"
                    value={editingApp.playStoreUrl}
                    onChange={(e) => setEditingApp({...editingApp, playStoreUrl: e.target.value})}
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Lien Apple Store */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lien Apple Store (optionnel)
                  </label>
                  <input
                    type="url"
                    value={editingApp.appleStoreUrl}
                    onChange={(e) => setEditingApp({...editingApp, appleStoreUrl: e.target.value})}
                    placeholder="https://apps.apple.com/app/..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Lien F-Droid */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lien F-Droid (optionnel)
                  </label>
                  <input
                    type="url"
                    value={editingApp.fDroidUrl}
                    onChange={(e) => setEditingApp({...editingApp, fDroidUrl: e.target.value})}
                    placeholder="https://f-droid.org/packages/..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Lien Site Web */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lien Site Web (optionnel)
                  </label>
                  <input
                    type="url"
                    value={editingApp.websiteUrl}
                    onChange={(e) => setEditingApp({...editingApp, websiteUrl: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSaveApp}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <Save size={20} />
                          ✓ Enregistrer
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingApp({name: '', logo: '', grade: 'A', category: 'Application', description: '', replacesAppIds: [], playStoreUrl: '', appleStoreUrl: '', fDroidUrl: '', websiteUrl: ''});
                        setIsAdding(false);
                      }}
                      disabled={isSaving}
                      className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liste des applications */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-3">
              Applications ajoutées ({apps.length})
            </h3>
            {apps.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Aucune application ajoutée pour le moment</p>
            ) : (
              apps.map(app => (
                <div key={app.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-300 transition-all">
                  {/* Logo */}
                  <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                    {app.icon.startsWith('http') ? (
                      <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                    ) : (
                      <span>{app.icon}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{app.name}</h4>
                    <p className="text-xs text-slate-500">{app.category}</p>
                  </div>

                  {/* Grade */}
                  <div className={`${app.color} w-10 h-10 rounded-lg flex items-center justify-center font-black text-white shrink-0`}>
                    {app.grade}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditApp(app)}
                      disabled={isSaving}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      disabled={isSaving}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
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
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
            disabled={isSaving}
          >
            <X size={24}/>
          </button>
          <h2 className="text-2xl font-black mb-2">Administration Alternatives</h2>
          <p className="text-sm text-white/80">Gérez les applications recommandées</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {innerContent}
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

export default AdminTrustiAppsModal;
