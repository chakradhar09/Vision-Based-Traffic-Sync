import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { AlertOctagon, ShieldAlert } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const EmergencyControl: React.FC = () => {
  const { lanes, toggleEmergency } = useTraffic();
  const [isToggling, setIsToggling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Check if any lane has emergency detected
  const laneValues = Object.values(lanes);
  const isActive = laneValues.some(lane => lane.emergency_detected);
  const isEmpty = laneValues.length === 0;

  const handleToggle = async () => {
    if (isEmpty || isToggling) return;
    
    setError(null);
    try {
      setIsToggling(true);
      await toggleEmergency(!isActive);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to toggle emergency mode";
      console.error("Failed to toggle emergency:", error);
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 shadow-xl">
      <div className="flex items-center gap-3 text-zinc-400">
        <ShieldAlert size={24} />
        <h2 className="text-lg font-semibold uppercase tracking-wider">Emergency Control System</h2>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={isEmpty || isToggling}
        className={twMerge(
          "relative group w-full max-w-md py-6 px-8 rounded-xl font-bold text-2xl tracking-widest transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-4 border-2",
          isActive 
            ? "bg-red-600 border-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse" 
            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-500",
          (isEmpty || isToggling) && "opacity-50 cursor-not-allowed transform-none animate-none"
        )}
      >
        {isToggling ? (
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <AlertOctagon size={32} className={isActive ? "animate-spin-slow" : ""} />
        )}
        {isToggling ? "PROCESSING..." : isActive ? "EMERGENCY ACTIVE" : "ACTIVATE EMERGENCY"}
      </button>

      {isActive && !isToggling && (
        <div className="text-red-500 font-mono text-sm mt-2 animate-bounce">
          ⚠️ ALL SIGNALS OVERRIDDEN TO RED ⚠️
        </div>
      )}

      {error && (
        <div className="text-red-400 font-mono text-sm mt-2 bg-red-950/30 px-4 py-2 rounded-lg border border-red-900/50">
          ⚠️ Error: {error}
        </div>
      )}
    </div>
  );
};
