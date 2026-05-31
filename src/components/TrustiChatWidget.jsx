import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

const TrustiChatWidget = ({ onOpenLandingPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Salut ! Je suis l\'assistant Trusti !',
      subtext: 'Je peux t\'aider à comprendre les TrustiScores et à choisir les meilleures applications pour ta vie privée.'
    }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const collapseTimer = useRef(null);

  // Auto-collapse after 5s
  useEffect(() => {
    collapseTimer.current = setTimeout(() => setIsCollapsed(true), 5000);
    return () => clearTimeout(collapseTimer.current);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(collapseTimer.current);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => setIsCollapsed(true), 2500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type, text, subtext = '') => {
    setMessages(prev => [...prev, { type, text, subtext }]);
  };

  const handleQuickReply = (question, answer, subtext = '') => {
    addMessage('user', question);
    setTimeout(() => {
      addMessage('bot', answer, subtext);
      setShowSuggestions(false);
    }, 500);
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed bottom-24 md:bottom-6 right-4 z-50 group transition-all duration-300"
          aria-label="Ouvrir l'assistant Trusti"
        >
          {isCollapsed ? (
            /* Pill compacte */
            <div className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white pl-2.5 pr-3.5 py-2 rounded-full shadow-lg transition-all duration-300 opacity-75 hover:opacity-100 hover:scale-105">
              <img
                src="/assets/trusti-gif.gif"
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs font-bold whitespace-nowrap">Aide</span>
            </div>
          ) : (
            /* GIF plein format (5 premières secondes ou au hover) */
            <div className="relative">
              <img
                src="/assets/trusti-gif.gif"
                alt="Assistant Trusti"
                className="w-14 h-14 rounded-full shadow-xl border-[3px] border-white transition-transform duration-200 group-hover:scale-110"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md">
                ?
              </div>
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shadow-xl">
                  Besoin d'aide ? 💬
                  <div className="absolute top-full right-4 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900" />
                </div>
              </div>
            </div>
          )}
        </button>
      )}

      {/* Panel de chat ouvert */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-6 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-indigo-100"
          style={{ animation: 'chatSlideUp 0.25s cubic-bezier(0.22,1,0.36,1)' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/trusti-gif.gif" alt="Assistant Trusti" className="w-10 h-10 rounded-full border-2 border-white" />
              <div>
                <h3 className="font-black text-base">Assistant Trusti</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  En ligne
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Corps du chat */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 mb-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'bot' && (
                  <img src="/assets/trusti-gif.gif" alt="Trusti" className="w-8 h-8 rounded-full shrink-0" />
                )}
                <div className={`flex-1 ${message.type === 'user' ? 'max-w-[80%]' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'bot'
                      ? 'bg-white rounded-tl-none'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none ml-auto'
                  }`}>
                    <p className={`text-sm font-medium ${message.type === 'bot' ? 'text-slate-800' : 'text-white'}`}>
                      {message.text}
                    </p>
                    {message.subtext && (
                      <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">{message.subtext}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestions */}
            <div className="mt-4 space-y-2">
              {showSuggestions ? (
                <>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Questions fréquentes</p>
                  <button
                    onClick={() => { setIsOpen(false); onOpenLandingPage?.(); }}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    🤔 Comment fonctionne le TrustiScore ?
                  </button>
                  <button
                    onClick={() => handleQuickReply(
                      '🔍 Comment trouver une alternative ?',
                      'C\'est simple ! Pour trouver une alternative plus respectueuse :',
                      '1️⃣ Clique sur une app avec une note D ou E\n2️⃣ Consulte la section "Alternatives recommandées"\n3️⃣ Tu y trouveras des apps notées A, B ou C !\n\n💡 Les alternatives sont proposées selon la catégorie.'
                    )}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    🔍 Comment trouver une alternative ?
                  </button>
                  <button
                    onClick={() => handleQuickReply(
                      '📱 Quelle différence entre A, B, C ?',
                      'Le TrustiScore va de A à E :',
                      '🌟 A = Excellent\n✅ B = Très bien\n👍 C = Bien\n⚠️ D = Attention\n❌ E = À éviter\n\nLes apps A, B et C sont nos TrustiApps recommandées !'
                    )}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    📱 Quelle différence entre A, B, C ?
                  </button>
                  <button
                    onClick={() => handleQuickReply(
                      '📧 Contacter l\'équipe Trusti',
                      'Pour toute question ou suggestion :',
                      '📧 Email : contact@trusti.app\n💬 Nous répondons généralement sous 24h !'
                    )}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    📧 Contacter l'équipe Trusti
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowSuggestions(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  💬 J'ai une autre question
                </button>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pose ta question..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:outline-none text-sm"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors">
                <MessageCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default TrustiChatWidget;
