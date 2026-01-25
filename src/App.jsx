import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Search, ShieldCheck, ChevronLeft, Globe, Lock, Info, Sparkles, ShieldQuestion, ArrowRight, Zap, CheckCircle2, Unlock, ShieldAlert, Eye, Code, Database, ListChecks, Download, Share2, Rocket, RefreshCw, TrendingUp, TrendingDown, Settings2, Trash2, HelpCircle, ArrowUpRight, PlusCircle, CheckCircle } from 'lucide-react';

// Composant Logo
const TrustiLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 flex items-center justify-center">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="absolute text-[8px]" 
          style={{ transform: `rotate(${i * 30}deg) translateY(-14px)` }}
        >
          ⭐
        </div>
      ))}
    </div>
    <div className="relative z-10 w-6 h-7 bg-blue-500 rounded-b-lg flex items-center justify-center shadow-sm" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' }}>
      <div className="w-3 h-1.5 border-b-2 border-white rounded-full mt-1 opacity-80" />
    </div>
  </div>
);

// Composant pour l'indicateur de score
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
          {['A', 'B'].includes(grade) ? <Lock size={20} className="mt-1" /> : grade === 'E' ? <Unlock size={20} className="mt-1" /> : <Lock size={20} className="mt-1 opacity-50" />}
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
  const [myApps, setMyApps] = useState(new Set([1, 4, 8, 9])); // Par défaut quelques apps GAFAM
  const [showLegend, setShowLegend] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [showMigrationGuide, setShowMigrationGuide] = useState(true);

  // Simulation de base de données dynamique avec ajouts JustGeek
  const [appsData, setAppsData] = useState([
    // TOP APPS (GAFAM/Standards)
    { id: 1, name: "ChatGPT", category: "IA / Productivité", grade: "B", color: "bg-slate-800", icon: "🤖", downloads: 500000000, trend: "up", reason: "Hébergé aux USA mais propose des options de confidentialité avancées.", details: { infra: "Hybride UE/USA", code: "Propriétaire", data: "Usage IA régulé" } },
    { id: 2, name: "Temu", category: "E-commerce", grade: "E", color: "bg-orange-600", icon: "🛍️", downloads: 750000000, trend: "up", reason: "Collecte massive de données et opacité totale sur les métadonnées.", details: { infra: "Hors UE", code: "Fermé", data: "Collecte aggressive" } },
    { id: 4, name: "TikTok", category: "Réseaux Sociaux", grade: "E", color: "bg-black", icon: "📱", downloads: 2000000000, trend: "down", reason: "Transfert de données vers des juridictions non-équivalentes RGPD.", details: { infra: "Hors UE", code: "Fermé", data: "Profilage massif" } },
    { id: 5, name: "WhatsApp", category: "Communication", grade: "C", color: "bg-green-500", icon: "💬", downloads: 5000000000, trend: "stable", reason: "Chiffrement de bout en bout mais partage de métadonnées avec Meta.", details: { infra: "Hybride", code: "Mixte", data: "Métadonnées collectées" } },
    { id: 7, name: "Instagram", category: "Réseaux Sociaux", grade: "D", color: "bg-pink-600", icon: "📸", downloads: 1500000000, trend: "stable", reason: "Exploitation commerciale des données visuelles pour ciblage publicitaire.", details: { infra: "USA", code: "Fermé", data: "Publicité ciblée" } },
    { id: 8, name: "Google Chrome", category: "Navigateur", grade: "D", color: "bg-white", icon: "🌐", downloads: 4000000000, trend: "stable", reason: "Suivi intensif de l'historique et des habitudes par Google.", details: { infra: "USA", code: "Moteur libre / Enveloppe fermée", data: "Tracking" } },
    { id: 9, name: "OneDrive", category: "Cloud / Stockage", grade: "D", color: "bg-blue-600", icon: "☁️", downloads: 1000000000, trend: "stable", reason: "Soumis au Cloud Act américain, lecture possible des fichiers.", details: { infra: "USA", code: "Propriétaire", data: "Analyse Cloud" } },
    
    // ALTERNATIVES SOUVERAINES (Inspirées de JustGeek & autres)
    { id: 1001, name: "Signal", category: "Communication", grade: "A", color: "bg-blue-600", icon: "💬", downloads: 100000000, trend: "up", reason: "Fondation à but non lucratif, code 100% open-source.", details: { infra: "Distribué", code: "Open Source", data: "Zéro métadonnées" } },
    { id: 1002, name: "Proton Mail", category: "Communication", grade: "A", color: "bg-purple-700", icon: "📧", downloads: 50000000, trend: "up", reason: "Juridiction Suisse, chiffrement zero-knowledge.", details: { infra: "Suisse", code: "Open Source", data: "Chiffré" } },
    { id: 1003, name: "Brave", category: "Navigateur", grade: "A", color: "bg-orange-500", icon: "🦁", downloads: 60000000, trend: "up", reason: "Bloqueur natif de pubs et trackers. Respect strict de la vie privée.", details: { infra: "Local", code: "Open Source", data: "Anonymisé" } },
    { id: 1004, name: "Qwant", category: "Moteur de recherche", grade: "A", color: "bg-blue-400", icon: "🔍", downloads: 10000000, trend: "up", reason: "Moteur français qui ne trace pas ses utilisateurs et respecte l'anonymat.", details: { infra: "France/UE", code: "Propriétaire/Audité", data: "Zéro Tracking" } },
    { id: 1005, name: "DuckDuckGo", category: "Moteur de recherche", grade: "A", color: "bg-orange-400", icon: "🦆", downloads: 100000000, trend: "up", reason: "Ne stocke aucune information personnelle. Pas de bulles de filtrage.", details: { infra: "USA (Indépendant)", code: "Mixte", data: "Privé" } },
    { id: 1006, name: "pCloud", category: "Cloud / Stockage", grade: "A", color: "bg-blue-500", icon: "💾", downloads: 20000000, trend: "up", reason: "Sécurisé, basé en Suisse. Option Crypto Pass pour chiffrement côté client.", details: { infra: "Suisse/UE", code: "Propriétaire", data: "Chiffrement client" } },
    { id: 1007, name: "Infomaniak kDrive", category: "Cloud / Stockage", grade: "A", color: "bg-blue-800", icon: "🏔️", downloads: 5000000, trend: "up", reason: "Hébergement 100% suisse, écologique et indépendant des géants du Web.", details: { infra: "Suisse", code: "Audit régulier", data: "Respect RGPD+" } },
    { id: 1008, name: "OnlyOffice", category: "Productivité", grade: "A", color: "bg-orange-600", icon: "📑", downloads: 10000000, trend: "up", reason: "Alternative complète à MS Office. Open source et compatible formats standard.", details: { infra: "UE", code: "Open Source", data: "Souple/Privé" } },
    { id: 1009, name: "Bitwarden", category: "Sécurité", grade: "A", color: "bg-indigo-500", icon: "🔑", downloads: 15000000, trend: "up", reason: "Gestionnaire de mots de passe open source hautement sécurisé.", details: { infra: "Cloud/Auto-hébergé", code: "Open Source", data: "Zero Knowledge" } },
    { id: 1010, name: "Mistral (Le Chat)", category: "IA / Productivité", grade: "A", color: "bg-orange-200", icon: "🐈", downloads: 2000000, trend: "up", reason: "IA Française performante, alternative directe à OpenAI.", details: { infra: "France", code: "Ouvert/Audité", data: "Confidentialité UE" } }
  ]);

  const scoreData = {
    A: { color: "bg-[#006837]", label: "Gold Standard", desc: "100% européenne ou juridiction sûre, open-source, aucune collecte.", criteria: "• Serveurs UE/Suisse\n• Code ouvert\n• Chiffrement total" },
    B: { color: "bg-[#8dc63f]", label: "Fiable", desc: "Européenne, open-source, collecte limitée.", criteria: "• Majorité UE\n• Code audité\n• Collecte technique" },
    C: { color: "bg-[#fbb03b]", label: "Modéré", desc: "Mixte UE, code partiellement ouvert.", criteria: "• Hybride\n• Code propriétaire\n• Collecte fonctionnelle" },
    D: { color: "bg-[#f7931e]", label: "Risqué", desc: "Hors UE, code fermé, collecte importante.", criteria: "• Hors UE\n• Code opaque\n• Profilage publicitaire" },
    E: { color: "bg-[#c1272d]", label: "Alerte", desc: "Hors UE, source fermée, collecte opaque.", criteria: "• Juridiction inconnue\n• Aucun audit\n• Exploitation massive" }
  };

  const formatDownloads = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    return num.toLocaleString();
  };

  const syncWithRepository = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setAppsData(prev => prev.map(app => ({
        ...app,
        downloads: app.downloads + Math.floor(Math.random() * 500000),
        trend: Math.random() > 0.4 ? "up" : "down"
      })));
      setLastSync(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, 1200);
  };

  const filteredApps = useMemo(() => {
    let list = [...appsData];
    list.sort((a, b) => b.downloads - a.downloads);

    if (activeTab === "top") list = list.filter(a => a.id < 1000);
    else if (activeTab === "alt") list = list.filter(a => a.id >= 1000);
    else if (activeTab === "my_apps") list = list.filter(app => myApps.has(app.id));

    return list.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, appsData, myApps, searchTerm]);

  const toggleMyApp = (e, id) => {
    e.stopPropagation();
    setMyApps(prev => {
      const newList = new Set(prev);
      if (newList.has(id)) newList.delete(id);
      else newList.add(id);
      return newList;
    });
  };

  const getIdealAlternative = (category) => {
    return appsData.find(app => app.category === category && app.grade === 'A');
  };

  const suggestedAlternative = useMemo(() => {
    if (!selectedApp || selectedApp.grade === 'A') return null;
    return getIdealAlternative(selectedApp.category);
  }, [selectedApp, appsData]);

  useEffect(() => {
    if (activeTab === "my_apps") setShowMigrationGuide(true);
  }, [activeTab]);

  if (selectedApp) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 animate-in fade-in duration-300 pb-20">
        <header className="px-4 py-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white z-50">
          <button onClick={() => setSelectedApp(null)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={24} /></button>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Fiche Application</div>
          <button onClick={(e) => toggleMyApp(e, selectedApp.id)} className={`p-2 rounded-full transition-all ${myApps.has(selectedApp.id) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-200 hover:text-indigo-400'}`}>
             {myApps.has(selectedApp.id) ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
          </button>
        </header>

        <main className="max-w-md mx-auto p-6">
          <div className="flex flex-col items-center mb-10">
            <div className={`${selectedApp.color} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mb-6`}>{selectedApp.icon}</div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">{selectedApp.name}</h2>
            <div className="flex items-center gap-2 mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedApp.category}</p>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <p className="text-xs font-black text-indigo-600">{formatDownloads(selectedApp.downloads)} dl.</p>
            </div>
            <ScoreIndicator grade={selectedApp.grade} size="large" />
          </div>

          <div className="space-y-6">
            {suggestedAlternative && (
              <section className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 ring-4 ring-emerald-500/5">
                <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-tight text-emerald-800 mb-4">
                  <Sparkles size={18} className="text-emerald-600" /> Alternative recommandée :
                </h3>
                <div 
                  onClick={() => setSelectedApp(suggestedAlternative)}
                  className="bg-white rounded-2xl border border-emerald-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className={`${suggestedAlternative.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white`}>
                    {suggestedAlternative.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-black text-sm truncate">{suggestedAlternative.name}</h3>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Souveraineté (Grade A)</p>
                  </div>
                  <div className="bg-[#006837] text-white px-3 py-1 rounded-lg font-black text-xs uppercase">Voir</div>
                </div>
              </section>
            )}

            <section className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-tight text-slate-800 mb-4">
                <ShieldCheck size={18} className="text-indigo-600" /> Analyse Trusti
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedApp.reason}</p>
            </section>
          </div>

          <button onClick={() => setSelectedApp(null)} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Retour</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* MODAL LÉGENDE */}
      {showLegend && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end justify-center p-4" onClick={() => setShowLegend(false)}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Le Référentiel</h3>
              <button onClick={() => setShowLegend(false)} className="bg-slate-100 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider">Fermer</button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {Object.entries(scoreData).map(([grade, data]) => (
                <div key={grade} className="flex gap-4 p-4 rounded-3xl border border-slate-100 bg-slate-50">
                  <div className={`${data.color} w-12 h-14 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-white shadow-sm text-xl`}>{grade}</div>
                  <div className="flex-grow">
                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">{data.label}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">{data.desc}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold italic whitespace-pre-line">{data.criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrustiLogo className="w-9 h-9" />
              <div>
                <h1 className="text-md font-black tracking-tight text-slate-900 leading-none">TrustiScore</h1>
                <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">Live Repository</span>
              </div>
            </div>
            <button 
              onClick={syncWithRepository} 
              disabled={isSyncing}
              className={`flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full transition-all ${isSyncing ? 'opacity-50' : 'active:scale-95'}`}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span className="text-[10px] font-black uppercase tracking-wider">{isSyncing ? 'Sync...' : 'Sync Data'}</span>
            </button>
          </div>
          
          <button 
            onClick={() => setShowLegend(true)} 
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all group"
          >
            <ShieldQuestion size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">Comment lire les scores ?</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {activeTab === "my_apps" ? (
          <div className="animate-in fade-in duration-500">
            {showMigrationGuide ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="bg-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">Méthodologie</span>
                    <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight italic">Audit de Migration</h2>
                    <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed">
                      La souveraineté numérique n'est pas une contrainte, c'est une liberté. Suivez notre protocole pour assainir votre smartphone.
                    </p>
                  </div>
                  <Zap className="absolute -right-4 -bottom-4 text-white/10 w-40 h-40" />
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                  <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 mb-8">
                    <Settings2 size={16} /> Protocole de Migration
                  </h3>
                  
                  <div className="space-y-8 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100" />
                    {[
                      { step: "01", title: "L'Audit de Risque", desc: "Listez vos applications actuelles. Repérez celles qui ont un Grade D ou E (souvent les GAFAM).", icon: <Search size={16}/>, color: "bg-rose-100 text-rose-600" },
                      { step: "02", title: "Le Choix Souverain", desc: "Consultez l'onglet 'Alternatives'. Pour chaque app E, il existe souvent un Grade A (ex: Wero pour PayPal, Signal pour WhatsApp).", icon: <Sparkles size={16}/>, color: "bg-amber-100 text-amber-600" },
                      { step: "03", title: "La Migration", desc: "Transférez vos données, prévenez vos proches, et osez la désinstallation définitive.", icon: <ArrowUpRight size={16}/>, color: "bg-emerald-100 text-emerald-600" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-5 relative z-10">
                        <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center font-black text-[11px] border-2 border-white shadow-sm`}>{item.step}</div>
                        <div>
                          <h4 className="font-black text-sm text-slate-800 flex items-center gap-2 mb-1">{item.title}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowMigrationGuide(false)}
                    className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Démarrer mon audit <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setShowMigrationGuide(true)} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Cible de Migration</h2>
                </div>

                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Applications à remplacer ({myApps.size})</h3>
                    {myApps.size > 0 && <button onClick={() => setMyApps(new Set())} className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all"><Trash2 size={12}/> Vider</button>}
                </div>

                <div className="space-y-4">
                  {filteredApps.map((app) => {
                    const idealAlt = getIdealAlternative(app.category);
                    return (
                      <div key={app.id} className="space-y-2">
                        {/* Carte App Risquée */}
                        <div onClick={() => setSelectedApp(app)} className="bg-white rounded-t-2xl border-x border-t border-slate-100 p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all relative z-10">
                          <div className={`${app.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner`}>{app.icon}</div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-black text-sm truncate">{app.name}</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <ScoreIndicator grade={app.grade} />
                            <button onClick={(e) => toggleMyApp(e, app.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                                <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Rendu de l'Alternative Idéale liée */}
                        {idealAlt && (
                          <div 
                            onClick={() => setSelectedApp(idealAlt)}
                            className="bg-emerald-50 rounded-b-2xl border-x border-b border-emerald-100 p-3 flex items-center justify-between cursor-pointer hover:bg-emerald-100 transition-all animate-in slide-in-from-top-2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-white p-1 rounded-full shadow-sm">
                                <ArrowRight size={14} className="text-emerald-500" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-800">Alternative :</span>
                                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                                  <span className="text-sm">{idealAlt.icon}</span>
                                  <span className="text-[11px] font-bold text-emerald-700">{idealAlt.name}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#006837] text-white px-2 py-0.5 rounded-md font-black text-[9px] uppercase">Grade A</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {myApps.size === 0 && (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2rem] p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-bold text-sm">Votre audit est vide.<br/>Sélectionnez des apps à remplacer.</p>
                      <button onClick={() => setActiveTab("top")} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest">Explorer</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Globe size={12} /> {activeTab === "top" ? "Référentiel Mondial" : "Pépites Souveraines"}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">MAJ: {lastSync}</div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Chercher une application..." 
                className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredApps.length > 0 ? filteredApps.map((app, index) => (
                <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="text-[10px] font-black text-slate-300 w-4">{index + 1}</div>
                  <div className={`${app.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner`}>{app.icon}</div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-sm truncate">{app.name}</h3>
                        {app.trend === "up" ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-400" />}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreIndicator grade={app.grade} />
                    <button 
                      onClick={(e) => toggleMyApp(e, app.id)} 
                      className={`p-2 rounded-full transition-all ${myApps.has(app.id) ? 'bg-indigo-100 text-indigo-600 scale-110 shadow-sm' : 'text-slate-200 hover:text-indigo-400 hover:bg-slate-50'}`}
                      title={myApps.has(app.id) ? "Retirer de la sélection" : "Ajouter à ma cible de remplacement"}
                    >
                        {myApps.has(app.id) ? <CheckCircle size={20} /> : <PlusCircle size={20} />}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Search size={32} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Aucune application trouvée</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* NAVIGATION BASSE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-4 px-6 max-w-md mx-auto flex justify-around z-40 rounded-t-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab("top")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "top" ? "text-slate-900 scale-110" : "text-slate-300"}`}>
          <Trophy size={24} strokeWidth={3} />
          <span className="text-[8px] font-black uppercase tracking-widest">Classement</span>
        </button>
        <button onClick={() => setActiveTab("alt")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "alt" ? "text-emerald-600 scale-110" : "text-slate-300"}`}>
          <Globe size={24} strokeWidth={3} />
          <span className="text-[8px] font-black uppercase tracking-widest">Alternatives</span>
        </button>
        <button onClick={() => setActiveTab("my_apps")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "my_apps" ? "text-indigo-600 scale-110" : "text-slate-300"}`}>
          <div className="relative">
            <Zap size={24} strokeWidth={3} />
            {myApps.size > 0 && <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{myApps.size}</span>}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Audit</span>
        </button>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;
