import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const CONFIG = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon_cls: 'text-emerald-500', ttl: 3000 },
  error:   { icon: XCircle,      bar: 'bg-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-800',    icon_cls: 'text-rose-500',    ttl: 5000 },
  info:    { icon: Info,          bar: 'bg-indigo-500',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-800',  icon_cls: 'text-indigo-500',  ttl: 4000 },
};

function ToastItem({ toast, onRemove }) {
  const c = CONFIG[toast.type] || CONFIG.info;
  const Icon = c.icon;
  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg overflow-hidden ${c.bg} ${c.border} ${c.text} min-w-[260px] max-w-xs`}
      style={{ animation: 'toastIn 0.22s ease-out' }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar}`} />
      <Icon size={17} className={`flex-shrink-0 mt-0.5 ${c.icon_cls}`} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity -mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), CONFIG[type]?.ttl ?? 3000);
  }, [remove]);

  const toast = useMemo(() => ({
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
  }), [add]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
