import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle } from 'lucide-react';

// Détection de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

/**
 * Modal de connexion par Magic Link
 */
const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/send-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Error sending magic link:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setEmailSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        {!emailSent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Connexion par email
              </h2>
              <p className="text-sm text-slate-600">
                Recevez un lien de connexion sécurisé par email
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="vous@exemple.fr"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  autoFocus
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-xs text-rose-600 mt-2 font-semibold">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Envoyer le lien
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Un lien de connexion sécurisé sera envoyé à votre adresse email
              </p>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Email envoyé !
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Nous avons envoyé un lien de connexion à<br />
              <strong className="text-slate-900">{email}</strong>
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-900 font-semibold mb-2">
                📧 Consultez votre boîte mail
              </p>
              <p className="text-xs text-indigo-700">
                Le lien est valable pendant 15 minutes. Si vous ne le trouvez pas, vérifiez vos spams.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
