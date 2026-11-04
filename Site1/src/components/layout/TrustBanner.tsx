import React from 'react';
import { ShieldCheck, RefreshCw, Headphones, Star } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      desc: '100% secure payment',
      color: 'text-purple-600',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      desc: '30-day return policy',
      color: 'text-blue-600',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Dedicated support',
      color: 'text-indigo-600',
    },
    {
      icon: Star,
      title: 'Trusted by Thousands',
      desc: '4.8 average rating',
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {trustPoints.map((point, idx) => {
          const Icon = point.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${point.color}`} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 leading-tight">{point.title}</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">{point.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

