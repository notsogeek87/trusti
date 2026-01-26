import React, { useState } from 'react';
import { X, User, LogIn } from 'lucide-react';

/**
 * Modal de connexion pour saisir le pseudonyme
 */
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Veuillez entrer un pseudonyme');
      return;
    }

    if (username.trim().length < 3) {
      setError('Le pseudonyme doit contenir au moins 3 caractères');
      return;
    }

    const success = onLogin(username);
    if (success) {
      setUsername('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Bienvenue sur TrustiScore
          </h2>
          <p className="text-sm text-slate-600">
            Choisissez un pseudonyme pour sauvegarder vos choix d'applications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">
              Pseudonyme
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Ex: Jean123"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-600 mt-2 font-semibold">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Continuer
          </button>

          <p className="text-xs text-slate-500 text-center">
            Vos données sont sauvegardées localement sur votre appareil
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
