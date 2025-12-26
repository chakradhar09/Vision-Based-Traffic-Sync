import { useEffect } from 'react';
import React from 'react';
import { LaneStatus } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';

/**
 * Hook to simulate traffic flow in the background
 */
export function useTrafficSimulation(
  lanes: LaneStatus[],
  setLanes: React.Dispatch<React.SetStateAction<LaneStatus[]>>
) {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const simulateTraffic = () => {
      setLanes(prevLanes => {
        return prevLanes.map(lane => {
          let newCount = lane.vehicleCount;
          let isEmergency = lane.isEmergency;
          let timer = lane.timer;

          if (lane.status === 'green') {
            // Calculate outflow when green
            const outflow = Math.floor(
              Math.random() * (TRAFFIC_CONFIG.OUTFLOW_MAX - TRAFFIC_CONFIG.OUTFLOW_MIN + 1)
            ) + TRAFFIC_CONFIG.OUTFLOW_MIN;
            
            // Handle emergency clearance
            if (isEmergency && outflow > 0 && newCount > 0) {
              isEmergency = false;
              timer = TRAFFIC_CONFIG.EMERGENCY_CLEARANCE_TIMER;
            }

            newCount = Math.max(TRAFFIC_CONFIG.MIN_VEHICLE_COUNT, newCount - outflow);
            
            // Occasionally add a vehicle even on green
            if (!isEmergency && Math.random() > TRAFFIC_CONFIG.ADDITIONAL_VEHICLE_PROBABILITY) {
              newCount += 1;
            }
          } else {
            // Add vehicles when red (inflow)
            if (!lane.isEmergency) {
              const inflow = Math.random() > TRAFFIC_CONFIG.INFLOW_PROBABILITY ? 1 : 0;
              const burst = Math.random() > TRAFFIC_CONFIG.BURST_PROBABILITY ? 1 : 0;
              newCount = Math.min(
                TRAFFIC_CONFIG.MAX_VEHICLE_COUNT,
                newCount + inflow + burst
              );
            }
          }
          
          return { ...lane, vehicleCount: newCount, isEmergency, timer };
        });
      });

      const nextDelay = Math.floor(
        Math.random() * (TRAFFIC_CONFIG.MAX_SIMULATION_DELAY - TRAFFIC_CONFIG.MIN_SIMULATION_DELAY)
      ) + TRAFFIC_CONFIG.MIN_SIMULATION_DELAY;
      timeoutId = setTimeout(simulateTraffic, nextDelay);
    };

    timeoutId = setTimeout(simulateTraffic, TRAFFIC_CONFIG.INITIAL_SIMULATION_DELAY);
    return () => clearTimeout(timeoutId);
  }, [setLanes]);
}

