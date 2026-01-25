import React, { useState, useMemo } from 'react';
import { 
  Trophy, Star, Search, ShieldCheck, ChevronLeft, Globe, Lock, 
  ShieldQuestion, ArrowRight, Code, Database, ListChecks, 
  Download, Share2, Rocket, ShieldAlert, Unlock 
} from 'lucide-react';

// --- COMPOSANTS UI ---

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

// --- APPLICATION PRINCIPALE ---

const App = () => {
  const [activeTab, setActiveTab] = useState("top"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set());
  const [selectedApp, setSelectedApp] = useState(null);
  
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

  if (selectedApp) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
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
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedApp.reason}</p>
            </section>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Globe size={20} /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Infrastructure</p><p className="text-sm font-bold text-slate-700">{selectedApp.details.infra}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Code size={20} /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Code</p><p className="text-sm font-bold text-slate-700">{selectedApp.details.code}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Database size={20} /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Données</p><p className="text-sm font-bold text-slate-700">{selectedApp.details.data}</p></div>
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedApp(null)} className="w-full mt-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Fermer</button>
        </main>
      </div>
    );
  }

  if (activeTab === "guide_e_a") {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
        <header className="px-4 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setActiveTab("my_apps")} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={24} /></button>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Guide de Migration</span>
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
          </div>
          <div className="space-y-4">
            {[
              { step: "1", title: "Export des données", desc: "Récupérez vos contacts et messages via les outils d'exportation.", icon: <Download size={20} /> },
              { step: "2", title: "Installation de l'Alternative A", desc: "Installez Signal ou Proton et vérifiez les réglages.", icon: <Rocket size={20} /> },
              { step: "3", title: "Migration de l'entourage", desc: "Invitez vos contacts sur la nouvelle plateforme.", icon: <Share2 size={20} /> },
              { step: "4", title: "Suppression du compte E", desc: "Demandez l'effacement de vos données via le RGPD.", icon: <ShieldAlert size={20} /> }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black">{item.icon}</div>
                <div><h4 className="font-black text-sm text-slate-800 mb-1">{item.step}. {item.title}</h4><p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p></div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab("my_apps")} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Retour</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-1 rounded-full border border-slate-100"><TrustiLogo className="w-10 h-10" /></div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">TrustiScore</h1>
              <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">Souveraineté Numérique</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-full border border-indigo-100"><ShieldQuestion size={16} /><span className="text-[9px] font-black uppercase tracking-wider">Aide</span></div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {activeTab === "my_apps" && (
          <div className="grid grid-cols-1 gap-3 mb-8">
            <button onClick={() => setActiveTab("guide_e_a")} className="w-full p-5 bg-white border border-slate-100 text-slate-800 rounded-[2rem] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><ListChecks size={20} /></div>
                <div className="text-left"><p className="font-black text-sm uppercase tracking-wider">Procédure E → A</p><p className="text-[10px] font-medium text-slate-400">Guide de migration</p></div>
              </div>
              <ArrowRight size={20} className="text-slate-300" />
            </button>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
              <div className={`${app.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner`}>{app.icon}</div>
              <div className="flex-grow min-w-0"><h3 className="font-black text-sm truncate">{app.name}</h3><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.category}</p></div>
              <div className="flex items-center gap-4">
                <ScoreIndicator grade={app.grade} />
                <button onClick={(e) => toggleMyApp(e, app.id)} className={`p-2 rounded-full ${myApps.has(app.id) ? 'text-pink-500' : 'text-slate-200'}`}><Star size={20} fill={myApps.has(app.id) ? "currentColor" : "none"} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-4 px-6 max-w-md mx-auto flex justify-around z-40 rounded-t-3xl shadow-lg">
        <button onClick={() => setActiveTab("top")} className={`flex flex-col items-center gap-1 ${activeTab === "top" ? "text-blue-600" : "text-slate-300"}`}><Trophy size={24} /><span className="text-[8px] font-black uppercase">Market</span></button>
        <button onClick={() => setActiveTab("alt")} className={`flex flex-col items-center gap-1 ${activeTab === "alt" ? "text-emerald-600" : "text-slate-300"}`}><Globe size={24} /><span className="text-[8px] font-black uppercase">Alternatives</span></button>
        <button onClick={() => setActiveTab("my_apps")} className={`flex flex-col items-center gap-1 ${activeTab === "my_apps" || activeTab === "guide_e_a" ? "text-pink-600" : "text-slate-300"}`}><div className="relative"><Star size={24} />{myApps.size > 0 && <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{myApps.size}</span>}</div><span className="text-[8px] font-black uppercase">Mes apps</span></button>
      </nav>
    </div>
  );
};

export default App;
