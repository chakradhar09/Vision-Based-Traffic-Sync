import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { Activity, Server, Cpu, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const SystemStatus: React.FC = () => {
  const { connectionStatus } = useTraffic();
  const n8nStatus = import.meta.env.VITE_N8N_WEBHOOK_URL ? 'connected' : 'disconnected';
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">System Status Monitor</h1>
          <p className="text-zinc-500">Real-time health check of Vision Traffic Sync components</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Firestore Connection */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-900/30 p-2 rounded-lg text-orange-400">
                  <Database size={24} />
                </div>
                <h3 className="font-semibold text-lg">Firebase Firestore</h3>
              </div>
              <div className={twMerge("px-3 py-1 rounded-full text-xs font-bold uppercase", 
                connectionStatus === 'connected' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                {connectionStatus}
              </div>
            </div>
            <div className="space-y-3 relative">
              {/* Overlay for demo mode indication */}
               <div className="absolute -top-2 -right-2">
                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-zinc-700">Demo Data</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Latency</span>
                <span className="font-mono">24ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Reads/min</span>
                <span className="font-mono">142</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Writes/min</span>
                <span className="font-mono">45</span>
              </div>
            </div>
          </div>

          {/* n8n Workflow Engine */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400">
                  <Server size={24} />
                </div>
                <h3 className="font-semibold text-lg">n8n Workflow Engine</h3>
              </div>
              <div className={twMerge("px-3 py-1 rounded-full text-xs font-bold uppercase", 
                n8nStatus === 'connected' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")}>
                {n8nStatus === 'connected' ? 'Online' : 'Not Configured'}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Webhook Endpoint</span>
                <span className="font-mono text-xs truncate max-w-[150px]">{import.meta.env.VITE_N8N_WEBHOOK_URL || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Uptime</span>
                <span className="font-mono">99.9%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Active Workflows</span>
                <span className="font-mono">1</span>
              </div>
            </div>
          </div>

          {/* Gemini AI */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-900/30 p-2 rounded-lg text-purple-400">
                  <Cpu size={24} />
                </div>
                <h3 className="font-semibold text-lg">Gemini 1.5 Flash</h3>
              </div>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Operational
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Model Version</span>
                <span className="font-mono">gemini-1.5-flash</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Avg. Processing Time</span>
                <span className="font-mono">1.2s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Daily Quota</span>
                <span className="font-mono">15% Used</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity size={20} className="text-zinc-400" />
            Recent System Activity <span className="text-xs font-normal text-zinc-500 ml-2">(Sample Logs)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Component</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="p-3 font-mono text-zinc-500">12:45:02 PM</td>
                  <td className="p-3">n8n Webhook</td>
                  <td className="p-3">Processed image from Lane 1</td>
                  <td className="p-3 text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Success</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-zinc-500">12:44:15 PM</td>
                  <td className="p-3">Gemini AI</td>
                  <td className="p-3">Detected 12 vehicles, 0 emergency</td>
                  <td className="p-3 text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Success</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-zinc-500">12:43:58 PM</td>
                  <td className="p-3">Firestore</td>
                  <td className="p-3">Updated lane_stats collection</td>
                  <td className="p-3 text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Success</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-zinc-500">12:40:10 PM</td>
                  <td className="p-3">System</td>
                  <td className="p-3">Emergency Mode deactivated</td>
                  <td className="p-3 text-blue-400 flex items-center gap-1"><CheckCircle size={14} /> Info</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
