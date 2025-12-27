import React from 'react';
import { LaneStatus, LaneId } from '../types';
import { IncidentType } from '../types/incident';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import { logger } from './logger';
import { saveIncidentReport } from '../services/reportService';

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

    handleReportIncident: async (type: IncidentType) => {
      const laneLabel = lanes.find(l => l.id === activeLaneId)?.label || 'Unknown Lane';
      const message = `USER REPORT: Citizen reported ${type} on ${laneLabel}. Alerting TSRTC.`;
      
      // Log to system logs
      addLog(message);
      logger.info('Incident reported', { type, laneId: activeLaneId, laneLabel });
      
      // Save to Firebase Firestore
      try {
        const saved = await saveIncidentReport(type, activeLaneId, laneLabel);
        if (saved) {
          logger.info('Incident report saved to Firebase', {
            type,
            laneId: activeLaneId,
            laneLabel,
          });
        } else {
          logger.warn('Incident report saved locally only (Firebase not configured)', {
            type,
            laneId: activeLaneId,
          });
        }
      } catch (error) {
        logger.error('Error saving incident report', error, {
          component: 'trafficHandlers',
          function: 'handleReportIncident',
        });
      }
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
            // When activating emergency, set timer to EMERGENCY_GREEN_TIME and ensure lane is green
            return { 
              ...l, 
              isEmergency: isActivating, 
              vehicleCount: newCount,
              timer: isActivating ? TRAFFIC_CONFIG.EMERGENCY_GREEN_TIME : l.timer,
              status: isActivating ? 'green' : l.status
            };
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

