import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

/**
 * Widget de chat Trusti flottant en bas à droite
 */
const TrustiChatWidget = ({ onOpenLandingPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Salut ! Je suis l\'assistant Trusti !',
      subtext: 'Je peux t\'aider à comprendre les TrustiScores et à choisir les meilleures applications pour ta vie privée.'
    }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, text, subtext = '') => {
    setMessages(prev => [...prev, { type, text, subtext }]);
  };

  const handleQuickReply = (question, answer, subtext = '') => {
    // Ajouter la question de l'utilisateur
    addMessage('user', question);
    // Ajouter la réponse du bot après un court délai
    setTimeout(() => {
      addMessage('bot', answer, subtext);
      // Masquer les suggestions après la réponse
      setShowSuggestions(false);
    }, 500);
  };

  return (
    <>
      {/* Widget fermé - GIF animé */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 md:bottom-6 right-6 z-50 group"
          aria-label="Ouvrir l'assistant Trusti"
        >
          {/* Container avec animation de rebond */}
          <div className="relative animate-bounce-slow">
            {/* GIF Trusti */}
            <img
              src="/assets/trusti-gif.gif"
              alt="Assistant Trusti"
              className="w-20 h-20 rounded-full shadow-2xl border-4 border-white transition-transform group-hover:scale-110"
            />
            
            {/* Badge de notification */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg animate-pulse">
              ?
            </div>
            
            {/* Tooltip au survol */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-xl">
                Besoin d'aide ? Cliquez pour discuter ! 💬
                <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900"></div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Panel de chat ouvert */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-indigo-100 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/trusti-gif.gif"
                alt="Assistant Trusti"
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="font-black text-lg">Assistant Trusti</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  En ligne
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Corps du chat */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {/* Messages */}
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 mb-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'bot' && (
                  <img
                    src="/assets/trusti-gif.gif"
                    alt="Trusti"
                    className="w-10 h-10 rounded-full shrink-0"
                  />
                )}
                <div className={`flex-1 ${message.type === 'user' ? 'max-w-[80%]' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'bot' 
                      ? 'bg-white rounded-tl-none' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none ml-auto'
                  }`}>
                    <p className={`text-sm font-medium ${message.type === 'bot' ? 'text-slate-800 mb-2' : 'text-white'}`}>
                      {message.text}
                    </p>
                    {message.subtext && (
                      <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">
                        {message.subtext}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestions rapides */}
            <div className="mt-6 space-y-2">
              {showSuggestions ? (
                <>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                    Questions fréquentes :
                  </p>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenLandingPage) onOpenLandingPage();
                    }}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    🤔 Comment fonctionne le TrustiScore ?
                  </button>
                  <button 
                    onClick={() => handleQuickReply(
                      '🔍 Comment trouver une alternative ?',
                      'C\'est simple ! Pour trouver une alternative plus respectueuse de ta vie privée :',
                      '1️⃣ Clique sur une app avec une note D ou E\n2️⃣ Consulte la section "Alternatives recommandées"\n3️⃣ Tu y trouveras des apps notées A, B ou C qui font la même chose !\n\n💡 Les alternatives sont automatiquement proposées selon la catégorie de l\'app.'
                    )}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    🔍 Comment trouver une alternative ?
                  </button>
                  <button 
                    onClick={() => handleQuickReply(
                      '📱 Quelle différence entre A, B, C ?',
                      'Le TrustiScore va de A à E pour évaluer le respect de ta vie privée :',
                      '🌟 A = Excellent - Parfait pour ta vie privée\n✅ B = Très bien - Fortement recommandé\n👍 C = Bien - Un bon choix\n⚠️ D = Moyen - Attention aux données\n❌ E = À éviter - Risques importants\n\nLes apps A, B et C sont nos "TrustiApps" recommandées !'
                    )}
                    className="w-full bg-white hover:bg-indigo-50 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-300"
                  >
                    📱 Quelle différence entre A, B, C ?
                  </button>
                  <button 
                    onClick={() => handleQuickReply(
                      '📧 Contacter l\'équipe Trusti',
                      'Tu peux nous contacter pour toute question, suggestion ou signalement :',
                      '📧 Email : contact@trusti.app\n🌐 Site : https://trusti.app\n💬 Nous répondons généralement sous 24h !\n\nN\'hésite pas à nous faire part de tes retours, ils nous aident à améliorer Trusti pour tout le monde ! 🚀'
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
            
            {/* Élément invisible pour auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pose ta question..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:outline-none text-sm"
              />
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrustiChatWidget;
