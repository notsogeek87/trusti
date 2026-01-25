import React, { useState, useMemo } from 'react';
import { Trophy, Star, Search, ShieldCheck, ChevronLeft, Globe, Lock, Info, Sparkles, ShieldQuestion, ArrowRight, Zap, CheckCircle2, Unlock, ShieldAlert, Eye, Code, Database, ListChecks, Download, Share2, Rocket } from 'lucide-react';

// Composant Logo inspiré de l'image utilisateur
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
    <div className="flex items-center bg-slate-100 rounded-full p-0.5 h-8 w-32 relative overflow-hidden">
      {grades.map((g) => (
        <div 
          key={g} 
          className={`flex-1 h-full flex items-center justify-center transition-all duration-300 ${grade === g ? colors[g] + ' text-white scale-110 z-10 rounded-full shadow-md' : 'text-slate-400'}`}
        >
          <span className="text-[10px] font-black">{g}</span>
          {grade === g && (
            <div className="ml-0.5 opacity-80">
              {['A', 'B'].includes(g) ? <Lock size={8} /> : g === 'E' ? <Unlock size={8} /> : <Lock size={8} className="opacity-50" />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("top"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set());
  const [showLegend, setShowLegend] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  
  const scoreData = {
    A: { color: "bg-[#006837]", label: "Gold Standard", desc: "100 % européenne, open‑source, aucune collecte.", criteria: "• Serveurs UE.\n• Open-source.\n• Chiffrement total." },
    B: { color: "bg-[#8dc63f]", label: "Fiable", desc: "Européenne, open‑source, collecte limitée.", criteria: "• Serveurs UE.\n• Majorité Open-source.\n• Collecte technique uniquement." },
    C: { color: "bg-[#fbb03b]", label: "Modéré", desc: "Mixte UE, code partiellement ouvert.", criteria: "• Infrastructure hybride.\n• Code propriétaire audité.\n• Collecte fonctionnelle." },
    D: { color: "bg-[#f7931e]", label: "Risqué", desc: "Hors UE, code fermé, collecte importante.", criteria: "• Hébergé hors UE.\n• Code fermé.\n• Profilage publicitaire." },
    E: { color: "bg-[#c1272d]", label: "Alerte", desc: "Hors UE, source fermée, collecte opaque.", criteria: "• Totalement hors UE.\n• Aucune transparence.\n• Collecte massive." }
  };

  const allAppsData = useMemo(() => [
    { id: 1, name: "ChatGPT", category: "IA / Productivité", grade: "B", color: "bg-slate-800", icon: "🤖", reason: "Hébergé par OpenAI (USA) mais propose des options de confidentialité avancées.", details: { infra: "Hybride UE/USA", code: "Propriétaire", data: "Usage IA régulé" } },
    { id: 2, name: "Temu", category: "E-commerce", grade: "E", color: "bg-orange-600", icon: "🛍️", reason: "Collecte massive de données comportementales et opacité totale sur les métadonnées.", details: { infra: "Hors UE", code: "Fermé", data: "Collecte aggressive" } },
    { id: 3, name: "Wero", category: "Finance / Paiement", grade: "A", color: "bg-indigo-600", icon: "💳", reason: "Solution européenne souveraine, conforme RGPD stricte, serveurs 100% européens.", details: { infra: "100% UE", code: "Audité", data: "Zéro revente" } },
    { id: 4, name: "TikTok", category: "Réseaux Sociaux", grade: "E", color: "bg-black", icon: "📱", reason: "Transfert de données vers des juridictions non-équivalentes RGPD.", details: { infra: "Hors UE", code: "Fermé", data: "Profilage massif" } },
    { id: 5, name: "WhatsApp", category: "Communication", grade: "C", color: "bg-green-500", icon: "💬", reason: "Chiffrement de bout en bout mais partage de métadonnées avec Meta.", details: { infra: "Hybride", code: "Mixte", data: "Métadonnées collectées" } },
    { id: 6, name: "France Identité", category: "Service Public", grade: "A", color: "bg-blue-800", icon: "🇫🇷", reason: "Hébergement sécurisé en France, code audité par l'ANSSI.", details: { infra: "France", code: "Souverain", data: "Identité sécurisée" } },
    { id: 7, name: "Instagram", category: "Réseaux Sociaux", grade: "D", color: "bg-pink-600", icon: "📸", reason: "Exploitation commerciale des données visuelles à des fins de ciblage publicitaire.", details: { infra: "USA", code: "Fermé", data: "Publicité ciblée" } },
    { id: 10, name: "Doctolib", category: "Santé", grade: "A", color: "bg-blue-500", icon: "🩺", reason: "Données de santé hautement protégées, hébergement HDS en Europe.", details: { infra: "Europe (HDS)", code: "Propriétaire", data: "Données de santé" } },
    { id: 16, name: "Le Chat (Mistral)", category: "IA Française", grade: "A", color: "bg-orange-400", icon: "🐈", reason: "Alternative souveraine française respectant la confidentialité européenne.", details: { infra: "France/UE", code: "Ouvert/Audité", data: "Confidentialité UE" } },
    { id: 1001, name: "Signal", category: "Messagerie Chiffrée", grade: "A", color: "bg-blue-600", icon: "💬", reason: "Fondation à but non lucratif, code 100% open-source.", details: { infra: "Distribué", code: "Open Source", data: "Zéro métadonnées" } },
    { id: 1002, name: "Proton Mail", category: "Email Sécurisé", grade: "A", color: "bg-purple-700", icon: "📧", reason: "Juridiction Suisse, chiffrement zero-knowledge.", details: { infra: "Suisse", code: "Open Source", data: "Chiffré" } }
  ], []);

  const topApps = useMemo(() => allAppsData.filter(a => a.id < 100), [allAppsData]);
  const altApps = useMemo(() => allAppsData.filter(a => a.id >= 1000), [allAppsData]);

  const filteredApps = useMemo(() => {
    let list = activeTab === "top" ? topApps : activeTab === "alt" ? altApps : allAppsData.filter(app => myApps.has(app.id));
    return list.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, topApps, altApps, allAppsData, myApps, searchTerm]);

  const toggleMyApp = (e, id) => {
    e.stopPropagation();
    setMyApps(prev => {
      const newList = new Set(prev);
      if (newList.has(id)) newList.delete(id);
      else newList.add(id);
      return newList;
    });
  };

  // Vue détaillée de l'appli
  if (selectedApp) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 animate-in fade-in duration-300">
        <header className="px-4 py-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white z-50">
          <button onClick={() => setSelectedApp(null)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={24} /></button>
          <div className="flex flex-col items-center">
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Détails TrustiScore</div>
          </div>
          <button onClick={(e) => toggleMyApp(e, selectedApp.id)} className={`p-2 rounded-full ${myApps.has(selectedApp.id) ? 'text-pink-500' : 'text-slate-200'}`}>
             <Star size={24} fill={myApps.has(selectedApp.id) ? "currentColor" : "none"} />
          </button>
        </header>

        <main className="max-w-md mx-auto p-6">
          <div className="flex flex-col items-center mb-10">
            <div className={`${selectedApp.color} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mb-6`}>{selectedApp.icon}</div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">{selectedApp.name}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{selectedApp.category}</p>
            <ScoreIndicator grade={selectedApp.grade} size="large" />
          </div>

          <div className="space-y-8">
            <section className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-tight text-slate-800 mb-4">
                <ShieldCheck size={18} className="text-indigo-600" /> Analyse du score
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {selectedApp.reason}
              </p>
            </section>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Globe size={20} /></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Infrastructure</p>
                   <p className="text-sm font-bold text-slate-700">{selectedApp.details.infra}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Code size={20} /></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Ouverture du code</p>
                   <p className="text-sm font-bold text-slate-700">{selectedApp.details.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Database size={20} /></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Données</p>
                   <p className="text-sm font-bold text-slate-700">{selectedApp.details.data}</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setSelectedApp(null)} className="w-full mt-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
            Fermer
          </button>
        </main>
      </div>
    );
  }

  // Vue Procédure E vers A
  if (activeTab === "guide_e_a") {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 pb-24 animate-in slide-in-from-right duration-300">
        <header className="px-4 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setActiveTab("my_apps")} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={24} /></button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Guide de Migration</span>
          </div>
          <div className="w-8" />
        </header>
        <main className="max-w-md mx-auto p-6">
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-[#c1272d] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">E</div>
              <ArrowRight className="text-slate-300" />
              <div className="bg-[#006837] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">A</div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Objectif Souveraineté</h2>
            <p className="text-slate-500 font-medium text-sm">Comment quitter proprement les apps à risque.</p>
          </div>

          <div className="space-y-4">
            {[
              { step: "1", title: "Export des données", desc: "Utilisez les outils de 'Takeout' ou export CSV/JSON pour récupérer vos contacts, messages ou historiques.", icon: <Download size={20} /> },
              { step: "2", title: "Installation de l'Alternative A", desc: "Installez l'appli recommandée (ex: Signal ou Proton) et vérifiez les réglages de confidentialité.", icon: <Rocket size={20} /> },
              { step: "3", title: "Migration de l'entourage", desc: "Le plus dur ! Invitez vos contacts clés sur la nouvelle plateforme pour maintenir vos flux.", icon: <Share2 size={20} /> },
              { step: "4", title: "Suppression du compte E", desc: "Ne désinstallez pas simplement. Supprimez votre compte et demandez l'effacement des données via le RGPD.", icon: <ShieldAlert size={20} /> }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-black">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 mb-1">{item.step}. {item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-indigo-600 rounded-[2rem] text-white">
            <h4 className="font-black text-sm uppercase mb-2">Besoin d'aide ?</h4>
            <p className="text-xs text-indigo-100 font-medium mb-4">Nos guides détaillés par catégorie sont disponibles en ligne.</p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-wider">Accéder au wiki</button>
          </div>
        </main>
      </div>
    );
  }

  // Vue Plan de Bascule
  if (activeTab === "trustify") {
    const appsToUpgrade = allAppsData.filter(app => myApps.has(app.id) && ["C", "D", "E"].includes(app.grade));
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 animate-in slide-in-from-bottom duration-500">
        <header className="px-4 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setActiveTab("my_apps")} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={24} /></button>
          <div className="flex flex-col items-center">
            <TrustiLogo className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Trustification</span>
          </div>
          <div className="w-8" />
        </header>
        <main className="max-w-md mx-auto p-6">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <Zap size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Plan de Bascule</h2>
            <p className="text-slate-500 font-medium text-sm">Conseils pour passer à des solutions souveraines.</p>
          </div>
          <div className="space-y-6">
            {appsToUpgrade.length > 0 ? appsToUpgrade.map(app => (
              <div key={app.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50">
                  <span className="text-2xl">{app.icon}</span>
                  <div className="flex-grow font-black text-slate-800">{app.name}</div>
                  <div className="text-[9px] font-black uppercase text-orange-500">Risque {app.grade}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900">Voir les alternatives A</span>
                    <ArrowRight size={14} className="text-emerald-600" />
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-4" />
                <p className="font-black text-slate-800">Profil Trustifié à 100%</p>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Aucune bascule nécessaire</p>
              </div>
            )}
          </div>
          <button onClick={() => setActiveTab("my_apps")} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Retour</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Modal Légende */}
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
                  <div className={`${data.color} w-12 h-14 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-white shadow-sm ring-2 ring-white text-xl`}>{grade}</div>
                  <div className="flex-grow">
                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">{data.label}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">{data.desc}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold italic">{data.criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-1 rounded-full border border-slate-100"><TrustiLogo className="w-10 h-10" /></div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">TrustiScore</h1>
              <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">Souveraineté Numérique</span>
            </div>
          </div>
          <button 
            onClick={() => setShowLegend(true)} 
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-full border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
          >
            <ShieldQuestion size={16} />
            <span className="text-[9px] font-black uppercase tracking-wider">Comprendre le score</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {activeTab === "my_apps" && (
          <div className="grid grid-cols-1 gap-3 mb-8">
            <button 
              onClick={() => setActiveTab("trustify")} 
              className="w-full p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[2rem] shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Zap size={20} fill="currentColor" /></div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-wider">Plan de Bascule</p>
                  <p className="text-[10px] font-medium text-indigo-100">Conseils personnalisés</p>
                </div>
              </div>
              <ArrowRight size={20} />
            </button>

            <button 
              onClick={() => setActiveTab("guide_e_a")} 
              className="w-full p-5 bg-white border border-slate-100 text-slate-800 rounded-[2rem] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><ListChecks size={20} /></div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-wider">Procédure E → A</p>
                  <p className="text-[10px] font-medium text-slate-400">Guide de migration universel</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300" />
            </button>
          </div>
        )}

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

        <div className="space-y-3">
          {filteredApps.length > 0 ? filteredApps.map((app) => (
            <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
              <div className={`${app.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner`}>{app.icon}</div>
              <div className="flex-grow min-w-0">
                <h3 className="font-black text-sm truncate">{app.name}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <ScoreIndicator grade={app.grade} />
                <button onClick={(e) => toggleMyApp(e, app.id)} className={`p-2 rounded-full transition-all ${myApps.has(app.id) ? 'bg-pink-50 text-pink-500 scale-110' : 'text-slate-200 hover:text-pink-300'}`}>
                    <Star size={20} fill={myApps.has(app.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-slate-300">
               <Info size={40} className="mx-auto mb-4 opacity-20" />
               <p className="font-black uppercase text-[10px] tracking-widest">Aucune application trouvée</p>
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-4 px-6 max-w-md mx-auto flex justify-around z-40 rounded-t-3xl shadow-lg">
        <button onClick={() => {setActiveTab("top"); setSelectedApp(null);}} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "top" ? "text-blue-600 scale-110" : "text-slate-300"}`}>
          <Trophy size={24} strokeWidth={activeTab === "top" ? 3 : 2} />
          <span className="text-[8px] font-black uppercase tracking-widest">Market</span>
        </button>
        <button onClick={() => {setActiveTab("alt"); setSelectedApp(null);}} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "alt" ? "text-emerald-600 scale-110" : "text-slate-300"}`}>
          <Globe size={24} strokeWidth={activeTab === "alt" ? 3 : 2} />
          <span className="text-[8px] font-black uppercase tracking-widest">Alternatives</span>
        </button>
        <button onClick={() => {setActiveTab("my_apps"); setSelectedApp(null);}} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "my_apps" || activeTab === "trustify" || activeTab === "guide_e_a" ? "text-pink-600 scale-110" : "text-slate-300"}`}>
          <div className="relative">
            <Star size={24} strokeWidth={activeTab === "my_apps" || activeTab === "trustify" || activeTab === "guide_e_a" ? 3 : 2} />
            {myApps.size > 0 && <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{myApps.size}</span>}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Mes apps</span>
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
