import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Search, X, Loader2,
  Plus, Pencil, Trash2, Check,
} from 'lucide-react';
import { CATEGORIES, ADMIN_CATEGORIES } from '../../constants/categories';
import { useToast } from '../../contexts/ToastContext';
import { API_URL } from '../../utils/apiConfig';
import { adminFetch } from '../../utils/adminAuth';

// ─── Grade display helpers ───────────────────────────────────────────────────

const GRADE_BADGE = {
  A: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  B: 'bg-lime-100    text-lime-800    border border-lime-200',
  C: 'bg-amber-100   text-amber-800   border border-amber-200',
  D: 'bg-orange-100  text-orange-800  border border-orange-200',
  E: 'bg-red-100     text-red-800     border border-red-200',
};

const GRADE_PILL_ACTIVE = {
  A: 'bg-[#006837] text-white',
  B: 'bg-[#8dc63f] text-white',
  C: 'bg-[#fbb03b] text-slate-900',
  D: 'bg-[#f7931e] text-white',
  E: 'bg-[#c1272d] text-white',
};

const GRADE_LABELS = {
  A: 'Souverain & Privé',
  B: 'Sécurisé',
  C: 'Usage Hybride',
  D: 'Risque élevé',
  E: 'Critique',
};

// ─── Empty app template ──────────────────────────────────────────────────────

const EMPTY_APP = {
  name: '', category: '', grade: 'C',
  reason: '', description: '',
  developer: '', license: '',
  is_open_source: false, is_european: false, jurisdiction: '',
  app_type: 'regular',
  playStoreUrl: '', appleStoreUrl: '', fDroidUrl: '', githubUrl: '', website: '',
  show_in_awards: 0, show_in_onboarding: 1, popularity: 0,
  icon: '', color: 'bg-slate-500',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toBool = (v) => v === true || v === 1 || v === '1' || v === 't' || v === 'true';

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
  >
    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
);

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1.5">{title}</p>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white placeholder:text-slate-300';
const monoInputCls = `${inputCls} font-mono text-xs`;

const COLOR_SWATCHES = [
  'bg-slate-500', 'bg-indigo-500', 'bg-blue-500', 'bg-sky-500',
  'bg-emerald-500', 'bg-teal-500', 'bg-rose-500', 'bg-pink-500',
  'bg-amber-500', 'bg-orange-500', 'bg-purple-500', 'bg-cyan-500',
];

