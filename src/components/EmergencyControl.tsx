import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { AlertOctagon, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const EmergencyControl: React.FC = () => {
  const { emergencyMode, toggleEmergency } = useTraffic();
  const isActive = emergencyMode?.isActive || false;

  const handleToggle = () => {
    toggleEmergency(!isActive);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 shadow-xl">
      <div className="flex items-center gap-3 text-zinc-400">
        <ShieldAlert size={24} />
        <h2 className="text-lg font-semibold uppercase tracking-wider">Emergency Control System</h2>
      </div>
      
      <button
        onClick={handleToggle}
        className={twMerge(
          "relative group w-full max-w-md py-6 px-8 rounded-xl font-bold text-2xl tracking-widest transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-4 border-2",
          isActive 
            ? "bg-red-600 border-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse" 
            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-500"
        )}
      >
        <AlertOctagon size={32} className={isActive ? "animate-spin-slow" : ""} />
        {isActive ? "EMERGENCY ACTIVE" : "ACTIVATE EMERGENCY"}
      </button>

      {isActive && (
        <div className="text-red-500 font-mono text-sm mt-2 animate-bounce">
          ⚠️ ALL SIGNALS OVERRIDDEN TO RED ⚠️
        </div>
      )}
    </div>
  );
};
