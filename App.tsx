import React, { useState } from 'react';
import { LaneId } from './types';
import ControlPanel from './components/ControlPanel';
import { AppHeader } from './components/AppHeader';
import { MainView } from './components/MainView';
import { INITIAL_LANES } from './config/trafficConfig';
import { useTrafficSimulation } from './hooks/useTrafficSimulation';
import { useTrafficCycle } from './hooks/useTrafficCycle';
import { useTrafficLogs } from './hooks/useTrafficLogs';
import { useRouteInsights } from './hooks/useRouteInsights';
import { createTrafficHandlers } from './utils/trafficHandlers';

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

  // Use custom hooks for traffic logic
  useTrafficSimulation(lanes, setLanes);
  useTrafficCycle(lanes, setLanes);
  useTrafficLogs(lanes, addLog);
  useRouteInsights(lanes, setBestRoute, setGeminiInsight);

  // Create traffic handlers
  const handlers = createTrafficHandlers(lanes, activeLaneId, setLanes, addLog);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 flex flex-col font-sans">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <AppHeader bestRoute={bestRoute} />

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
  );
}

export default App;