import React from 'react';
import { LaneGrid } from '../components/LaneGrid';
import { EmergencyControl } from '../components/EmergencyControl';
import { useTraffic } from '../context/TrafficContext';
import { Activity, Wifi, WifiOff } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { connectionStatus } = useTraffic();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Traffic Control Center</h1>
            <p className="text-zinc-500 text-sm">Real-time Intersection Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900 py-2 px-4 rounded-full border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
              {connectionStatus === 'connected' ? 'System Online' : 'System Offline'}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          {connectionStatus === 'connected' ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-red-500" />}
        </div>
      </header>

      <main className="space-y-8">
        <section>
          <EmergencyControl />
        </section>
        
        <section>
          <LaneGrid />
        </section>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-12 text-center text-zinc-600 text-sm py-6 border-t border-zinc-900">
        <p>Traffic Management Dashboard v1.0 • Authorized Personnel Only</p>
      </footer>
    </div>
  );
};
