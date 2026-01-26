import React, { useState, useMemo } from 'react';
import { Trophy, Search, ShieldCheck, ChevronLeft, Globe, Lock, Sparkles, ArrowRight, Zap, CheckCircle2, PlusCircle, CheckCircle, PartyPopper, Trash2, HelpCircle, Info, X } from 'lucide-react';

const TrustiLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    {/* Fond circulaire dégradé */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-90 shadow-lg"></div>
    
    {/* Bouclier central */}
    <div className="relative z-10 flex items-center justify-center h-full w-full">
      {/* Cadenas stylisé */}
      <div className="text-white drop-shadow-lg">
        {/* Corps du cadenas */}
        <svg viewBox="0 0 100 120" className="w-6 h-6 drop-shadow-md" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {/* Arche du cadenas */}
          <path d="M30 50 Q30 30 50 30 Q70 30 70 50" />
          {/* Corps du cadenas */}
          <rect x="25" y="50" width="50" height="45" rx="4" />
          {/* Point de verrou */}
          <circle cx="50" cy="75" r="3" fill="white" />
        </svg>
      </div>
      
      {/* Cœur stylisé au centre (symbole de confiance) */}
      <div className="absolute text-pink-200 text-xs opacity-80 drop-shadow">♥</div>
    </div>
    
    {/* Ornements géométriques pour l'open source */}
    <div className="absolute top-0 right-1 w-1.5 h-1.5 bg-lime-300 rounded-full opacity-80 shadow-sm"></div>
    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-80 shadow-sm"></div>
    <div className="absolute bottom-2 right-2 w-1 h-1 bg-amber-300 rounded-full opacity-70"></div>
  </div>
);

