import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Upload } from 'lucide-react';
import { GRADE_INFO } from '../../constants/grades';
import { CATEGORIES } from '../../constants/categories';

// Détection de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

/**
 * Modal d'administration pour gérer les TrustiApps
 */
const AdminTrustiAppsModal = ({ onClose, onSave, isEmbedded = false }) => {
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  // Charger les apps depuis l'API au montage
  useEffect(() => {
    loadApps();
  }, []);



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
          description: ''
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
      
      const response = await fetch(`${API_URL}/custom-trusti-apps?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
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

  const innerContent = (
    <>
      {isLoading ? (
        <LoadingSpinner message="Chargement des Trusti Apps..." size="medium" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Colonne gauche : Formulaire */}
          <div className="space-y-3">
            {/* Explication */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs text-emerald-800 font-medium">
                🌍 Les <strong>Alternatives</strong> sont des alternatives respectueuses de la vie privée. 
                Elles peuvent remplacer des applications du Play Store et apparaissent dans l'onglet "Alternatives".
              </p>
            </div>

            {/* Bouton Ajouter */}
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                disabled={isSaving}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Plus size={18} />
                Ajouter une TrustiApp
              </button>
            )}

            {/* Formulaire d'ajout/édition */}
            {isAdding && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden sticky top-0">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-800">
                    {editingApp.id ? 'Modifier l\'application' : 'Nouvelle application'}
                  </h3>
                </div>
              
              <div className="p-4 max-h-[50vh] overflow-y-auto">
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
                      placeholder="Signal, Proton Mail..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
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
                        setEditingApp({name: '', logo: '', grade: 'A', category: 'Application', description: '', playStoreUrl: '', appleStoreUrl: '', fDroidUrl: '', websiteUrl: ''});
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
          </div>

          {/* Colonne droite : Liste des applications */}
          <div className="space-y-3">
            <div className="sticky top-0 bg-white pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
                <span>Applications ajoutées</span>
                <span className="text-xs font-normal text-slate-500">({apps.length})</span>
              </h3>
            </div>
            
            <div className="space-y-2 max-h-[calc(95vh-280px)] overflow-y-auto pr-2">
            {apps.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-slate-400 font-medium text-sm">Aucune application ajoutée</p>
                <p className="text-xs text-slate-300 mt-1">Cliquez sur "Ajouter une TrustiApp" pour commencer</p>
              </div>
            ) : (
              apps.map(app => (
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
                      onClick={() => handleDeleteApp(app.id)}
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
          <h2 className="text-xl font-black mb-1">Administration Alternatives</h2>
          <p className="text-xs text-white/80">Gérez les applications recommandées • Interface optimisée pour PC</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {innerContent}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 shrink-0">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="text-xs text-slate-500">
              {apps.length} application{apps.length > 1 ? 's' : ''} • Dernière modification : {new Date().toLocaleDateString('fr-FR')}
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

export default AdminTrustiAppsModal;
