import React from 'react';
import { LayoutGrid, Map as MapIcon, Zap } from 'lucide-react';
import { LaneStatus } from '../types';
import Intersection from './Intersection';
import TrafficMap from './TrafficMap';

interface MainViewProps {
  viewMode: 'junction' | 'map';
  onViewModeChange: (mode: 'junction' | 'map') => void;
  lanes: LaneStatus[];
  geminiInsight: string;
}

export const MainView: React.FC<MainViewProps> = ({
  viewMode,
  onViewModeChange,
  lanes,
  geminiInsight,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-[calc(100vh-140px)] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative w-full max-w-2xl flex flex-col items-center">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 mb-6 backdrop-blur-md z-20">
          <button
            onClick={() => onViewModeChange('junction')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'junction'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Junction View
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Live Map
          </button>
        </div>

        {/* Main Display Area */}
        {viewMode === 'junction' ? (
          <Intersection lanes={lanes} />
        ) : (
          <div className="w-full h-[500px] sm:h-[600px] max-w-2xl animate-in fade-in duration-300">
            <TrafficMap />
          </div>
        )}
        
        {/* Gemini AI Insights */}
        <div className="mt-8 w-full max-w-xl">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-4 flex gap-4 items-start shadow-xl">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
                Gemini AI Insights
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {geminiInsight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

