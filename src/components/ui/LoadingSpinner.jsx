import React from 'react';

const LoadingSpinner = ({
  message = "Chargement...",
  size = "medium",
}) => {
  const sizes = {
    small:  { container: "py-6",  dot: "w-2 h-2",   text: "text-xs", gap: "gap-1.5" },
    medium: { container: "py-12", dot: "w-3 h-3",   text: "text-sm", gap: "gap-2"   },
    large:  { container: "py-16", dot: "w-4 h-4",   text: "text-base", gap: "gap-2.5" },
  };

  const s = sizes[size] || sizes.medium;

  return (
    <div className={`flex flex-col items-center justify-center ${s.container}`}>
      <div className={`flex items-center ${s.gap} mb-5`}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className={`${s.dot} rounded-full bg-indigo-500 opacity-80`}
            style={{
              animation: `trusti-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <p className={`text-slate-500 font-medium tracking-wide ${s.text}`}>{message}</p>

      <style>{`
        @keyframes trusti-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
