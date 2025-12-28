import { useEffect } from 'react';
import React from 'react';
import { LaneStatus, LaneId } from '../types';
import { TRAFFIC_CONFIG, calculateGreenTime } from '../config/trafficConfig';

/**
 * Hook to manage adaptive traffic cycle logic
 */
export function useTrafficCycle(
  lanes: LaneStatus[],
  setLanes: React.Dispatch<React.SetStateAction<LaneStatus[]>>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      setLanes(prevLanes => {
        const currentGreen = prevLanes.find(l => l.status === 'green');
        const emergencyLane = prevLanes.find(l => l.isEmergency);

        // Emergency priority handling
        if (emergencyLane) {
          // Ensure emergency lane is green and all other lanes are red
          if (emergencyLane.status !== 'green') {
            return prevLanes.map(l => ({
              ...l,
              status: l.id === emergencyLane.id ? 'green' : 'red',
              timer: l.id === emergencyLane.id ? TRAFFIC_CONFIG.EMERGENCY_GREEN_TIME : 0
            }));
          }
          
          // Ensure all non-emergency lanes are red during emergency
          const hasNonEmergencyGreen = prevLanes.some(l => l.id !== emergencyLane.id && l.status === 'green');
          if (hasNonEmergencyGreen) {
            return prevLanes.map(l => ({
              ...l,
              status: l.id === emergencyLane.id ? 'green' : 'red',
              timer: l.id === emergencyLane.id ? l.timer : 0
            }));
          }
          
          // If ambulance is at front, set timer to 10 seconds and hold it there
          if (emergencyLane.ambulanceAtFront === true) {
            // Always reset timer to 10 when ambulance is at front and hold it there
            // This ensures the timer stays at 10 for the full 10-second stop duration
            // Don't decrement - just keep it at 10 while ambulance is stopped at front
            return prevLanes.map(l =>
              l.id === emergencyLane.id ? { ...l, timer: 10 } : { ...l, status: 'red', timer: 0 }
            );
          }
          
          // Only decrement emergency timer when ambulance is NOT at front
          // This allows normal countdown after the 10-second stop period
          // But ensure we don't go below 0
          if (emergencyLane.timer > 0) {
            return prevLanes.map(l =>
              l.id === emergencyLane.id 
                ? { ...l, timer: Math.max(0, l.timer - TRAFFIC_CONFIG.TIMER_REDUCTION_RATE) }
                : { ...l, status: 'red', timer: 0 }
            );
          }
          
          // Timer expired - clear emergency
          return prevLanes.map(l => {
            if (l.id === emergencyLane.id) {
              return { 
                ...l, 
                isEmergency: false, 
                timer: TRAFFIC_CONFIG.EMERGENCY_CLEARANCE_TIMER,
                vehicleCount: Math.max(0, l.vehicleCount - 1) // Remove emergency vehicle
              };
            }
            return l;
          });
        }

        // Normal cycle logic - only run if no emergency is active
        // If no green signal, assign to busiest lane
        if (!currentGreen) {
          const busiest = [...prevLanes].sort((a, b) => b.vehicleCount - a.vehicleCount)[0];
          return prevLanes.map(l => ({
            ...l,
            status: l.id === busiest.id ? 'green' : 'red',
            timer: l.id === busiest.id ? calculateGreenTime(busiest.vehicleCount) : 0
          }));
        }

        // Early switch if current green has no cars and others are waiting
        const othersWaiting = prevLanes.some(
          l => l.id !== currentGreen.id && l.vehicleCount > 0
        );
        
        if (
          currentGreen.vehicleCount === 0 &&
          othersWaiting &&
          currentGreen.timer > TRAFFIC_CONFIG.MIN_TIMER_BEFORE_SWITCH
        ) {
          return prevLanes.map(l =>
            l.id === currentGreen.id ? { ...l, timer: TRAFFIC_CONFIG.MIN_TIMER_BEFORE_SWITCH } : l
          );
        }

        // Decrement timer if > 1
        if (currentGreen.timer > 1) {
          return prevLanes.map(l => ({
            ...l,
            timer: Math.max(0, l.timer - TRAFFIC_CONFIG.TIMER_REDUCTION_RATE)
          }));
        }

        // Timer expired - switch to next lane
        const candidates = prevLanes.filter(l => l.id !== currentGreen.id);
        const allCandidatesEmpty = candidates.every(l => l.vehicleCount === 0);
        
        let nextLane: LaneStatus;
        
        if (allCandidatesEmpty) {
          // If all empty, either extend current green or cycle
          if (currentGreen.vehicleCount > 0) {
            return prevLanes.map(l =>
              l.id === currentGreen.id ? { ...l, timer: TRAFFIC_CONFIG.DEFAULT_EXTEND_TIMER } : l
            );
          }
          
          // Cycle to next lane in order
          const currentIndex = TRAFFIC_CONFIG.LANE_ORDER.indexOf(currentGreen.id as LaneId);
          const nextIndex = (currentIndex + 1) % TRAFFIC_CONFIG.LANE_ORDER.length;
          const nextLaneId = TRAFFIC_CONFIG.LANE_ORDER[nextIndex];
          nextLane = prevLanes.find(l => l.id === nextLaneId)!;
        } else {
          // Choose busiest candidate
          nextLane = candidates.sort((a, b) => b.vehicleCount - a.vehicleCount)[0];
        }

        const duration = calculateGreenTime(nextLane.vehicleCount);

        return prevLanes.map(l => ({
          ...l,
          status: l.id === nextLane.id ? 'green' : 'red',
          timer: l.id === nextLane.id ? duration : 0
        }));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setLanes]);
}

