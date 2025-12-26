import React from 'react';
import { Activity, MapPin } from 'lucide-react';

interface AppHeaderProps {
  bestRoute: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ bestRoute }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2.5 rounded-xl shadow-lg shadow-indigo-900/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Hyderabad Traffic Sync</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                GHMC / Cyberabad Grid Online
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-right">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
              Fastest Route
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900 px-2 py-1 rounded">
              Via {bestRoute}
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-slate-400 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-red-500" />
            IT Corridor
          </div>
        </div>
      </div>
    </header>
  );
};

