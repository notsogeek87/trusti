import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

/**
 * Modal pour saisir le code PIN admin (6 chiffres)
 */
const PinModal = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const CORRECT_PIN = '170623';

  useEffect(() => {
    if (isOpen) {
      // Reset au montage
      setPin(['', '', '', '', '', '']);
      setError('');
      // Focus sur le premier input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Accepter seulement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Prendre seulement le dernier chiffre
    setPin(newPin);
    setError('');

    // Auto-focus sur le prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Vérifier automatiquement quand les 6 chiffres sont saisis
    if (index === 5 && value) {
      const enteredPin = newPin.join('');
      if (enteredPin === CORRECT_PIN) {
        onSuccess();
        onClose();
      } else {
        setError('Code incorrect');
        setTimeout(() => {
          setPin(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 1000);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      inputRefs.current[5]?.focus();
      
      // Vérifier immédiatement
      if (pastedData === CORRECT_PIN) {
        onSuccess();
        onClose();
      } else {
        setError('Code incorrect');
        setTimeout(() => {
          setPin(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 1000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Code administrateur
          </h2>
          <p className="text-sm text-slate-600">
            Saisissez votre code PIN à 6 chiffres
          </p>
        </div>

        {/* PIN Input */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all ${
                error
                  ? 'border-rose-500 bg-rose-50 text-rose-900'
                  : digit
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 hover:border-indigo-300 focus:border-indigo-500'
              } focus:outline-none`}
            />
          ))}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-sm font-bold text-rose-600">{error}</p>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-center text-slate-400">
          Ce code débloque l'accès aux fonctionnalités d'administration
        </p>
      </div>
    </div>
  );
};

export default PinModal;
