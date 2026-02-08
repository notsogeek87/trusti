import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

// Détection de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3001/api';

/**
 * Composant pour vérifier le token Magic Link et connecter l'utilisateur
 */
const VerifyAuth = ({ onLogin }) => {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const hasVerified = useRef(false); // Flag pour éviter les doubles appels

  useEffect(() => {
    // Si déjà vérifié, ne rien faire
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      // Récupérer le token depuis l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setError('Token manquant');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/verify-token?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setEmail(data.email);
          // Connecter l'utilisateur
          const loginSuccess = onLogin(data.email);
          if (loginSuccess) {
            setStatus('success');
            // Nettoyer l'URL
            window.history.replaceState({}, '', '/');
            // Rediriger après 2 secondes
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            setStatus('error');
            setError('Erreur lors de la connexion');
          }
        } else {
          setStatus('error');
          setError(data.error || 'Token invalide');
        }
      } catch (error) {
        console.error('Verify token error:', error);
        setStatus('error');
        setError('Erreur de connexion au serveur');
      }
    };

    verifyToken();
  }, []); // Pas de dépendances pour n'exécuter qu'une fois

  if (status === 'verifying') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Vérification en cours...
          </h2>
          <p className="text-sm text-slate-600">
            Nous vérifions votre lien de connexion
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Connexion réussie !
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Bienvenue <strong className="text-slate-900">{email}</strong>
          </p>
          <div className="animate-pulse text-sm text-slate-500">
            Redirection en cours...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Erreur de connexion
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {error}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <X size={20} />
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyAuth;
