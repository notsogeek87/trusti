import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { API_URL } from '../../utils/apiConfig';

const RESEND_COOLDOWN = 60; // secondes

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendCooldown(0);
    clearInterval(cooldownRef.current);
  }, [isOpen]);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  if (!isOpen) return null;

  // ── Email step ─────────────────────────────────────────────────────────────

  const sendOtp = async (emailToUse) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        startCooldown();
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Adresse email invalide');
      return;
    }
    await sendOtp(trimmed);
  };

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── OTP step ───────────────────────────────────────────────────────────────

  const handleOtpChange = (index, value) => {
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
    if (code.length === 6) verifyOtp(code);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      verifyOtp(pasted);
    }
  };

  const verifyOtp = async (code) => {
    if (code.length !== 6) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
        clearInterval(cooldownRef.current);
        if (onLogin) onLogin(data.email);
        setTimeout(() => onClose(), 1500);
      } else {
        setError(data.error || 'Code incorrect');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    verifyOtp(otp.join(''));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
          <X size={18} />
        </button>

        {/* ── Étape 1 : email ── */}
        {step === 'email' && (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Connexion</h2>
              <p className="text-sm text-slate-500">Recevez un code à 6 chiffres par email</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="vous@exemple.fr"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
                  autoFocus
                  disabled={isLoading}
                />
                {error && <p className="text-xs text-rose-600 mt-1.5 font-semibold">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Envoi en cours…</>
                  : 'Recevoir le code'
                }
              </button>
            </form>
          </>
        )}

        {/* ── Étape 2 : OTP ── */}
        {step === 'otp' && (
          <>
            <button
              onClick={() => { setStep('email'); setError(''); }}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Code reçu ?</h2>
              <p className="text-sm text-slate-500">
                Code envoyé à <span className="font-semibold text-slate-700">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-5">
              {/* 6 cases OTP */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    disabled={isLoading}
                    className={`w-11 h-13 py-3 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none disabled:opacity-50 ${
                      error
                        ? 'border-rose-400 bg-rose-50 text-rose-800'
                        : digit
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 hover:border-indigo-300 focus:border-indigo-500'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-xs font-semibold text-rose-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Vérification…</>
                  : 'Se connecter'
                }
              </button>

              {/* Renvoyer le code */}
              <p className="text-center text-xs text-slate-400">
                {resendCooldown > 0
                  ? `Renvoyer dans ${resendCooldown}s`
                  : (
                    <button
                      type="button"
                      onClick={() => sendOtp(email.trim().toLowerCase())}
                      className="text-indigo-500 hover:text-indigo-700 font-semibold underline transition-colors"
                    >
                      Renvoyer le code
                    </button>
                  )
                }
              </p>
            </form>
          </>
        )}

        {/* ── Étape 3 : succès ── */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Connecté !</h2>
            <p className="text-sm text-slate-500">Bienvenue sur TrustiScore</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