const ScoreIndicator = ({ grade, size = "small" }) => {
  const grades = ['A', 'B', 'C', 'D', 'E'];
  const colors = {
    A: 'bg-[#006837]',
    B: 'bg-[#8dc63f]',
    C: 'bg-[#fbb03b]',
    D: 'bg-[#f7931e]',
    E: 'bg-[#c1272d]'
  };

  if (size === "large") {
    return (
      <div className="flex flex-col items-center">
        <div className={`${colors[grade]} w-24 h-28 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl shadow-slate-200 border-4 border-white`}>
          <span className="text-5xl font-black">{grade}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-slate-100 rounded-full p-0.5 h-8 w-24 relative overflow-hidden">
      {grades.map((g) => (
        <div 
          key={g} 
          className={`flex-1 h-full flex items-center justify-center transition-all duration-300 ${grade === g ? colors[g] + ' text-white scale-110 z-10 rounded-full shadow-md' : 'text-slate-400'}`}
        >
          <span className="text-[10px] font-black">{g}</span>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("top"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set([1, 4, 8, 9]));
  const [migratedApps, setMigratedApps] = useState(new Set([1]));
  const [selectedApp, setSelectedApp] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [appsData] = useState([
    { id: 1, name: "ChatGPT", category: "IA / Productivité", grade: "B", color: "bg-slate-800", icon: "🤖", reason: "Hébergé aux USA mais propose des options de confidentialité avancées.", alternative: "Mistral (Le Chat)", altIcon: "🐈" },
    { id: 2, name: "Temu", category: "E-commerce", grade: "E", color: "bg-orange-600", icon: "🛍️", reason: "Collecte massive de données et opacité totale sur les métadonnées.", alternative: "Leboncoin", altIcon: "🇫🇷" },
    { id: 4, name: "TikTok", category: "Réseaux Sociaux", grade: "E", color: "bg-black", icon: "📱", reason: "Transfert de données vers des juridictions non-équivalentes RGPD.", alternative: "Mastodon", altIcon: "🐘" },
    { id: 5, name: "WhatsApp", category: "Communication", grade: "C", color: "bg-green-500", icon: "💬", reason: "Chiffrement de bout en bout mais partage de métadonnées avec Meta.", alternative: "Signal", altIcon: "🔵" },
    { id: 7, name: "Instagram", category: "Réseaux Sociaux", grade: "D", color: "bg-pink-600", icon: "📸", reason: "Exploitation commerciale des données visuelles pour ciblage publicitaire.", alternative: "Pixelfed", altIcon: "🖼️" },
    { id: 8, name: "Google Chrome", category: "Navigateur", grade: "D", color: "bg-white", icon: "🌐", reason: "Suivi intensif de l'historique et des habitudes par Google.", alternative: "Brave", altIcon: "🦁" },
    { id: 9, name: "OneDrive", category: "Cloud / Stockage", grade: "D", color: "bg-blue-600", icon: "☁️", reason: "Soumis au Cloud Act américain, lecture possible des fichiers.", alternative: "Proton Drive", altIcon: "🧬" },
    { id: 1001, name: "Signal", category: "Communication", grade: "A", color: "bg-blue-600", icon: "💬", reason: "Fondation à but non lucratif, code 100% open-source." },
    { id: 1002, name: "Proton Mail", category: "Communication", grade: "A", color: "bg-purple-700", icon: "📧", reason: "Juridiction Suisse, chiffrement zero-knowledge." },
    { id: 1003, name: "Brave", category: "Navigateur", grade: "A", color: "bg-orange-500", icon: "🦁", reason: "Bloqueur natif de pubs et trackers. Respect strict de la vie privée." },
    { id: 1010, name: "Mistral (Le Chat)", category: "IA / Productivité", grade: "A", color: "bg-orange-200", icon: "🐈", reason: "IA Française performante, alternative directe à OpenAI." }
  ]);

  const filteredApps = useMemo(() => {
    let list = [...appsData];
    if (activeTab === "top") list = list.filter(a => a.id < 1000);
    else if (activeTab === "alt") list = list.filter(a => a.id >= 1000);
    else if (activeTab === "my_apps") list = list.filter(app => myApps.has(app.id));
    return list.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, appsData, myApps, searchTerm]);

  const toggleMyApp = (e, id) => {
    e.stopPropagation();
    setMyApps(prev => {
      const newList = new Set(prev);
      newList.has(id) ? newList.delete(id) : newList.add(id);
      return newList;
    });
  };

  const toggleMigrate = (e, id) => {
    e.stopPropagation();
    setMigratedApps(prev => {
      const newList = new Set(prev);
      newList.has(id) ? newList.delete(id) : newList.add(id);
      return newList;
    });
  };

  if (selectedApp) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
        <header className="px-4 py-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white z-50">
          <button onClick={() => setSelectedApp(null)} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={24} /></button>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Détails</div>
          <button onClick={(e) => toggleMyApp(e, selectedApp.id)} className={`p-2 rounded-full ${myApps.has(selectedApp.id) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-200'}`}>
             {myApps.has(selectedApp.id) ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
          </button>
        </header>

        <main className="max-w-md mx-auto p-6">
          <div className="flex flex-col items-center mb-10">
            <div className={`${selectedApp.color} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mb-6`}>{selectedApp.icon}</div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">{selectedApp.name}</h2>
            <ScoreIndicator grade={selectedApp.grade} size="large" />
          </div>
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 mb-6">
            <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /> Analyse</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedApp.reason}</p>
          </div>
          <button onClick={() => setSelectedApp(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Retour</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrustiLogo className="w-9 h-9" />
            <h1 className="text-md font-black tracking-tight text-slate-900 leading-none">TrustiScore</h1>
          </div>
          
          {/* Bouton d'aide mis en évidence */}
          <div className="relative">
            {!showExplainer && (
              <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-25"></span>
            )}
            <button 
              onClick={() => setShowExplainer(!showExplainer)} 
              className={`relative p-2.5 rounded-full transition-all duration-300 shadow-sm ${showExplainer ? 'bg-indigo-600 text-white scale-90' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              aria-label="Aide et explications"
            >
              <HelpCircle size={22} className={!showExplainer ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher une application..." 
            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Titre discret pour l'onglet Classement */}
        {activeTab === "top" && (
          <div className="mb-6 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Classement France</p>
            <p className="text-[11px] text-slate-400 mt-1">Applications les plus utilisées en France</p>
          </div>
        )}

        {/* Bouton Partager pour Mes Apps */}
        {activeTab === "my_apps" && myApps.size > 0 && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-indigo-900">Partager votre profil</h3>
              <p className="text-xs text-indigo-700 mt-1">{myApps.size} app{myApps.size > 1 ? 's' : ''} ({migratedApps.size} migré{migratedApps.size > 1 ? 's' : ''})</p>
            </div>
            <button 
              onClick={() => setShowShareModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Partager
            </button>
          </div>
        )}

        {/* Modal Partage */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Migrations effectuées</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {migratedApps.size > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-black text-sm uppercase tracking-widest text-emerald-800 mb-4 flex items-center gap-2">
                      <span className="text-lg">✅</span> {migratedApps.size} app{migratedApps.size > 1 ? 's' : ''} migrée{migratedApps.size > 1 ? 's' : ''}
                    </h3>
                    <div className="space-y-3">
                      {Array.from(migratedApps).map(id => {
                        const app = appsData.find(a => a.id === id);
                        const altApp = app?.alternative ? appsData.find(a => a.name === app.alternative) : null;
                        return app ? (
                          <div key={id} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`${app.color} w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white`}>{app.icon}</div>
                              <div className="flex-grow">
                                <p className="font-black text-sm text-slate-900">{app.name}</p>
                                <p className="text-xs text-slate-500">{app.category}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center mb-3">
                              <div className="h-px bg-emerald-200 flex-grow"></div>
                              <span className="text-emerald-600 text-xs font-black px-2">MIGRÉ VERS</span>
                              <div className="h-px bg-emerald-200 flex-grow"></div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className={`${altApp?.color || 'bg-emerald-500'} w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white`}>{altApp?.icon || app.altIcon}</div>
                              <div>
                                <p className="font-black text-sm text-slate-900">{app.alternative}</p>
                                {altApp && <p className="text-xs text-emerald-600">{altApp.category}</p>}
                              </div>
                              {altApp && <ScoreIndicator grade={altApp.grade} />}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {/* Boutons d'Action */}
                    <div className="border-t border-slate-100 mt-6 pt-6 space-y-2">
                      <button 
                        onClick={() => {
                          const migratedList = Array.from(migratedApps).map(id => {
                            const app = appsData.find(a => a.id === id);
                            return `${app?.name} → ${app?.alternative}`;
                          }).filter(Boolean).join('\n• ');
                          const shareText = `✅ Mes migrations TrustiScore:\n\n• ${migratedList}`;
                          
                          if (navigator.share) {
                            navigator.share({
                              title: 'Mes migrations TrustiScore',
                              text: shareText
                            }).catch(err => console.log('Partage annulé'));
                          } else {
                            navigator.clipboard.writeText(shareText).then(() => alert('Copié dans le presse-papiers ✓'));
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🔗</span> Partager
                      </button>
                      <button 
                        onClick={() => {
                          const migratedList = Array.from(migratedApps).map(id => {
                            const app = appsData.find(a => a.id === id);
                            return `${app?.name} → ${app?.alternative}`;
                          }).filter(Boolean).join('\n• ');
                          const shareText = `✅ Mes migrations TrustiScore:\n\n• ${migratedList}`;
                          navigator.clipboard.writeText(shareText).then(() => alert('Copié dans le presse-papiers ✓'));
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📋</span> Copier
                      </button>
                      <button 
                        onClick={() => setShowShareModal(false)}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-bold text-sm transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 font-medium">Aucune migration effectuée</p>
                    <p className="text-xs text-slate-400 mt-2">Marquez les apps comme migrées pour les afficher ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panneau Explicatif TrustiScore */}
        {(showExplainer) && (
          <div className="mb-6 bg-slate-900 text-white p-7 rounded-[2.5rem] relative shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-800">
            <button onClick={() => setShowExplainer(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-1"><X size={20}/></button>
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <ShieldCheck size={20} />
                <h4 className="font-black text-xs uppercase tracking-widest">Le TrustiScore</h4>
              </div>
              <h3 className="text-xl font-black mb-3 text-white leading-tight">Comprendre votre santé numérique</h3>
              <p className="text-[13px] leading-relaxed text-slate-400 font-medium">
                Le TrustiScore est un indice qui évalue la confiance que vous pouvez accorder à vos outils numériques. Il mesure la protection de votre <span className="text-white font-bold text-[12px]">vie privée</span> et le respect de la <span className="text-white font-bold text-[12px]">souveraineté</span> de vos données.
              </p>
            </div>

            <h4 className="font-black text-[10px] uppercase tracking-widest mb-5 text-slate-500 flex items-center gap-2">
              <div className="h-px bg-slate-800 flex-grow"></div>
              Échelle des notes
              <div className="h-px bg-slate-800 flex-grow"></div>
            </h4>
            
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="bg-[#006837] w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-900/20">A</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Souverain & Privé</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5">Hébergé en Europe, open-source, aucun profilage commercial.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#8dc63f] w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm shadow-lg shadow-lime-900/20">B</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Sécurisé</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5">Excellent chiffrement, mais juridiction soumise au Cloud Act US.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#fbb03b] w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm text-slate-900 shadow-lg shadow-amber-900/20">C</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Usage Hybride</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5">Service utile mais collecte de métadonnées pour la publicité.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#f7931e] w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm text-slate-900 shadow-lg shadow-orange-900/20">D</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Risque élevé</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5">Collecte massive et profilage comportemental actif.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#c1272d] w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm shadow-lg shadow-rose-900/20">E</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Critique</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5">Opacité totale, transfert hors RGPD ou failles majeures.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800 text-[10px] italic text-slate-500 text-center">
              Basé sur 12 critères (RGPD, Cloud Act, Open Source, Localisation).
            </div>
          </div>
        )}

        {/* Liste des Apps */}
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all group">
              <div className="flex items-center gap-3">
                <div className={`${app.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner transition-transform group-hover:scale-105`}>{app.icon}</div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-black text-sm truncate">{app.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreIndicator grade={app.grade} />
                  
                  {activeTab === "my_apps" ? (
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 items-center">
                      <button 
                        onClick={(e) => toggleMigrate(e, app.id)} 
                        className={`p-1.5 rounded-lg transition-all ${migratedApps.has(app.id) ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-300 hover:text-emerald-500'}`}
                        title="Marquer comme migré"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => toggleMyApp(e, app.id)} 
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={(e) => toggleMyApp(e, app.id)} className={`p-2 rounded-full transition-all ${myApps.has(app.id) ? 'bg-indigo-100 text-indigo-600' : 'text-slate-200 hover:text-indigo-400'}`}>
                        {myApps.has(app.id) ? <CheckCircle size={20} /> : <PlusCircle size={20} />}
                    </button>
                  )}
                </div>
              </div>
              
              {activeTab === "my_apps" && app.grade !== "A" && app.alternative && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between animate-pulse-subtle">
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-emerald-600" />
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs shadow-sm border border-emerald-100">{app.altIcon}</div>
                       <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Migrer vers : {app.alternative}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">Grade A</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Navigation Basse */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-4 px-6 max-w-md mx-auto flex justify-around z-40 rounded-t-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab("top")} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "top" ? "text-slate-900" : "text-slate-300 hover:text-slate-400"}`}>
          <Trophy size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">Classement</span>
        </button>
        <button onClick={() => setActiveTab("my_apps")} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "my_apps" ? "text-indigo-600" : "text-slate-300 hover:text-indigo-400"}`}>
          <div className="relative">
            <Zap size={24} />
            {myApps.size > 0 && <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{myApps.size}</span>}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Mes Apps</span>
        </button>
        <button onClick={() => setActiveTab("alt")} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "alt" ? "text-emerald-600" : "text-slate-300 hover:text-emerald-400"}`}>
          <Globe size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">App Trusti</span>
        </button>
      </nav>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;