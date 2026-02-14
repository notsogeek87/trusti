import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

const AdminSimpleTableModal = ({ onClose }) => {
  const [apps, setApps] = useState([]);
  const [editedApps, setEditedApps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/custom-trusti-apps`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setApps(data.apps);
      });
  }, []);

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
      await fetch(`${API_URL}/custom-trusti-apps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appToSend)
      });
    }
    setIsSaving(false);
    setEditedApps([]);
    alert('Modifications enregistrées !');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">Console d'administration simple</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-lg">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-slate-100">
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
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button onClick={handleSave} disabled={isSaving || editedApps.length === 0} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50">Enregistrer</button>
          <button onClick={onClose} className="bg-slate-200 px-6 py-2 rounded-lg font-bold">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSimpleTableModal;
