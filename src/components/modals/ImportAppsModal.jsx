import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import { API_URL } from '../../utils/apiConfig';

/**
 * Modal d'import : s'affiche quand l'utilisateur ouvre un lien de partage
 * (?apps=... et/ou ?mig=...). Il montre un aperçu de la sélection partagée
 * et propose de l'ajouter à « Mes Apps ».
 */
const ImportAppsModal = ({ appIds = [], migrations = [], isLoggedIn, onConfirm, onClose }) => {
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tous les IDs concernés (sélection + migrations) pour un seul appel API
  const allIds = useMemo(() => {
    const ids = new Set(appIds.map(String));
    migrations.forEach(({ id }) => ids.add(String(id)));
    return Array.from(ids);
  }, [appIds, migrations]);

  useEffect(() => {
    let cancelled = false;

    const loadApps = async () => {
      if (allIds.length === 0) {
        setIsLoading(false);
        return;
      }
      try {
        const url = `${API_URL}/apps?ids=${encodeURIComponent(allIds.join(','))}&_t=${Date.now()}`;
        const response = await fetch(url);
        const data = await response.json();
        const appsArray = data.success ? data.apps : [];
        const normalized = appsArray.map((app) => ({ ...app, id: String(app.id) }));
        if (!cancelled) setApps(normalized);
      } catch (error) {
        console.error("Erreur lors du chargement des apps partagées:", error);
        if (!cancelled) setApps([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadApps();
    return () => {
      cancelled = true;
    };
  }, [allIds]);

  const appsById = useMemo(() => new Map(apps.map((a) => [String(a.id), a])), [apps]);

  const selectedApps = appIds
    .map((id) => appsById.get(String(id)))
    .filter(Boolean);

  const migrationRows = migrations
    .map(({ id, customAlt }) => {
      const app = appsById.get(String(id));
      if (!app) return null;
      return { app, altName: customAlt || app.alternative || 'Alternative recommandée' };
    })
    .filter(Boolean);

  const totalCount = selectedApps.length + migrationRows.length;

  const renderIcon = (app) => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
      {app?.icon && app.icon.startsWith('http') ? (
        <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
      ) : (
        <div className={`${app?.color || 'bg-slate-400'} w-full h-full flex items-center justify-center text-lg text-white`}>
          {app?.icon || '📱'}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Sélection partagée</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 font-medium">Chargement…</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 font-medium">Aucune app à importer</p>
              <p className="text-xs text-slate-400 mt-2">Le lien est peut-être incomplet ou expiré.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                Quelqu'un a partagé <span className="font-black text-slate-900">{totalCount}</span>{' '}
                élément{totalCount > 1 ? 's' : ''} avec toi. Ajoute-les à ta liste en un clic.
              </p>

              {/* Apps sélectionnées */}
              {selectedApps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                    <span className="text-lg">⭐</span> {selectedApps.length} app{selectedApps.length > 1 ? 's' : ''}
                  </h3>
                  {selectedApps.map((app) => (
                    <div key={app.id} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        {renderIcon(app)}
                        <div className="flex-grow">
                          <p className="font-black text-sm text-slate-900">{app.name}</p>
                          <p className="text-xs text-slate-500">{app.category}</p>
                        </div>
                        <ScoreIndicator grade={app.grade} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Migrations */}
              {migrationRows.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-widest text-indigo-800 flex items-center gap-2">
                    <span className="text-lg">✅</span> {migrationRows.length} migration{migrationRows.length > 1 ? 's' : ''}
                  </h3>
                  {migrationRows.map(({ app, altName }) => (
                    <div key={`mig-${app.id}`} className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <div className="flex items-center gap-3">
                        {renderIcon(app)}
                        <div className="flex-grow">
                          <p className="font-black text-sm text-slate-900">{app.name}</p>
                          <p className="text-xs text-indigo-600">→ {altName}</p>
                        </div>
                        <ScoreIndicator grade={app.grade} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="border-t border-slate-100 pt-6 space-y-2">
                <button
                  onClick={() => onConfirm({ appIds: selectedApps.map((a) => a.id), migrations })}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>➕</span> Ajouter à Mes Apps
                </button>
                {!isLoggedIn && (
                  <p className="text-xs text-center text-slate-400 px-2">
                    Tu devras te connecter pour conserver cette sélection sur ton compte.
                  </p>
                )}
                <button
                  onClick={onClose}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Ignorer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportAppsModal;