function AppIcon({ icon, name, color, size = 'md' }) {
  const dim = size === 'sm'
    ? 'w-7 h-7 rounded-lg text-sm'
    : 'w-10 h-10 rounded-xl text-xl';
  const isUrl = icon && (icon.startsWith('http') || icon.startsWith('/'));
  return (
    <div className={`${dim} flex items-center justify-center flex-shrink-0 overflow-hidden ${color || 'bg-slate-500'}`}>
      {isUrl
        ? <img src={icon} alt={name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
        : icon
        ? <span>{icon}</span>
        : <span className="text-white text-xs font-bold">{name?.[0]?.toUpperCase() || '?'}</span>
      }
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const AdminSimpleTableModal = ({ onClose }) => {
  const toast = useToast();

  // Table state
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const itemsPerPage = 50;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('edit');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const drawerScrollRef = useRef(null);

  // ─── Load apps ────────────────────────────────────────────────────────────

  const loadApps = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const url = search.trim()
        ? `${API_URL}/apps?search=${encodeURIComponent(search)}`
        : `${API_URL}/apps?limit=${itemsPerPage}&page=${page}`;
      setIsSearching(!!search.trim());
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
        setTotalApps(data.pagination?.total ?? data.apps.length);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setCurrentPage(page);
      }
    } catch {
      toast.error('Erreur de chargement des applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadApps(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => loadApps(1, searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) { setShowDeleteConfirm(false); return; }
        if (drawerOpen) { closeDrawer(); return; }
        onClose();
      }
      if (!drawerOpen) {
        const active = document.activeElement?.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(active)) return;
        if (e.key === 'ArrowLeft' && !isSearching && currentPage > 1 && !isLoading) {
          e.preventDefault(); loadApps(currentPage - 1, searchTerm);
        }
        if (e.key === 'ArrowRight' && !isSearching && currentPage < totalPages && !isLoading) {
          e.preventDefault(); loadApps(currentPage + 1, searchTerm);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen, showDeleteConfirm, isSearching, currentPage, totalPages, isLoading, onClose, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Drawer helpers ───────────────────────────────────────────────────────

  const openEdit = (app, startWithDelete = false) => {
    setSelectedApp({
      ...app,
      is_open_source: toBool(app.is_open_source ?? app.isOpenSource),
      is_european: toBool(app.is_european ?? app.isEuropean),
      show_in_awards: toBool(app.show_in_awards ?? app.showInAwards) ? 1 : 0,
      show_in_onboarding: app.show_in_onboarding !== undefined
        ? (toBool(app.show_in_onboarding ?? app.showInOnboarding) ? 1 : 0)
        : 1,
      app_type: app.app_type || app.appType || 'regular',
    });
    setDrawerMode('edit');
    setShowDeleteConfirm(startWithDelete);
    setDrawerOpen(true);
    drawerScrollRef.current?.scrollTo(0, 0);
  };

  const openAdd = () => {
    setSelectedApp({ ...EMPTY_APP });
    setDrawerMode('add');
    setShowDeleteConfirm(false);
    setDrawerOpen(true);
    drawerScrollRef.current?.scrollTo(0, 0);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setShowDeleteConfirm(false);
    setTimeout(() => setSelectedApp(null), 300);
  };

  const updateField = (field, value) =>
    setSelectedApp(prev => ({ ...prev, [field]: value }));

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedApp?.name?.trim()) { toast.error('Le nom est obligatoire'); return; }
    if (!selectedApp?.category)     { toast.error('La catégorie est obligatoire'); return; }

    setIsSaving(true);
    try {
      const payload = {
        ...selectedApp,
        show_in_awards: selectedApp.show_in_awards ? 1 : 0,
        showInAwards:   selectedApp.show_in_awards ? 1 : 0,
        show_in_onboarding: selectedApp.show_in_onboarding ? 1 : 0,
        showInOnboarding:   selectedApp.show_in_onboarding ? 1 : 0,
      };

      const res = drawerMode === 'add'
        ? await adminFetch(`${API_URL}/apps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await adminFetch(`${API_URL}/apps?id=${selectedApp.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        if (drawerMode === 'add') {
          toast.success(`« ${selectedApp.name} » ajoutée avec succès`);
          await loadApps(currentPage, searchTerm);
        } else {
          setApps(prev => prev.map(a => a.id === selectedApp.id ? { ...a, ...selectedApp } : a));
          toast.success(`« ${selectedApp.name} » mise à jour`);
        }
        closeDrawer();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Erreur lors de l\'enregistrement');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedApp?.id) return;
    setIsDeleting(true);
    try {
      const res = await adminFetch(`${API_URL}/apps?id=${selectedApp.id}`, { method: 'DELETE' });
      if (res.ok) {
        setApps(prev => prev.filter(a => a.id !== selectedApp.id));
        setTotalApps(prev => prev - 1);
        toast.success(`« ${selectedApp.name} » supprimée`);
        closeDrawer();
      } else {
        toast.error('Erreur lors de la suppression');
        setShowDeleteConfirm(false);
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Filtered view ────────────────────────────────────────────────────────

  const filteredApps = apps.filter(app => {
    if (filterGrade && app.grade !== filterGrade) return false;
    if (filterCategory && app.category !== filterCategory) return false;
    return true;
  });

  const filtersActive = filterGrade || filterCategory;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full h-[92dvh] sm:h-[96vh] flex flex-col relative overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base font-bold truncate">Administration</h2>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0">
              {isSearching
                ? `${filteredApps.length} rés.`
                : `${totalApps} apps`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Plus size={14} /> Ajouter
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="px-4 py-2 border-b bg-slate-50 flex flex-col gap-2 flex-shrink-0">
          {/* Ligne 1 : recherche + pagination */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              )}
            </div>
            {!isSearching && (
              <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1 flex-shrink-0">
                <button
                  onClick={() => loadApps(currentPage - 1, searchTerm)}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap px-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => loadApps(currentPage + 1, searchTerm)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Ligne 2 : filtres grade + catégorie + reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterGrade('')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${!filterGrade ? 'bg-slate-700 text-white' : 'bg-white border text-slate-500 hover:bg-slate-100'}`}
              >
                Tous
              </button>
              {['A', 'B', 'C', 'D', 'E'].map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGrade(g === filterGrade ? '' : g)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${filterGrade === g ? GRADE_PILL_ACTIVE[g] : `${GRADE_BADGE[g]} hover:opacity-80`}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 py-1.5 pl-2 pr-6 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-600"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {filtersActive && (
              <button
                onClick={() => { setFilterGrade(''); setFilterCategory(''); }}
                className="text-xs text-slate-400 hover:text-rose-500 underline transition-colors flex-shrink-0"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 select-none">
              <span className="text-4xl">🔍</span>
              <p className="text-sm">Aucune application trouvée</p>
              {filtersActive && (
                <button onClick={() => { setFilterGrade(''); setFilterCategory(''); }} className="text-xs text-indigo-500 underline">
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Application</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-20">Grade</th>
                  <th className="hidden sm:table-cell px-3 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Catégorie</th>
                  <th className="hidden sm:table-cell px-3 py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-24">Liens</th>
                  <th className="px-3 py-2.5 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map(app => (
                  <tr
                    key={app.id}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    onClick={() => openEdit(app)}
                  >
                    {/* Icon + Name */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <AppIcon icon={app.icon} name={app.name} color={app.color} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{app.name}</p>
                          {app.developer && (
                            <p className="text-xs text-slate-400 leading-tight truncate">{app.developer}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Grade badge */}
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${GRADE_BADGE[app.grade] || 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {app.grade || '—'}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="hidden sm:table-cell px-3 py-2.5">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {app.category || '—'}
                      </span>
                    </td>
                    {/* Links dots */}
                    <td className="hidden sm:table-cell px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {app.playStoreUrl  && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Play Store" />}
                        {app.appleStoreUrl && <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" title="App Store" />}
                        {app.fDroidUrl     && <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" title="F-Droid" />}
                        {app.githubUrl     && <span className="w-2 h-2 rounded-full bg-slate-800 flex-shrink-0" title="GitHub" />}
                        {app.website       && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"  title="Site Web" />}
                      </div>
                    </td>
                    {/* Actions — toujours visibles sur mobile, hover sur desktop */}
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(app)}
                          className="p-2 sm:p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(app, true)}
                          className="p-2 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t bg-slate-50 flex-shrink-0 text-xs text-slate-400">
          <span>
            {filtersActive
              ? `${filteredApps.length} / ${apps.length} apps (filtres actifs)`
              : `${apps.length} apps affichées · ${totalApps} total`}
          </span>
          <span className="hidden sm:block">
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">Échap</kbd> Fermer
            {' · '}
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">← →</kbd> Pages
          </span>
        </div>

        {/* ── Drawer backdrop ── */}
        <div
          className={`absolute inset-0 bg-black/20 z-10 rounded-2xl transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeDrawer}
        />

        {/* ── Drawer panel ── */}
        <div
          className={`absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-20 flex flex-col transition-transform duration-300 ease-out sm:rounded-r-2xl ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 bg-white">
            {selectedApp && (
              <AppIcon icon={selectedApp.icon} name={selectedApp.name} color={selectedApp.color} size="md" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {drawerMode === 'add' ? 'Nouvelle application' : (selectedApp?.name || '…')}
              </h3>
              <p className="text-xs text-slate-400">
                {drawerMode === 'add' ? 'Créer une nouvelle entrée' : `ID : ${selectedApp?.id ?? '…'}`}
              </p>
            </div>
            <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Drawer scrollable content */}
          <div ref={drawerScrollRef} className="flex-1 overflow-y-auto p-5 space-y-7">
            {selectedApp && (
              <>
                {/* ─ Identité ─ */}
                <Section title="Identité">
                  <Field label="Nom" required>
                    <input
                      value={selectedApp.name}
                      onChange={e => updateField('name', e.target.value)}
                      className={inputCls}
                      placeholder="Ex : Signal, ProtonMail…"
                      autoFocus
                    />
                  </Field>
                  <Field label="Catégorie" required>
                    <select
                      value={selectedApp.category}
                      onChange={e => updateField('category', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Sélectionner…</option>
                      {selectedApp.category && !ADMIN_CATEGORIES.includes(selectedApp.category) && (
                        <option value={selectedApp.category}>{selectedApp.category} (existante)</option>
                      )}
                      {ADMIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Grade TrustiScore">
                    <div className="flex gap-2 mb-1">
                      {['A', 'B', 'C', 'D', 'E'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateField('grade', g)}
                          title={GRADE_LABELS[g]}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selectedApp.grade === g ? GRADE_PILL_ACTIVE[g] : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {selectedApp.grade && (
                      <p className="text-xs text-slate-400">{GRADE_LABELS[selectedApp.grade]}</p>
                    )}
                  </Field>
                </Section>

                {/* ─ Description ─ */}
                <Section title="Description">
                  <Field label="Raison du score">
                    <textarea
                      value={selectedApp.reason || ''}
                      onChange={e => updateField('reason', e.target.value)}
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="Pourquoi ce score ? Points forts/faibles…"
                    />
                  </Field>
                  <Field label="Description longue">
                    <textarea
                      value={selectedApp.description || ''}
                      onChange={e => updateField('description', e.target.value)}
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="Description complète de l'application…"
                    />
                  </Field>
                </Section>

                {/* ─ Détails ─ */}
                <Section title="Détails">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Développeur">
                      <input
                        value={selectedApp.developer || ''}
                        onChange={e => updateField('developer', e.target.value)}
                        className={inputCls}
                        placeholder="Ex : Signal Foundation"
                      />
                    </Field>
                    <Field label="Licence">
                      <input
                        value={selectedApp.license || ''}
                        onChange={e => updateField('license', e.target.value)}
                        className={inputCls}
                        placeholder="Ex : GPL-3.0"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Type">
                      <select
                        value={selectedApp.app_type || 'regular'}
                        onChange={e => updateField('app_type', e.target.value)}
                        className={inputCls}
                      >
                        <option value="regular">Régulière</option>
                        <option value="trusti">Trusti App</option>
                        <option value="star">Star App</option>
                      </select>
                    </Field>
                    <Field label="Juridiction">
                      <input
                        value={selectedApp.jurisdiction || ''}
                        onChange={e => updateField('jurisdiction', e.target.value)}
                        className={inputCls}
                        placeholder="Ex : EU, US…"
                      />
                    </Field>
                  </div>
                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <Toggle
                        checked={toBool(selectedApp.is_open_source)}
                        onChange={v => updateField('is_open_source', v)}
                      />
                      <span className="text-sm text-slate-600">Open source</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <Toggle
                        checked={toBool(selectedApp.is_european)}
                        onChange={v => updateField('is_european', v)}
                      />
                      <span className="text-sm text-slate-600">Européen</span>
                    </label>
                  </div>
                </Section>

                {/* ─ Liens ─ */}
                <Section title="Liens">
                  {[
                    { key: 'playStoreUrl',  label: 'Play Store',  placeholder: 'https://play.google.com/store/apps/details?id=…' },
                    { key: 'appleStoreUrl', label: 'App Store',   placeholder: 'https://apps.apple.com/…' },
                    { key: 'fDroidUrl',     label: 'F-Droid',     placeholder: 'https://f-droid.org/packages/…' },
                    { key: 'githubUrl',     label: 'GitHub',      placeholder: 'https://github.com/…' },
                    { key: 'website',       label: 'Site Web',    placeholder: 'https://…' },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label}>
                      <input
                        type="url"
                        value={selectedApp[key] || ''}
                        onChange={e => updateField(key, e.target.value)}
                        className={monoInputCls}
                        placeholder={placeholder}
                      />
                    </Field>
                  ))}
                </Section>

                {/* ─ Options ─ */}
                <Section title="Options">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Afficher dans l'onboarding</p>
                      <p className="text-xs text-slate-400">Proposée lors de la configuration initiale</p>
                    </div>
                    <Toggle
                      checked={toBool(selectedApp.show_in_onboarding)}
                      onChange={v => updateField('show_in_onboarding', v ? 1 : 0)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Afficher dans les Awards</p>
                      <p className="text-xs text-slate-400">Apparaît dans « Nos recommandations »</p>
                    </div>
                    <Toggle
                      checked={toBool(selectedApp.show_in_awards)}
                      onChange={v => updateField('show_in_awards', v ? 1 : 0)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Popularité (rang)">
                      <input
                        type="number"
                        min="0"
                        value={selectedApp.popularity ?? 0}
                        onChange={e => updateField('popularity', Number(e.target.value) || 0)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Icône (URL ou emoji)">
                      <div className="flex gap-2 items-center">
                        <input
                          value={selectedApp.icon || ''}
                          onChange={e => updateField('icon', e.target.value)}
                          className={`${inputCls} flex-1`}
                          placeholder="https://… ou 📱"
                        />
                        {selectedApp.icon && (
                          <AppIcon icon={selectedApp.icon} name={selectedApp.name} color={selectedApp.color} size="sm" />
                        )}
                      </div>
                    </Field>
                  </div>
                  <Field label="Couleur de fond">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {COLOR_SWATCHES.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('color', c)}
                          className={`w-6 h-6 rounded-md ${c} transition-all hover:scale-110 ${selectedApp.color === c ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110' : ''}`}
                          title={c}
                        />
                      ))}
                    </div>
                    <input
                      value={selectedApp.color || ''}
                      onChange={e => updateField('color', e.target.value)}
                      className={inputCls}
                      placeholder="bg-slate-500"
                    />
                  </Field>
                </Section>

                {/* ─ Zone dangereuse (edit only) ─ */}
                {drawerMode === 'edit' && (
                  <Section title="Zone dangereuse">
                    {showDeleteConfirm ? (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                        <p className="text-sm font-bold text-rose-700">
                          Supprimer « {selectedApp.name} » ?
                        </p>
                        <p className="text-xs text-rose-500">Cette action est irréversible.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {isDeleting
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />}
                            Supprimer définitivement
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-600 font-semibold transition-colors"
                      >
                        <Trash2 size={14} />
                        Supprimer cette application
                      </button>
                    )}
                  </Section>
                )}
              </>
            )}
          </div>

          {/* Drawer footer */}
          <div className="flex items-center gap-3 px-5 py-4 border-t bg-white flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedApp?.name?.trim() || !selectedApp?.category}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving
                ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
                : drawerMode === 'add'
                ? <><Plus size={15} /> Créer l'application</>
                : <><Check size={15} /> Enregistrer</>}
            </button>
            <button
              onClick={closeDrawer}
              disabled={isSaving}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-all disabled:opacity-40"
            >
              Annuler
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSimpleTableModal;
