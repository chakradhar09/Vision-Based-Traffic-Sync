import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { LaneCard } from './LaneCard';
import { Loader2 } from 'lucide-react';

export const LaneGrid: React.FC = () => {
  const { lanes, connectionStatus } = useTraffic();
  const laneIds = ['lane1', 'lane2', 'lane3', 'lane4'];

  if (connectionStatus === 'connecting' && Object.keys(lanes).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-500">
        <Loader2 size={32} className="animate-spin" />
        <p>Connecting to Traffic Control System...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
      {laneIds.map((laneId) => {
        const lane = lanes[laneId];
        if (!lane) {
           // Fallback if lane data not yet available
           return (
             <div key={laneId} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center h-full shadow-xl animate-pulse">
               <div className="text-zinc-600">Waiting for {laneId} signal...</div>
             </div>
           );
        }
        return <LaneCard key={laneId} lane={lane} />;
      })}
    </div>
  );
};
