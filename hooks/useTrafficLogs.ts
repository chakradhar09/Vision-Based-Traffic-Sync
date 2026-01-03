import { useEffect, useRef } from 'react';
import { LaneStatus, LaneId } from '../types';
import { INITIAL_LANES } from '../config/trafficConfig';

/**
 * Hook to log traffic signal changes and emergency events
 */
export function useTrafficLogs(
  lanes: LaneStatus[],
  addLog: (message: string) => void
) {
  const prevGreenLaneRef = useRef<LaneId>('lane_1');
  const prevEmergencyRef = useRef<string | null>(null);

  // Log signal changes
  useEffect(() => {
    const currentGreen = lanes.find(l => l.status === 'green');
    if (currentGreen && currentGreen.id !== prevGreenLaneRef.current) {
      addLog(`Signal Change: Green for ${currentGreen.label} (${currentGreen.vehicleCount} cars).`);
      prevGreenLaneRef.current = currentGreen.id;
    }
  }, [lanes, addLog]);

  // Log emergency clearance
  useEffect(() => {
    const currentEmergency = lanes.find(l => l.isEmergency);
    if (prevEmergencyRef.current && (!currentEmergency || currentEmergency.id !== prevEmergencyRef.current)) {
      const label = INITIAL_LANES.find(l => l.id === prevEmergencyRef.current)?.label || prevEmergencyRef.current;
      addLog(`System: Emergency cleared at ${label}.`);
    }
    prevEmergencyRef.current = currentEmergency ? currentEmergency.id : null;
  }, [lanes, addLog]);
}




