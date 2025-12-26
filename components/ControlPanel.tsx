import React from 'react';
import { Activity, Zap, Plus, Trash2, Siren, Sliders, Monitor, AlertTriangle, User } from 'lucide-react';
import { LaneId, LaneStatus } from '../types';
import { LANE_CONFIG } from '../config/trafficConfig';

interface ControlPanelProps {
  statusLog: string[];
  selectedLaneId: LaneId;
  onSelectLane: (id: LaneId) => void;
  onAddTraffic: (amount: number) => void;
  onClearLane: () => void;
  onToggleEmergency: () => void;
  onReportIncident: (type: string) => void;
  lanes: LaneStatus[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  statusLog,
  selectedLaneId,
  onSelectLane,
  onAddTraffic,
  onClearLane,
  onToggleEmergency,
  onReportIncident,
  lanes
}) => {

  const lanesList = LANE_CONFIG;

  const selectedLaneData = lanes.find(l => l.id === selectedLaneId);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl w-full flex flex-col h-full max-h-[800px] overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-500" />
            Control Center
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/30 border border-blue-900/50">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-400 tracking-wider">LIVE FEED</span>
          </div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto custom-scrollbar space-y-8">
        
        {/* Section 1: Lane Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Monitor className="w-3.5 h-3.5" /> 
            Active Camera Feed
          </div>
          <div className="grid grid-cols-2 gap-3">
            {lanesList.map((lane) => {
               const laneInfo = lanes.find(l => l.id === lane.id);
               const isSelected = selectedLaneId === lane.id;
               return (
                <button
                  key={lane.id}
                  onClick={() => onSelectLane(lane.id)}
                  className={`relative group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Status Dot */}
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${laneInfo?.status === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />

                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold font-mono ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {lane.direction}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold mb-0.5 truncate max-w-[90px] ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {lane.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Vol: {laneInfo?.vehicleCount}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Crowd Sourcing Reporting (New for PRD) */}
        <div>
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <User className="w-3.5 h-3.5" />
                Citizen Reporting
             </div>
             <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/30 border border-indigo-900/50 px-1.5 py-0.5 rounded">
               Crowd Source Active
             </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onReportIncident('Accident')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-red-900/20 border border-slate-700 hover:border-red-500/50 rounded-lg transition-colors group"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-slate-400 group-hover:text-red-200">Accident</span>
            </button>
             <button 
              onClick={() => onReportIncident('Pothole / Road Work')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-amber-900/20 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors group"
            >
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-400 group-hover:text-amber-200">Road Work</span>
            </button>
          </div>
        </div>

        {/* Section 3: Traffic Controls */}
        <div>
           <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Activity className="w-3.5 h-3.5" />
                Simulate Conditions
           </div>
          <div className="bg-slate-800/30 rounded-xl p-1 border border-slate-800 grid grid-cols-2 gap-1">
            <button 
              onClick={() => onAddTraffic(1)}
              className="flex flex-col items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg py-4 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">+1 Vehicle</span>
            </button>
            <button 
              onClick={() => onAddTraffic(5)}
              className="flex flex-col items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg py-4 transition-all active:scale-95"
            >
              <div className="flex -space-x-1">
                 <Plus className="w-4 h-4 text-emerald-400" />
                 <Plus className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-300">+5 Vehicles</span>
            </button>
          </div>
        </div>

        {/* Section 4: Critical Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            Emergency Override
          </div>
          <div className="space-y-2">
             <button 
              onClick={onToggleEmergency}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 group ${
                selectedLaneData?.isEmergency 
                 ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                 : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-red-500/5 hover:border-red-500/50 hover:text-red-300'
              }`}
            >
              <span className="flex items-center gap-3">
                <Siren className={`w-5 h-5 ${selectedLaneData?.isEmergency ? 'animate-pulse' : ''}`} />
                {selectedLaneData?.isEmergency ? 'Deactivate Ambulance' : 'Simulate 108 Ambulance'}
              </span>
              <div className={`w-2 h-2 rounded-full ${selectedLaneData?.isEmergency ? 'bg-red-500' : 'bg-slate-600 group-hover:bg-red-500/50'}`} />
            </button>

            <button 
              onClick={onClearLane}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-transparent hover:bg-slate-800 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Lane Data
            </button>
          </div>
        </div>

      </div>

      {/* Terminal Logs */}
      <div className="mt-auto border-t border-slate-800 bg-black/40 p-4 min-h-[160px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GHMC Grid Log</span>
           <span className="text-[10px] font-mono text-slate-600">receiving...</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] custom-scrollbar max-h-[120px]">
          {statusLog.length === 0 && (
             <span className="text-slate-700 italic opacity-50">-- No active logs --</span>
          )}
          {statusLog.map((log, i) => (
            <div key={i} className="flex gap-2.5 items-start animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-slate-600 whitespace-nowrap opacity-60">
                {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
              </span>
              <span className={`break-words leading-relaxed ${
                log.includes('AMBULANCE') ? 'text-red-400 font-bold' : 
                log.includes('USER REPORT') ? 'text-amber-400' :
                log.includes('Signal') ? 'text-emerald-400' : 
                'text-slate-300'
              }`}>
                {log.includes('AMBULANCE') ? '> ' : ''}{log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;