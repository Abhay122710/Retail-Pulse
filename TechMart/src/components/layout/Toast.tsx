import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="glass-card px-4 py-3 rounded-xl border border-cyan-500/40 text-slate-100 flex items-center gap-3 shadow-2xl shadow-cyan-500/20">
        <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
        <span className="text-xs font-semibold">{toastMessage}</span>
      </div>
    </div>
  );
};
