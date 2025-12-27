import React, { useState, useEffect } from 'react';
import { LaneId } from './types';
import ControlPanel from './components/ControlPanel';
import { AppHeader } from './components/AppHeader';
import { MainView } from './components/MainView';
import ErrorBoundary from './components/ErrorBoundary';
import { INITIAL_LANES } from './config/trafficConfig';
import { useTrafficSimulation } from './hooks/useTrafficSimulation';
import { useTrafficCycle } from './hooks/useTrafficCycle';
import { useTrafficLogs } from './hooks/useTrafficLogs';
import { useRouteInsights } from './hooks/useRouteInsights';
import { useAmbulancePosition } from './hooks/useAmbulancePosition';
import { createTrafficHandlers } from './utils/trafficHandlers';
import { initFirebase } from './services/firebaseConfig';

function App() {
  const [lanes, setLanes] = useState(INITIAL_LANES);
  const [activeLaneId, setActiveLaneId] = useState<LaneId>('lane_1');
  const [logs, setLogs] = useState<string[]>([
    'System initialized.',
    'Connected to GHMC Traffic Grid.',
  ]);
  const [bestRoute, setBestRoute] = useState<string>('Calculating...');
  const [geminiInsight, setGeminiInsight] = useState<string>(
    'Analyzing traffic patterns for optimal routing...'
  );
  const [viewMode, setViewMode] = useState<'junction' | 'map'>('junction');

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };

  // Initialize Firebase on app startup
  useEffect(() => {
    const firebase = initFirebase();
    if (firebase) {
      addLog('✅ Firebase connected. Incident reports will be saved to database.');
    } else {
      addLog('⚠️ Firebase not configured. Running in demo mode (reports logged locally only).');
    }
  }, []);

  // Use custom hooks for traffic logic
  useTrafficSimulation(lanes, setLanes);
  useAmbulancePosition(lanes, setLanes); // Sync ambulance position to lane state
  useTrafficCycle(lanes, setLanes);
  useTrafficLogs(lanes, addLog);
  useRouteInsights(lanes, setBestRoute, setGeminiInsight);

  // Create traffic handlers
  const handlers = createTrafficHandlers(lanes, activeLaneId, setLanes, addLog);

  // Check for active emergency vehicle
  const emergencyLane = lanes.find(lane => lane.isEmergency);
  const emergencyTimeRemaining = emergencyLane?.timer || 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 flex flex-col font-sans">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <AppHeader 
          bestRoute={bestRoute} 
          emergencyLane={emergencyLane} 
          emergencyTimeRemaining={emergencyTimeRemaining} 
        />

        {emergencyLane && (
          <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-center py-1 text-sm font-semibold animate-pulse-slow z-40 shadow-lg">
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg animate-bounce">🚨</span>
              Priority Corridor: <span className="font-bold underline">{emergencyLane.label}</span> • Signal Override Active
            </span>
          </div>
        )}

        <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-8 lg:p-12 grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-16 items-start relative z-10">
          <MainView
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            lanes={lanes}
            geminiInsight={geminiInsight}
          />

          <div className="flex flex-col h-full lg:sticky lg:top-28">
            <ControlPanel
              statusLog={logs}
              selectedLaneId={activeLaneId}
              onSelectLane={setActiveLaneId}
              onAddTraffic={handlers.handleAddTraffic}
              onClearLane={handlers.handleClearLane}
              onToggleEmergency={handlers.handleToggleEmergency}
              onReportIncident={handlers.handleReportIncident}
              lanes={lanes}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;