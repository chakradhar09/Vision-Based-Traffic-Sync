import React from 'react';
import { Activity, MapPin, AlertTriangle } from 'lucide-react';
import { LaneStatus } from '../types';

interface AppHeaderProps {
  bestRoute: string;
  emergencyLane?: LaneStatus;
  emergencyTimeRemaining?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ bestRoute, emergencyLane, emergencyTimeRemaining = 0 }) => {
  return (
    <header className={`border-b ${emergencyLane ? 'border-red-500/50 bg-gradient-to-r from-red-950/40 via-slate-900/60 to-red-950/40' : 'border-slate-800 bg-slate-900/60'} backdrop-blur-xl sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-lg transition-all duration-300 ${emergencyLane ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-red-900/40 animate-pulse' : 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-900/20'}`}>
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Vision-Based Traffic Sync</h1>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${emergencyLane ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                  GHMC / Cyberabad Grid Online
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {/* Emergency Indicator - Integrated into Header */}
            {emergencyLane && (
              <div className="flex items-center gap-3 px-4 py-2 bg-red-600/20 border-2 border-red-500/50 rounded-lg backdrop-blur-sm">
                <div className="relative">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping"></div>
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-bold text-red-300 uppercase tracking-wider">Emergency Active</div>
                  <div className="text-sm font-black text-white tabular-nums">
                    {Math.ceil(emergencyTimeRemaining)}s
                  </div>
                </div>
              </div>
            )}
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
        {/* Emergency Details Bar - Below main header */}
        {emergencyLane && (
          <div className="mt-3 pt-3 border-t border-red-500/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-xl animate-bounce">🚨</span>
                <span className="font-bold">Priority Corridor:</span>
                <span className="font-black text-yellow-300 text-base">{emergencyLane.label}</span>
                <span className="text-xs text-red-400 font-medium">• Signal Override Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

