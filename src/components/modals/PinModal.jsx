import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { API_URL } from '../../utils/apiConfig';

const PinModal = ({ isOpen, onClose, onSuccess, userEmail }) => {
  const [step, setStep] = useState('sending'); // 'sending' | 'otp' | 'error'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(''); // erreur bloquante (non autorisé)
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    // Reset
    setStep('sending');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setAuthError('');
    setIsVerifying(false);
    // Envoyer le code automatiquement à l'ouverture
    sendCode();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendCode = async () => {
    if (!userEmail) {
      setAuthError('Vous devez être connecté pour accéder à l\'administration.');
      setStep('error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setAuthError(data.error || 'Accès non autorisé');
        setStep('error');
      }
    } catch {
      setAuthError('Erreur de connexion au serveur.');
      setStep('error');
    }
  };

  const handleChange = (index, value) => {
    const digits = value.replace(/\D/g, '');

    if (!digits) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      setError('');
      return;
    }

    // Plusieurs chiffres d'un coup (collage non intercepté par onPaste sur
    // certains claviers mobiles, suggestion d'autofill…) : on les répartit
    // à partir de la case courante au lieu de tronquer à 1 caractère.
    const newOtp = [...otp];
    let pos = index;
    for (const d of digits) {
      if (pos > 5) break;
      newOtp[pos] = d;
      pos++;
    }
    setOtp(newOtp);
    setError('');
    inputRefs.current[Math.min(pos, 5)]?.focus();
    const code = newOtp.join('');
    if (code.length === 6) verifyCode(code);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
      verifyCode(pasted);
    }
  };

  const verifyCode = async (code) => {
    if (code.length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/verify-admin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, code }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.token);
        onClose();
      } else {
        setError(data.error || 'Code incorrect');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCode(otp.join(''));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
          <X size={18} />
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Accès administrateur</h2>
          {step === 'otp' && (
            <p className="text-sm text-slate-500">
              Code envoyé à <span className="font-semibold text-slate-700">{userEmail}</span>
            </p>
          )}
        </div>

        {/* Envoi en cours */}
        {step === 'sending' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500">Envoi du code…</p>
          </div>
        )}

        {/* Saisie OTP */}
        {step === 'otp' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={isVerifying}
                  className={`w-11 py-3 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none disabled:opacity-50 ${
                    error
                      ? 'border-rose-400 bg-rose-50 text-rose-800'
                      : digit
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 hover:border-indigo-300 focus:border-indigo-500'
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-center text-xs font-semibold text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={isVerifying || otp.join('').length !== 6}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isVerifying
                ? <><Loader2 size={16} className="animate-spin" /> Vérification…</>
                : 'Déverrouiller'}
            </button>

            <p className="text-center text-xs text-slate-400">
              <button type="button" onClick={sendCode} className="text-indigo-400 hover:text-indigo-600 underline transition-colors">
                Renvoyer le code
              </button>
            </p>
          </form>
        )}

        {/* Erreur bloquante (non autorisé) */}
        {step === 'error' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-rose-600 font-semibold">{authError}</p>
            <button onClick={onClose} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinModal;
