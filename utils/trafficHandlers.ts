import React from 'react';
import { LaneStatus, LaneId } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';

/**
 * Handler functions for traffic control actions
 */
export function createTrafficHandlers(
  lanes: LaneStatus[],
  activeLaneId: LaneId,
  setLanes: React.Dispatch<React.SetStateAction<LaneStatus[]>>,
  addLog: (message: string) => void
) {
  return {
    handleAddTraffic: (amount: number) => {
      setLanes(prev => prev.map(l => {
        if (l.id === activeLaneId) {
          addLog(`Sensor: Detected +${amount} vehicles on ${l.label}.`);
          return { ...l, vehicleCount: l.vehicleCount + amount };
        }
        return l;
      }));
    },

    handleClearLane: () => {
      setLanes(prev => prev.map(l => {
        if (l.id === activeLaneId) {
          addLog(`Admin: Reset queue for ${l.label}.`);
          return { ...l, vehicleCount: 0 };
        }
        return l;
      }));
    },

    handleReportIncident: (type: string) => {
      const laneLabel = lanes.find(l => l.id === activeLaneId)?.label;
      addLog(`USER REPORT: Citizen reported ${type} on ${laneLabel}. Alerting TSRTC.`);
    },

    handleToggleEmergency: () => {
      setLanes(prev => {
        const targetLane = prev.find(l => l.id === activeLaneId);
        const isActivating = !targetLane?.isEmergency;

        if (isActivating) {
          addLog(`🚨 108 AMBULANCE DETECTED: Priority corridor for ${targetLane?.label}.`);
        } else {
          addLog(`System: Emergency cleared for ${targetLane?.label}.`);
        }

        return prev.map(l => {
          if (l.id === activeLaneId) {
            if (!isActivating && l.status === 'green') {
              return { ...l, isEmergency: false, timer: TRAFFIC_CONFIG.EMERGENCY_CLEARANCE_TIMER };
            }
            const newCount = isActivating ? l.vehicleCount + 1 : l.vehicleCount;
            return { ...l, isEmergency: isActivating, vehicleCount: newCount };
          }
          if (isActivating && l.isEmergency) {
            return { ...l, isEmergency: false };
          }
          return l;
        });
      });
    },
  };
}

