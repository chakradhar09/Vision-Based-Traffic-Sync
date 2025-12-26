import React from 'react';
import { LaneGrid } from '../components/LaneGrid';
import { EmergencyControl } from '../components/EmergencyControl';
import { useTraffic } from '../context/TrafficContext';
import { Activity, Wifi, WifiOff, BarChart3, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

export const Dashboard: React.FC = () => {
  const { connectionStatus } = useTraffic();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vision Traffic Sync</h1>
            <p className="text-zinc-500 text-sm">AI-Powered Intersection Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Navigation Tabs */}
           <div className="bg-zinc-900 rounded-lg p-1 border border-zinc-800 flex mr-4">
            <Link 
              to="/" 
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                location.pathname === '/' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link 
              to="/status" 
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                location.pathname === '/status' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <BarChart3 size={16} /> System Status
            </Link>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900 py-2 px-4 rounded-full border border-zinc-800">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                {connectionStatus === 'connected' ? 'Live Sync' : 'Offline'}
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            {connectionStatus === 'connected' ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-red-500" />}
          </div>
        </div>
      </header>

      <main className="space-y-8">
        <section>
          <EmergencyControl />
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto px-1">
             <h2 className="text-lg font-semibold text-zinc-300">Live Traffic Feeds</h2>
             <div className="text-xs text-zinc-500 font-mono">
                AI Model: Gemini 1.5 Flash • Refresh: Real-time
             </div>
          </div>
          <LaneGrid />
        </section>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-12 text-center text-zinc-600 text-sm py-6 border-t border-zinc-900">
        <p>Vision Traffic Sync v2.0 • Powered by Gemini AI & n8n</p>
      </footer>
    </div>
  );
};
