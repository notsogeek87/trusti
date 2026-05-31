import React, { useState, useRef, useEffect } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

const PinModal = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setLockoutSeconds(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => clearInterval(countdownRef.current);
  }, [isOpen]);

  const startCountdown = (seconds) => {
    setLockoutSeconds(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!pin.trim() || isLoading || lockoutSeconds > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/admin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        setPin('');
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Code incorrect');
        setPin('');
        if (data.retryAfter > 0) {
          startCountdown(data.retryAfter);
        }
        inputRef.current?.focus();
      }
    } catch {
      setError('Erreur de connexion. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isBlocked = lockoutSeconds > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Accès administrateur
          </h2>
          <p className="text-sm text-slate-500">
            Saisissez votre code PIN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(''); }}
            placeholder="Code PIN"
            disabled={isLoading || isBlocked}
            className={`w-full px-4 py-3 text-center text-xl font-bold tracking-widest border-2 rounded-2xl transition-all focus:outline-none ${
              error
                ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-500'
                : 'border-slate-200 focus:border-indigo-500 hover:border-indigo-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          {error && (
            <p className="text-center text-sm font-semibold text-rose-600">
              {isBlocked ? `${error} (${lockoutSeconds}s)` : error}
            </p>
          )}

          <button
            type="submit"
            disabled={!pin.trim() || isLoading || isBlocked}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading
              ? <><Loader2 size={18} className="animate-spin" /> Vérification…</>
              : isBlocked
              ? `Bloqué (${lockoutSeconds}s)`
              : 'Déverrouiller'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinModal;
