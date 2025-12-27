import React from 'react';
import { Car, AlertTriangle, Clock, Signal } from 'lucide-react';
import { LaneStatus } from '../types';

interface LaneCardProps {
  lane: LaneStatus;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const LaneCard: React.FC<LaneCardProps> = ({ lane, position }) => {
  const isGreen = lane.status === 'green';
  
  // Dynamic positioning styles with improved offsets for cleaner look
  const positionClasses = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-[120%]',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[120%]',
    left: 'left-0 top-1/2 -translate-y-1/2 -translate-x-[120%]',
    right: 'right-0 top-1/2 -translate-y-1/2 translate-x-[120%]',
  };

  return (
    <div className={`
      absolute ${positionClasses[position]} 
      w-44 
      backdrop-blur-sm ${lane.isEmergency ? 'bg-red-950/10' : 'bg-slate-900/80'}
      border ${lane.isEmergency ? 'border-red-500/30' : 'border-slate-700/50'}
      rounded-xl shadow-2xl 
      p-3.5 
      transition-all duration-500 ease-out
      ${lane.isEmergency ? 'ring-2 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'hover:border-slate-600'}
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
             {lane.id.replace('_', ' ')}
           </span>
           <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{lane.label}</span>
        </div>
        
        {/* Status Indicator */}
        <div className={`
          flex items-center justify-center w-6 h-6 rounded-full shadow-inner
          ${isGreen ? 'bg-emerald-500/10' : 'bg-red-500/10'}
        `}>
          <div className={`w-2.5 h-2.5 rounded-full ${isGreen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} animate-pulse`} />
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-end justify-between gap-2">
        
        {/* Vehicle Count */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-medium mb-0.5">Queue</span>
          <div className="flex items-center gap-1.5 text-slate-200">
             <Car className="w-3.5 h-3.5 text-slate-400" />
             <span className="text-xl font-bold leading-none">{lane.vehicleCount}</span>
          </div>
        </div>

        {/* Timer / Emergency */}
        <div className="flex flex-col items-end">
           {lane.isEmergency ? (
             <div className="flex items-center gap-1 text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
               <AlertTriangle className="w-3 h-3 animate-bounce" />
               <span className="text-[10px] font-bold uppercase">Emerg.</span>
             </div>
           ) : (
             <>
               <span className="text-[10px] text-slate-500 font-medium mb-0.5">Timer</span>
               <div className={`flex items-center gap-1.5 ${isGreen ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-lg font-mono font-bold leading-none">{lane.timer}s</span>
               </div>
             </>
           )}
        </div>
      </div>

      {/* Progress Bar (Visual Timer) */}
      <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${isGreen ? 'bg-emerald-500' : 'bg-slate-700'}`}
          style={{ width: isGreen ? `${(lane.timer / 60) * 100}%` : '0%' }}
        />
      </div>

    </div>
  );
};

export default LaneCard;